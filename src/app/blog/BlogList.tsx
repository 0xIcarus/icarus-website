"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  content: string;
}

export default function BlogList({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold text-orange-400">/blog</h1>
        <p className="text-orange-300 mt-2">
          my thoughts, writeups and ramblings.
        </p>
        <div className="mt-6 space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block border border-orange-500/20 p-4 rounded-lg hover:bg-black/30 transition-all"
              >
                <h2 className="text-xl font-semibold text-orange-400">
                  {post.title}
                </h2>
                <div className="text-orange-300/70 text-sm mb-2">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <p className="text-orange-300">
                  {post.content.slice(0, 150).trim()}...
                </p>
              </Link>
            ))
          ) : (
            <p className="text-orange-400">No posts found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
