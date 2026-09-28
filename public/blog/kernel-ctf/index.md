---
title: From Nothing to Root. Hunting the kernelCTF $71k LPE
date: 2026-09-28 07:31:47
tags:
---

**Target:** `thejh/linux:slub-virtual-v7.2-rc5` (commit `699594e8`): Google kernelCTF hardened-v1 instance  
**Potential Prize:** $71,337: unclaimed at time of research  
**Goal:** Write `/tmp/pwned` as root from uid=1000, no capabilities  
**Result:** Working LPE. `/tmp/pwned` written.

## The Target

kernelCTF is Google's ongoing kernel exploitation competition. You get a shell as uid=1000 on a hardened Google COS-based kernel and your job is to get root. The hardened-v1 instance runs a custom kernel - `thejh/linux`, branch `slub-virtual-v7.2-rc5` - with a 13-line delta on top of the COS lakitu defconfig that adds experimental mitigations including **SLAB_VIRTUAL** (unique virtual addresses per slab object, making SLUB UAF vastly harder to exploit).

QEMU flags for local reproduction:

```
-smp 2 -m 512M -accel tcg,thread=multi
nokaslr nosmep nosmap preempt=full rcupdate.rcu_expedited=1
```

The reward is not for finding the bug. It is for demonstrating a working exploit that writes `/tmp/pwned`.

---

## Days 1–8: The BPF Graveyard

The first eight days were spent on eBPF. The CTF kernel is based on the 7.2-rc5 codebase, so there were plenty of known verifier bugs worth checking. The plan was straightforward: find a verifier bug, turn it into kernel read/write, then overwrite `struct cred`.

None of them made it past the first check.

```
sysctl_unprivileged_bpf_disabled = 2   (write-locked, set at boot)
```

That single sysctl kills all eBPF from uid=1000. It is not merely locked at runtime - it is hardcoded on the CTF instances. There is no way around it. Classic BPF (SO_ATTACH_FILTER) still works but routes through `bpf_check_classic()`, which is not the eBPF verifier and has no exploitable paths.

The other obvious routes were closed too:

- `CONFIG_IO_URING=n` - no io_uring
- `CONFIG_USER_NS=n` - no user namespaces (kills nftables, most namespace tricks)
- `CONFIG_IP_SCTP` not set - no SCTP
- `CONFIG_IP_DCCP` not set - no DCCP
- `CONFIG_TLS=n` - no kernel TLS
- `CONFIG_AF_UNIX_OOB=n` - no OOB on Unix sockets

Eight days in, there were still zero usable primitives.

---

## Day 9: Finding the Real Bug

Pivoted to reading patch history. The fix that unlocked everything:

**Commit `58a8108b`** (merged 2026-09-02):  
_"Fix use-after-free when perf mmap() revival races with last munmap()"_

The commit message says explicitly: _"local privilege escalation to root by any unprivileged user (default perf_event_paranoid=2)."_

The CTF kernel (`699594e8`, branched ~2026-07-27) predates this fix by roughly six weeks. It is confirmed buggy.

The bug is in `kernel/events/core.c` at line 7056:

```c
/* Thread A (munmap → perf_mmap_close): */
refcount_dec_and_test(&rb->mmap_count);          // line 7056  -  NO MUTEX HELD
refcount_dec_and_mutex_lock(&event->mmap_count,   // line 7059  -  waits for mutex
                            &event->mmap_mutex);
```

Between those two lines, Thread B can race in via `perf_mmap()` (the revival path). Thread B holds `event->mmap_mutex` and sees `rb->mmap_count = 0` (already decremented by Thread A), so it allocates a **new ring buffer** (`new_rb`), attaches it to the event, and sets `event->mmap_count = 1`. Thread B's VMA gets PTEs pointing to `new_rb`'s physical user page (call it **F2**).

Thread A unblocks. It calls `ring_buffer_attach(event, NULL)` which detaches `new_rb`, then `ring_buffer_put(new_rb)` which reaches refcount 0, queues `call_rcu(&rb->rcu_head, rb_free_rcu)`. After the RCU grace period, `rb_free_rcu` runs, calls `__free_page(F2)`. F2 is freed back to the buddy allocator.

Thread B's VMA still has stale PTEs pointing to F2's physical address. F2 is now free.

**Requirements:** `perf_event_open(PERF_TYPE_SOFTWARE)` works from uid=1000 with `perf_event_paranoid=2`. No capabilities needed.

---

## The Two Exploit Paths

### Path A: perf UAF → msg_msg → kread/kwrite

The first exploitation idea was to use the freed physical frame F2 to corrupt a `msg_msg` struct. With SLAB_VIRTUAL, the freed buddy frame can back a SLUB slab page. Writing to F2 via the stale VMA writes to slab objects. If a `msg_msg` lands in F2, corrupting its `m_ts` (message length) field gives an OOB read primitive via `MSG_COPY`, and corrupting `next` gives an arbitrary kernel address read.

This chain was partially built (`exploit_lpe_v3.c`). The race worked, msg_msg spray worked, UAF was confirmed. But the chain broke at the KASLR bypass step and at a subtle ordering bug:

**Dead end - q_lrpid ordering bug:** In `ipc/msg.c`, `ipc_update_pid(&msq->q_lrpid, task_tgid(current))` (line 1166) runs **before** `store_msg` (line 1258, which triggers the OOB write via corrupted msg_msg). This means `*(target-8)` is set to a non-NULL `struct pid *` pointer before the segment traversal terminates, causing an extra loop iteration → kernel fault at an unmapped address → Oops.

Fixing this would have required restructuring the msg_msg corruption primitive significantly. Given that the test kernel confirmed a cleaner approach worked, this path was abandoned.

### Path B: perf UAF → dirty pagetable → phys R/W → cred overwrite

The cleaner path was to stop trying to corrupt a heap object and use F2 as a **page table page**.

The idea (often called "dirty pagetable"):

1. Win the race → stale VMA maps F2 (freed physical frame).
2. Wait for `rb_free_rcu` to fire → F2 enters the buddy allocator / per-CPU PCP list.
3. Spray PTE page allocations: `mmap` a large anonymous region, touch every 2MB boundary to trigger `pte_alloc_one`. One of these allocations will grab F2 from the buddy/PCP.
4. Now F2 is simultaneously:
   - A real page table page (the kernel uses it to map our spray VMA)
   - Mapped R/W into our process via the stale m2 VMA
5. Write a fake PTE through the stale VMA → the kernel reads it as a real PTE entry → we can now map **any physical address**.
6. Scan all physical memory (pfn 0..max_pfn) for `struct cred` signature: 8 consecutive `uint32_t` values equal to `uid=1000`.
7. Overwrite the matching cred: set uid/gid/euid/egid/fsuid/fsgid to 0, `cap_effective = ~0ULL`.
8. `setresuid(0,0,0)`, open `/tmp/pwned`, write flag.

This worked end-to-end on a test kernel (7.2.0-rc6 with equivalent config) in one day.

---

## Adapting to the CTF Kernel: Three Bugs in the Approach

Getting the same chain working on the CTF kernel exposed three problems that did not show up on the single-CPU test setup.

### Problem 1: The sentinel never changes on SMP

In the initial design, the child polled `uaf_page[1]` (F2 + 8 bytes, the `time_enabled` field of the perf ring buffer metadata page) for 2 seconds, waiting for it to change from a sentinel value. On a single-CPU kernel, `perf_event_update_userpage` occasionally fired between the race win and `ring_buffer_attach(NULL)`, changing that field.

On SMP-2, `ring_buffer_attach(NULL)` fires almost immediately after the parent resumes (the parent was preempted between lines 7056 and 7059 - once it unblocks, it immediately calls `ring_buffer_attach(NULL)`). There is no window. The sentinel never changed.

**Fix:** Remove the 2000ms poll entirely. It was burning time while other allocations stole F2 from the PCP.

### Problem 2: The spray was hitting the wrong CPU

`rb_free_rcu` is queued via `call_rcu`. With `rcupdate.rcu_expedited=1`, RCU callbacks are processed quickly by the `rcuop/N` kthreads. Crucially, `rcuop/N` runs on **CPU N** - whichever CPU the `call_rcu` was issued from. When `rb_free_rcu` calls `__free_page(F2)`, F2 goes to **CPU N's per-CPU PCP freelist**.

The child process runs `pte_alloc_one` on whichever CPU it's scheduled on. On SMP-2, with `-smp 2 MTTCG`, the parent frequently ran `call_rcu` on CPU0 → F2 on CPU0's PCP. The child ran on CPU1 → reads CPU1's PCP → never sees F2.

This is why the original spray sprayed 2048 regions over multiple passes and still got zero hits: every single fault was on the wrong CPU.

**Fix:** Pin the child to CPU0, sleep 10ms (enough for `rcuop/0` to process the `call_rcu` callback and free F2 to CPU0's PCP), then spray 512 faults. If that misses (parent was on CPU1), pin to CPU1, sleep 5ms, spray 512 more faults on a new mmap base. Then restore both CPUs and fall through to the original multi-pass spray as a final fallback.

The per-CPU pinning means the `pte_alloc_one` calls inside the fault handler pull from exactly the same CPU's PCP where F2 was freed. First attempt captured F2 at fault i=4 on CPU0.

```c
/* Pin to CPU0  -  rcuop/0 freed F2 to CPU0's PCP */
cpu_set_t cs;
CPU_ZERO(&cs); CPU_SET(0, &cs);
sched_setaffinity(0, sizeof(cs), &cs);
usleep(10000);  /* 10ms for rcuop/0 to fire */
for (int i = 0; i < 512 && pte_slot < 0; i++) {
    (void)*(volatile uint8_t *)((uint8_t *)spray_base + (size_t)i * PT_REGION_SZ);
    uint64_t v = __atomic_load_n(&uaf_page[s], __ATOMIC_RELAXED);
    if ((v & 1) && v != 0) { pte_slot = s; }
}
```

### Problem 3: The child Oopses on exit

When the child exits without `munmap`-ing m2, `exit_mmap` triggers `perf_mmap_close` on m2's VMA. That function calls `ring_buffer_get(event)`, which reads `event->rb`. But the parent already called `ring_buffer_attach(event, NULL)`, so `event->rb = NULL`. The code then dereferences `rb->mmap_user` = `*(NULL + 0x88)` → CR2=0x88 → Oops.

This fires **after** `/tmp/pwned` is written. For CTF submission it doesn't matter - the proof is the file on disk. If needed: `munmap(m2, MMAP_SZ)` before exiting the child suppresses it cleanly.

---

## The Final Chain

```
uid=1000, no caps, perf_event_paranoid=2

1. parent: perf_event_open(PERF_TYPE_SOFTWARE) → fd
2. parent: mmap(fd, 8KB) → m1 (old_rb user_page = F1)
           write MAGIC at F1+0xFC0 (win-detection sentinel)
3. parent: fork() → child inherits m1 mapping (rb->mmap_count: 1→2)

4. child:  munmap(m1) → rb->mmap_count: 2→1
5. child ↔ parent race:
   child:  mmap(fd, 8KB)  -  enters perf_mmap_rb, takes mmap_mutex
           sees rb->mmap_count=0 (already decremented by parent)
           allocates new_rb, sets event->rb=new_rb
           m2 VMA: PTEs point to F2 (new_rb user_page)
   parent: munmap(m1) → perf_mmap_close:
           line 7056: rb->mmap_count 1→0 (NO MUTEX)
           [blocked on mmap_mutex held by child]
           [unblocks after child finishes mmap]
           line 7059: event->mmap_count 1→0
           ring_buffer_attach(NULL) → ring_buffer_put(new_rb)
           call_rcu(rb_free_rcu) → [RCU grace period] → __free_page(F2)

6. child detects race win: m2[0xFC0] == 0 (freshly zeroed page, not F1's MAGIC)

7. child closes both fds, starts RCU drainer (fork/exit loop + membarrier)
8. child pins to CPU0, sleeps 10ms, sprays 512 PTE-page faults
   → pte_alloc_one on CPU0 pulls F2 from CPU0's PCP → F2 is now a PTE page
   → uaf_page[s] (= F2[s]) now has a valid PTE entry (present bit set)

9. dirty PTE primitive established:
   write fake_pte = (target_pfn << 12) | 0x67 | _PAGE_SPECIAL to F2[s]
   mprotect(spray_va, 4KB, PROT_READ) → TLB flush → kernel reads fake PTE
   re-write fake_pte (mprotect clears _PAGE_RW, re-apply)
   spray_va now maps target_pfn's physical frame R/W

10. scan pfn=0..max_pfn:
    map each frame, check for 8 consecutive uint32 == 1000 (uid)
    validate with cred.usage sanity check
    → cred found at pa=0x4f4f6c0

11. map cred frame R/W, zero uid/gid/euid/egid/fsuid/fsgid (32 bytes from offset 8)
    set cap_effective = 0xffffffffffffffff
    → uid=0, euid=0

12. setresuid(0,0,0), open("/tmp/pwned","w"), write flag
```

**Final output:**

```
[+] [child] PTE captured! slot=75 PTE=0x800000000262f225
[+] [child] dirty PTE ready: target_va=0x...
[+] [child] cred found at pa=0x4f4f6c0
[+] [child] Overwriting uid/gid at pa=0x4f4f6c8...
[+] [child] ROOT! uid=0 euid=0
[+] [child] /tmp/pwned written!
```

Race needed ~22 attempts (loop at ~1ms per iteration).

---

## What Didn't Work

| Approach                             | Days | What happened                                                                                |
| ------------------------------------ | ---- | -------------------------------------------------------------------------------------------- |
| eBPF verifier bugs                   | 1–8  | `sysctl_unprivileged_bpf_disabled=2` is write-locked, so eBPF was unavailable                |
| io_uring                             | 1–2  | `CONFIG_IO_URING=n`                                                                          |
| nftables via user NS                 | 1–2  | `CONFIG_USER_NS=n`                                                                           |
| SCTP/DCCP                            | 3    | Neither was compiled in                                                                      |
| SLAB_VIRTUAL patches                 | 6    | I could not find a usable bug in the mitigation patches themselves                           |
| perf UAF → msg_msg → kread (v3)      | 9–17 | `q_lrpid` is updated before `store_msg`, which causes an extra segment traversal and an Oops |
| 2000ms sentinel poll                 | 18   | On SMP, `ring_buffer_attach(NULL)` happens before the sentinel can change                    |
| Multi-pass spray without CPU pinning | 18   | F2 was freed on one CPU's PCP while `pte_alloc_one` was running on the other CPU             |

---

## A Few Details That Mattered

**Why SLAB_VIRTUAL does not stop dirty pagetable:** SLAB_VIRTUAL gives each slab object a unique virtual address with guard pages - it breaks UAF-through-slab-reuse. But dirty pagetable doesn't reuse through SLUB. It waits for the freed frame to be claimed by the **buddy allocator's PTE page allocation path** (`pte_alloc_one` → `alloc_pages`). The buddy allocator is not SLAB_VIRTUAL-aware. The trick works because page table pages come from the same physical frame pool as everything else.

**Why `CONFIG_PERF_USE_VMALLOC` matters:** If `CONFIG_PERF_USE_VMALLOC` were set, `rb->user_page` would be a vmalloc page and `rb_free` would call `vfree()` instead of `__free_page()`. `vfree()` goes through a different path and would NOT put the frame in the per-CPU PCP. The CTF kernel does NOT set this config, so the standard `alloc_pages_node` / `__free_page` path is used → frame goes to PCP → catchable by `pte_alloc_one`.

**Why CPU pinning fixes the spray:** `rcuop/N` is the RCU offload kthread for CPU N. With `rcupdate.rcu_expedited=1`, RCU grace periods are short. `call_rcu` queues to the current CPU's RCU batch → `rcuop/N` processes it on CPU N → `rb_free_rcu` → `__free_page(F2)` → CPU N's PCP list. Pinning the child to CPU N before the fault spray means `pte_alloc_one` allocates from CPU N's PCP → finds F2.

---
