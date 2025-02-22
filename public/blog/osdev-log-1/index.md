---
title: My OSDev Journey - 01
date: 2023-05-31 18:06:54
tags:
---

## Why am I building this?

- As a precursor to anything that follows this in this post, I would like to declare that this is _completely_ a hobby project. I’d say its more of a learning journey than anything else.
- This project is a result of nothing but a spontaneous decision of wanting to build an operating system.
- As for the OS itself, here is where you can find it: https://github.com/Icarus131/IcarOS

- For the first part of the log, I’ll be going over the bootloader, how it works and how we can implement our own bootloader.
- Now before we get hands on, there are a few things we must understand thoroughly.
  - Bitwise operators
  - Using binary to perform arithmetic operations
  - Assembly
  - Memory allocation
  - Registers
- The bootloader performs a very important task of allowing the computer to recognize the drive that we are running the operating system in as **_bootable_**
- The boot sector allows the computer to determine the start point of the operating system itself.
- The boot sector is a 512 byte long binary code that ends with `55AA` or `AA55` to correct for little endian format.
- This is how we start writing the bootloader
- First lets start by hanging the bootloader and in essence creating a loop by jumping to the current address.
- Now, because we are not occupying 512 bytes with the jmp statement, we will need to add some extra bytes to maintain the boot signal of 512 bytes.
- Let’s add padding bytes using db 0. db stands for define byte.
- From here we can calculate the required number of bytes and add it.
- Finally, we can add he two numbers.
- We are using ORG to set the origin point to BIOS. 0x7c00 is a magic address.
- BITS 16 sets the bootloader to real mode.
  ```asm
  BITS 16
  ORG 0x7c00                  ;Setting origin point to BIOS set MBR origin point [Magic Address]
  jmp $
  times 510-($ - $$) db 0     ; Adding extra bytes as boot sig needs to be 512dw 0xAA55
  ```
- First to compile:
  - `nasm -f bin ./main.asm -o ./main.bin`
- Then to run in qemu
  - `qemu-system-x86_64 -hda ./main.bin`
- If you see this, then everything is right so far!

![Boot](/blog/osdev-log-1/boot.png)

## What’s Next?

- From here, in the next post, I will start with how we can print text from the bootloader onto the screen.
- We will learn how to make our own print function in assembly
