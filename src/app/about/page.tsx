"use client";

import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex items-center justify-center text-orange-400 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl text-left space-y-6 border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md relative"
      >
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl font-bold"
        >
          $ whoami
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg text-orange-300"
        >
          Welcome to my space. I&apos;m a 20-year-old programmer, cybersecurity
          and systems engineer, and an avid Linux and FOSS enthusiast. My other
          interests include hardware engineering/hacking, math, backend
          development, systems engineering, system architecture, OSdev, and
          writing rootkits. I also enjoy working with computer graphics. In the
          past, I&apos;ve hacked Stanford University and Cambridge University
          when I was 17, and more recently,{" "}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/nasa"
            className="text-orange-400 hover:text-orange-200 transition-colors duration-200 underline underline-offset-2"
          >
            NASA
          </motion.a>
          . Yes, I&apos;m that hacker your friends told you about.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-orange-300"
        >
          This website is a reflection of my brain. It is my manifesto. It is my
          mind palace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="absolute -bottom-12 -right-10"
        >
          <img
            src="/profile.png"
            alt="Profile"
            className="w-24 h-24 border-2 border-orange-500/20"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
