"use client";

import { motion } from "framer-motion";
import RetroButton from "./components/RetroButton";
import { Terminal, Code2, Boxes } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const textToType = "20. Hacker & Systems Engineer_";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    if (mounted) {
      let index = 0;
      const interval = setInterval(() => {
        setTypedText(textToType.slice(0, index));
        index++;
        if (index > textToType.length) clearInterval(interval);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const [hexGrid, setHexGrid] = useState<string[]>([]);

  useEffect(() => {
    const generateHexGrid = () =>
      Array.from({ length: 15 }, () =>
        Array.from({ length: Math.floor(Math.random() * 20 + 10) }, () =>
          Math.random().toString(16).substring(2, 4),
        ).join(" "),
      );

    setHexGrid(generateHexGrid());

    const interval = setInterval(() => {
      setHexGrid(generateHexGrid());
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mt-24">
      <div className="fixed top-30 right-0 w-1/2 max-h-screen pointer-events-none opacity-20">
        <div className="relative top-20 right-0 text-orange-500 font-mono text-xs">
          {hexGrid.map((line, i) => (
            <div key={i} className="my-2">
              {line}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10"
      >
        <div className="mb-12">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold text-orange-500/90 mb-6 glitch-text [font-style:italic]"
          >
            &gt; icarus_
          </motion.div>

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-orange-400/60 max-w-xl font-mono"
          >
            <span className="text-orange-300/80">$</span> {typedText}
            <span className="animate-pulse">|</span>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <RetroButton
            href="/about"
            text="WHOAMI"
            icon={<Terminal className="w-5 h-5" />}
          />
          <RetroButton
            href="/projects"
            text="PROJECTS"
            icon={<Code2 className="w-5 h-5" />}
          />
          <RetroButton
            href="/blog"
            text="BLOG"
            icon={<Boxes className="w-5 h-5" />}
          />
        </motion.div>
      </motion.div>
      <div className=" bottom-0 left-0 text-orange-500/25 font-mono text-xs whitespace-pre">
        {`
 .-.   .-.   .-. 
| OO| | OO| | OO|
|   | |   | |   |
'^^^' '^^^' '^^^'
`}
      </div>
    </div>
  );
}
