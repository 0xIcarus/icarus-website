"use client";

import { motion } from "framer-motion";
import { marked } from "marked";

interface BlogPostProps {
  title: string;
  date: string;
  content: string;
}

export default function BlogPost({ title, date, content }: BlogPostProps) {
  const htmlContent = marked(content);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md"
        >
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-3xl font-bold text-orange-400"
          >
            {title}
          </motion.h1>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-orange-300/70 mt-2 mb-6"
          >
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="prose prose-invert prose-orange max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
