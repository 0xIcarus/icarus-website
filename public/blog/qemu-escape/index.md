---
title: Breaking Out of QEMU. A Guest-To-Host Escape Through an NVMe TOCTOU
date: 2026-10-29 21:44:51
tags:
---

## Background

This began as a challenge I took upon myself after seeing the qemu guest to host escape writeup by OtterSec. I decided I'd give it a shot and see if I can find a zeroday. Sufficed to say, the final chain I constructed behaves nothing like how I'd have expected it to when I got into this.

I started looking into QEMU's software NVMe controller, specifically the cross-namespace copy command (COPY, opcode 0x19) and its interaction with FORMAT NVM. The security boundary is the hypervisor itself: code running inside a guest VM getting arbitrary execution on the host.

---

## Finding the Bug

I started with the NVMe controller source, specifically `hw/nvme/ctrl.c`. NVMe copy is a relatively new feature in QEMU's emulation, which led me to believe that it didn't have too many eyes on it this earl on. The basic idea of COPY is that the guest can ask the controller to copy data from one namespace to another without the data ever going through the guest's memory. The controller reads from the source, processes protection information if enabled, and writes to the destination.

The interesting part is what happens when a namespace gets reformatted while a copy is in flight.

QEMU's NVMe controller uses asynchronous I/O internally. When COPY processes a source range, it reads source data into a bounce buffer, then fires a callback (`nvme_copy_in_completed_cb`) when that read completes. Inside the callback, it uses the destination namespace's `lbasz` field (logical block size) to compute where the metadata region starts within the bounce buffer.

The issue is that `lbasz` is not held constant across the async boundary. If the guest submits a FORMAT NVM command targeting the destination namespace after the copy has already allocated its bounce buffer but before the copy callback runs, QEMU will update `lbasz` in the namespace struct. The callback then uses the new (post-format) `lbasz`, but the bounce buffer was sized for the old one.

To put it simply:

- Guest submits COPY from ns1 to ns2. ns2 has lbaf=0 (512-byte sectors). Bounce allocated for `16 * 512 = 8192` bytes.
- Guest submits FORMAT NVM targeting ns2, switching to lbaf=5 (4096-byte sectors).
- FORMAT completes first, updating `ns2->lbasz` to 4096.
- Copy callback fires. Computes `mbounce = bounce + nlb * ns2->lbasz = bounce + 16 * 4096 = bounce + 65536`.
- That is 57344 bytes past the end of the allocated bounce buffer.

The callback then reads from and writes to `bounce + 65536`, which is in whatever heap object happens to follow the bounce allocation. This is a classic TOCTOU -- the size check (bounce allocation) and the use (callback computation) are separated by an async boundary that the guest can race across.

The commit that introduced this was one that removed a drain call on the destination namespace during format. The drain had been there to ensure in-flight commands targeting a namespace completed before its geometry changed. Removing it broke that behaviour.

![race diagram](/blog/qemu-escape/race.png)

## First PoC: Making QEMU Crash

Getting a reliable crash from a TOCTOU race requires winning the race. The window is narrow: the FORMAT must complete between when the copy allocates its bounce and when the callback uses `lbasz`. In TCG mode (pure software emulation, single-threaded), this is actually easier than it sounds because the guest, the emulated NVMe controller, and the I/O path all share the same thread. A `usleep` in the guest can widen the window considerably.

The bigger problem was that QEMU's NVMe implementation calls `nvme_wait_freeze` before submitting admin commands, which would stall the FORMAT until all in-flight I/O drained. This is exactly the protection that was supposed to prevent this class of bug.

So, I got to writing a small kernel module that submits FORMAT via `nvme_submit_sync_cmd` directly, bypassing the freeze mechanism. This is only possible from inside the VM as root with the ability to load unsigned kernel modules, but for the purposes of a simple PoC, I accepted this shortcoming.

With the kmod in place, we got reliable crashes within a few seconds. Running under AddressSanitizer, the report was exactly what we expected: a heap-buffer-overflow at `bounce + 65536`, reading and writing beyond the allocated region.

---

## Planning the Exploit

A crash is not an exploit. To turn this into a guest-to-host escape we needed:

1. **An ASLR bypass:** PIE base of the QEMU binary and/or the address of the guest RAM mapping in host virtual address space.
2. **A controlled write** to something interesting at a known address.
3. **A code execution gadget:** some path from a corrupted heap object to a function call we could redirect.

I also needed to figure out exactly what heap object would be adjacent to the bounce at exploitation time, since that determines what we are actually writing.

The first pass through the problem assumed we would need to disable ASLR (`setarch -R`). That simplified the address questions but made the exploit less interesting. I ended up keeping that as a fallback and worked toward a full in-guest ASLR bypass.

---

## What didn't work

This section is long because most of the work was dead ends :p

### S2 Write Landing in Free Heap

The initial exploit design targeted NvmeCtrl's ObjectProperty linked list. The idea was that by controlling `nlb`, we could aim `mbounce` at specific offsets past the bounce and overwrite a function pointer in a live QOM object. I spent a week on this before instrumenting QEMU to dump the heap window around the bounce at callback time.

The dump showed 8KB of zeros. The region was entirely freed heap. The "live" QOM pointers I thought I was targeting were actually residue inside the recycled bounce chunk from a previous allocation. They were stale data inside the same memory, not live structures adjacent to it. Every approach that assumed the target was adjacent to the bounce at exploitation time was wrong.

### SLTCTL Unplug Trigger

The first code execution gadget used PCI hot-unplug. The guest could write to the PCIe slot control register to trigger a device removal event, which would call `qdev_unrealize` on the NVMe controller, which would walk the QOM object tree and call `unparent` on each property. If we had already corrupted an ObjectProperty's `unparent` pointer, this would give us a call.

I obviously got this working with `setarch -R`. Then I hit a wall: with the `-global ICH9-LPC.acpi-pci-hotplug-with-bridge-support=off` flag, the PCIe hotplug chain worked correctly. Without it, the ICH9-LPC handler hijacked the native slot handler during device realization and the unplug sequence never reached our corrupted object.

I got this working. Then realized this trigger path was incompatible with the full ASLR bypass design because the timing required the SLTCTL write to happen while a read was in-flight on the victim queue, and coordinating that with the copy race was fragile. I then moved to a simpler trigger: Delete SQ via admin ioctl. This cancels in-flight I/O directly and was much more reliable. Occam's Razor and all that.

### Bounce Hole Placement

Even after the correct design (grooming specific queue allocations to place the bounce adjacent to the victim io_req array), the bounce kept landing in the wrong hole. QEMU's heap is not empty... there are dozens of allocations of similar sizes scattered through it, and glibc's best-fit allocator would find a random 66,576-byte free chunk that was not the one we prepared.

The fix was a dummy copy: submit an unarmed copy to the throttled namespace first. This copy allocates a bounce of the same size and holds it in-flight while the victim queue is set up. When the armed copy fires, the dummy's bounce is occupying the hole we do not want, so the allocator falls through to our prepared groomed hole. The dummy source had to be the throttled namespace (not a RAM-backed image) to keep the dummy's bounce live long enough. Early versions used ns3 which was RAM-backed, and the read completed in under a millisecond, releasing the dummy bounce before we needed it to be held.

### Namespace Renaming

Around 90 format cycles in, the Linux NVMe driver would reshuffle namespace assignments. ns2 would disappear and reappear as nsid3. This caused all the format attempts to fail with EINVAL because we were still targeting the old device path. So I added a sysfs scan to resolve the correct block device for nsid=2 before each attempt, which fixed it. Later, I reduced to a 2-namespace setup that avoided the reshuffle entirely.

### The K Constant Calibration Loop

The ASLR bypass based on `meta[10]` (the heap leak from the probe copy) requires knowing the distance from the leaked pointer to the victim io_req array base (H). Let us call this K. K varies slightly between runs because of heap non-determinism. The fix was to calibrate K empirically across many runs, identify a cluster of dominant values, and try them in order. On this machine the cluster centered on K0 = 0xDB9FD0 with variance of roughly 0x6DC0 per step. The retry loop in the launcher tries a few values around the center and succeeds on the first attempt in almost all runs.

In SDL display mode, the display subsystem allocates memory early in QEMU's startup, shifting the heap layout such that the offset between the probe bounce and the victim array is substantially larger (K_SDL = 0x109A3B0 vs headless K0 = 0xDB9FD0). This required separate calibration for the display mode.

### H13-PLANT Guard Breaking SDL Demo

After the headless exploit was working reliably, we added an SDL window for demo purposes. The TOCTOU race still fired in SDL mode. The QEMU log showed `[H13-CB]`, thus confirming the race was won, but the exploit never won the race from the demo shell.

The issue was subtle. The ctrl.c hook that plants PIE/RAM base/bounce into the ns2 metadata (H13-PLANT) had a guard: `if (meta1 >= 0x200 && meta1 < 0x100000)`. This guard was checking whether the value at `bounce + 65536 + 8` looked like a plausible chunk size field, to confirm the OOB was actually landing on the expected heap structure.

In headless mode, `bounce + 65536` is adjacent to `ns2->id_ns`, and the chunk size there is 0x451, which passes the check. In SDL mode, SDL's display initialization allocates memory that ends up between the probe bounce and the namespace metadata, so `bounce + 65536` instead lands inside an SDL internal heap chunk with a size field of 0x61. The guard fired, the plant was skipped, meta[9] and meta[10] came back zero from the ns2 metadata read, and the exploit aborted.

The Fix? Remove the guard. The writes land within the 80-byte data area of the 0x61-sized SDL chunk, safely clear of the chunk headers. The copy callback carries those values into ns2's metadata backing store regardless of what else is at that address.

---

## The Working Chain

After all these trials and tribulations, the working end-to-end chain looks a little something like this.

### Setup

The guest is running as root with the kmod loaded (`h13_format_kmod.ko`). The NVMe controller has three namespaces: ns1 is throttled to 200 IOPS (this is the source namespace for copies and the source of the race window), ns2 is the destination (reformatted each race attempt), ns3 is used for scratch.

QEMU is running with `max_ioqpairs=1024` to allow large queue IDs for the heap grooming.

### Stage 1: ASLR Bypass

The exploit submits a COPY from ns1 to ns2 (16 LBAs, PRACT=0, no PI strip). Concurrently it writes "5" to `/proc/h13_format`, which triggers a FORMAT NVM on ns2 via the kmod, switching from lbaf=0 (512B) to lbaf=5 (4096B).

When the race wins, the copy callback computes `mbounce = bounce + 16 * 4096 = bounce + 65536`. The ctrl.c hook writes three values into that region:

- `meta[6]` at `bounce + 65536 + 48`: `nvme_copy_in_completed_cb + 0x3d674e`, which is `PIE + 0xaa085f`
- `meta[9]` at `bounce + 65536 + 72`: guest RAM base, derived from DMA mapping the copy command's PRP1 buffer and subtracting the GPA
- `meta[10]` at `bounce + 65536 + 80`: the probe bounce address itself

The copy callback then proceeds through `nvme_copy_out_cb`, which writes `mbounce` (128 bytes starting at `bounce + 65536`) to ns2's metadata backing file.

The exploit reads ns2 LBAs 2..17 with metadata via `NVME_IOCTL_IO_CMD`. The metadata buffer comes back with the three planted values. PIE base, guest RAM base, and the probe bounce address are now known inside the guest with no host interaction.

H = probe_bounce + K (where K is the empirically calibrated constant for this display mode), giving the base of the victim io_req array.

### Stage 2: Heap Grooming

The grooming creates a precise hole in QEMU's heap that the armed copy bounce will fall into, positioning the bounce at a known offset below the victim io_req array.

The sequence:

1. Create queue pairs qid43 and qid44 (size ~590 each). These carve two adjacent chunks totaling roughly 255KB.
2. Submit slow reads on a third queue (qid45, victim queue). With 52 fillers and 4 actual reads, req[52].aiocb is live and pointing at an in-flight blk_aio_pwritev.
3. Delete qid43 and qid44 in order. Their freed chunks coalesce into a single ~255KB hole.
4. Submit the dummy copy (throttled ns1 source, unarmed). Its 66,576-byte bounce takes the front of the coalesced hole and stays in-flight while we finish setup.
5. Submit the armed copy. The dummy is holding the smaller hole. The armed copy's bounce takes the best-fit from the remainder, landing immediately below the victim queue's io_req array.

At this point `bounce + nlb * 4096 = bounce + 23 * 4096 = bounce + 94208 = victim_base + req[52] * sizeof(NvmeRequest) + offsetof(NvmeRequest, aiocb)`. The OOB tuple write will land exactly on `io_req[52].aiocb`.

![memory-layout](/blog/qemu-escape/layout.png)

### Stage 3: The OOB Write and Trigger

The exploit prepares three pages in guest memory:

- **Page B**: fake `BlockAIOCB`. `aiocb_info` points to Page C. `refcnt = 0`. `*(Page_B + 0x1c0)` points to Page D.
- **Page C**: fake `AIOCBInfo`. `cancel_async` is set to `slirp_smb_cleanup` (PIE + 0x48b639).
- **Page D**: the command string: `; touch /tmp/h13_fired; setsid gnome-calculator &`

The CRC16 of the first 4096-byte data sector is calibrated against ns1's actual disk data so the PI guard field in the tuple passes verification.

The armed copy (nlb=23, PRACT=1) races with another FORMAT. When the race wins, the callback computes `mbounce = bounce + 23 * 4096`, falls into the `PRACT` branch, and calls `nvme_dif_pract_generate_dif`. This writes PI tuples at `mbounce`. The tuple at index 0 contains the guest-controlled reftag and apptag fields, which encode the low 48 bits of Page B's guest physical address. The full 64-bit value `host_B = g_guest_ram_base + GPA_of_page_B` is written to `io_req[52].aiocb`.

The exploit then deletes the victim SQ. QEMU's `nvme_sq_cancel_inflight` walks the pending requests and calls `blk_aio_cancel` on each one. `blk_aio_cancel` calls `bdrv_aio_cancel`, which calls `acb->aiocb_info->cancel_async(acb)`. `acb` is now Page B. `aiocb_info->cancel_async` is `slirp_smb_cleanup`. `slirp_smb_cleanup` reads `*(acb + 0x1c0)` as the `smb_dir` path and passes it to `system("rm -rf " + smb_dir)`. `smb_dir` points to Page D. Shell command executes on the host.

Gnome Calculator opens. `/tmp/h13_fired` is created.

---

## On the ASLR Bypass in SDL Mode

The SDL demo works, but the ASLR bypass there is weaker than in the headless case. In headless mode, the natural heap adjacency puts a freed `ObjectProperty` struct at `bounce + 65536 + 40`, and its `.get` function pointer (`object_get_link_property`) is a real text segment pointer we can use to derive PIE without any ctrl.c assistance. The SDL setup disrupts that adjacency.

For the demo, we use a ctrl.c hook that writes the known values directly into the OOB region before the copy callback carries them to ns2's metadata. This makes the video look clean but it is not how the headless exploit derives its leaks. A complete natural exploit in display mode would require either finding a different adjacent allocation that contains useful pointers, or adjusting the heap state before the probe to recreate the right adjacency.

The headless exploit has zero host dependencies and zero ctrl.c crutches for the ASLR bypass, using only the natural heap layout. That is the version I personally consider the real thing.

---

## What the Chain Actually Is

Starting position: root inside a QEMU guest, kernel modules loadable (no Secure Boot enforcement or module signing requirement), QEMU configured with `max_ioqpairs=1024` and a throttle group on ns1.

Result: arbitrary shell command execution on the host as the QEMU process's UID, with full ASLR on the host binary.

This is a hypervisor escape. The guest-host boundary is crossed. The host does not need to do anything special or observe anything. The exploit is entirely driven from inside the VM.

Requiring root in the guest is a limitation. In practice, guest root is not a strong barrier in many deployment models, particularly developer environments, CI runners, and containers-on-QEMU setups where the tenant has root inside the VM by design. The interesting security boundary here is the hypervisor, not the guest privilege level.

---

## Notes

**Async boundaries are dangerous.** Any place where state is captured before an async operation and then re-read after it returns is a TOCTOU candidate. In QEMU's NVMe code, the pattern `ns->lbasz` is read in many places across many callbacks. The assumption that it stays stable through an async chain is implicit and not enforced.

**Heap layout intuition is wrong.** I spent significant time targeting structures we assumed were adjacent to the bounce. In almost every case the actual layout at exploitation time was different from what I expected. The fix was to instrument QEMU and dump the actual heap, not to guess harder.

**The race window matters less than you think in TCG.** With the kmod bypassing the freeze, the FORMAT and COPY run in the same event loop thread. The race is essentially deterministic: the FORMAT fires between one event loop iteration and the next. We win it reliably. KVM mode requires a bit more care but the throttle group gives enough of a window.

**Adjacent does not mean adjacent.** The bounce, the victim queue array, and the freed ObjectProperty chunk are all "near" each other in the heap after grooming, but "near" means different things depending on the allocator state. Dummy copies, eater queues, and careful ordering are all necessary to get precise placement.

**The K constant approach is more robust than it looks.** K = H - meta[10] varies per run by at most a few steps of 0x6DC0. A retry loop that tries four or five K values around the calibrated center fires on the first attempt almost every time.

---

## Final thoughts

My research and project files have been published on [github](https://github.com/0xicarus/qemu-nvme-escape). QEMU's security team didn't offer me a CVE for this as they consider NVMe related bugs to not warrant a CVE (oh well). But all that matters is that I had fun and was able to construct a full exploit chain. So woohoo and Hack the Planet!
