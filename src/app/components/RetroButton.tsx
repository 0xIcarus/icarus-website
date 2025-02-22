"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface RetroButtonProps {
  href: string;
  text: string;
  icon?: ReactNode;
}

export default function RetroButton({ href, text, icon }: RetroButtonProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 },
      }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href}>
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-orange-400 opacity-50 blur group-hover:opacity-75 transition duration-300"></div>
          <div className="relative flex items-center bg-[#100404] px-6 py-4 border border-orange-500/30">
            {icon && <span className="mr-3 text-orange-400">{icon}</span>}
            <span className="relative font-mono text-lg text-orange-400 group-hover:text-orange-300 transition-colors">
              {text}
            </span>
            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400/50">
              →
            </div>
          </div>
          <div
            className="absolute top-0 right-0 h-2 w-2 bg
-orange-500 opacity-75"
          ></div>
          <div className="absolute bottom-0 left-0 h-2 w-2 bg-orange-500 opacity-75"></div>
        </div>
      </Link>
    </motion.div>
  );
}
