"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

interface TimelineItem {
  year: string;
  events: string[];
  images?: string[];
}

export default function WorkPage() {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    fetch("/timeline.json")
      .then((res) => res.json())
      .then((data) => setTimeline(data.reverse()))
      .catch((err) => console.error("Failed to load timeline:", err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold text-orange-400">
          <a
            href="https://github.com/0xIcarus/"
            className="underline underline-offset-2 text-orange-400 hover:text-orange-200 transition-colors duration-200"
          >
            /proof_of_work
          </a>{" "}
          -{" "}
          <Link
            href="/resume"
            className="underline underline-offset-2 text-orange-300 hover:text-orange-200 transition-colors duration-200"
          >
            résumé
          </Link>
        </h1>
        <div className="mt-6 space-y-8 border-l-4 border-orange-500/20 pl-6 relative">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative"
            >
              <div className="absolute -left-[34px] top-2 w-4 h-4 bg-orange-400 rounded-full border-2 border-orange-500/20"></div>
              <h2 className="text-xl font-semibold text-orange-300">
                {item.year}
              </h2>
              <ul className="list-disc list-inside text-lg text-orange-200 space-y-1">
                {item.events.map((event, i) => (
                  <li key={i}>
                    <ReactMarkdown
                      components={{
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            className="text-orange-400 hover:text-orange-200 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                        p: ({ ...props }) => <span {...props} />,
                      }}
                    >
                      {event}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
              {item.images && item.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {item.images.map((image, i) => (
                    <img
                      key={i}
                      src={image}
                      alt={`Event ${i + 1}`}
                      className="w-40 h-40 object-cover rounded-lg border border-orange-500/20 shadow-md"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
