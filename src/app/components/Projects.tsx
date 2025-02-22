"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Project = {
  name: string;
  description: string;
  url: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    fetch("/github.json")
      .then((res) => res.json())
      .then((repos) =>
        Promise.all(
          repos.map((repo: string) =>
            fetch(`https://api.github.com/repos/${repo}`, {
              headers: GITHUB_TOKEN
                ? { Authorization: `token ${GITHUB_TOKEN}` }
                : {},
            })
              .then((res) => res.json())
              .then((data) => ({
                name: data.name,
                description: data.description || "No description available",
                url: data.html_url,
              })),
          ),
        ),
      )
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {loading
        ? [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="w-full h-32 bg-orange-500/20 animate-pulse rounded-lg"
            />
          ))
        : projects.map((project, index) => (
            <motion.a
              key={index}
              href={project.url}
              target="_blank"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-4 border border-orange-500/20 shadow-lg shadow-black/50 rounded-lg hover:bg-orange-500/10 transition transform hover:scale-105"
            >
              <h3 className="text-lg text-orange-400 font-bold">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400">{project.description}</p>
            </motion.a>
          ))}
    </div>
  );
}
