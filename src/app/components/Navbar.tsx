"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import IconWrapper from "./IconWrapper";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/exploits", label: "EXPLOITS" },
    { href: "/photos", label: "PHOTOS" },
    { href: "/work", label: "MY WORK" },
    { href: "/contact", label: "FIND ME" },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      y: "-100%",
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      y: "0%",
      transition: {
        duration: 0.3,
      },
    },
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isOpen]);

  return (
    <>
      <nav className="border-b border-orange-500/10 backdrop-blur-sm sticky top-0 z-50 shadow-md shadow-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <motion.img
                src="/logo.png"
                alt="Logo"
                className="h-20 w-auto"
                whileHover={{ scale: 1.05 }}
              />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-orange-400/70 hover:text-orange-300 transition-colors relative group font-mono"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500/40 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-orange-400/70 hover:text-orange-300 p-2"
              >
                <IconWrapper>
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </IconWrapper>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-0 bg-[#100404]/95 z-40 md:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8 font-mono">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-3xl text-orange-400/70 hover:text-orange-300 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
