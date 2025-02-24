"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaDiscord,
  FaEnvelope,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Filter } from "bad-words";

const socials = [
  { name: "Twitter", url: "https://twitter.com/icarus_rs", icon: FaTwitter },
  { name: "GitHub", url: "https://github.com/Icarus131", icon: FaGithub },
  {
    name: "Instagram",
    url: "https://www.instagram.com/icarus__13/",
    icon: FaInstagram,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/anirudh-r-prasad/",
    icon: FaLinkedin,
  },
  {
    name: "Discord",
    url: "https://discord.com/users/315371500074958849",
    icon: FaDiscord,
  },
  {
    name: "Mail",
    url: "mailto:falkensmaze13@protonmail.com",
    icon: FaEnvelope,
  },
];

interface Signature {
  name: string;
  message: string;
}

const filter = new Filter();

export default function ContactPage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://script.google.com/macros/s/AKfycbzkcE10L6U3FqNr7AVWCMHLMOkkUI_dB9sxrV7ARH4o6qce3a8SEk-EThsRAUKgeZQ4/exec",
    )
      .then((res) => res.json())
      .then((data) => {
        setSignatures(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load signatures:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !message.trim()) return;

    if (filter.isProfane(name)) {
      toast.error(
        "Your name contains inappropriate language. Please try again.",
      );
      return;
    }

    if (filter.isProfane(message)) {
      toast.error(
        "Your message contains inappropriate language. Please try again.",
      );
      return;
    }

    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzkcE10L6U3FqNr7AVWCMHLMOkkUI_dB9sxrV7ARH4o6qce3a8SEk-EThsRAUKgeZQ4/exec",
      {
        method: "POST",
        body: JSON.stringify({ name, message }),
      },
    );

    if (response.ok) {
      setSignatures([...signatures, { name, message }]);
      setName("");
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl text-left border border-orange-500/20 p-6 rounded-lg shadow-lg shadow-black/50 backdrop-blur-md"
      >
        <h1 className="text-3xl font-bold text-orange-400">/contact</h1>
        <p className="text-orange-300 mt-2">
          Sign my guestbook or connect with me. I&apos;m most responsive on
          Discord (lol) and Mail.
        </p>

        <div className="mt-6 flex space-x-6">
          {socials.map(({ name, url, icon: Icon }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-200 text-3xl transition-all"
            >
              <Icon />
            </a>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-orange-300">
            Sign the Guestbook
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded-md bg-black/30 border border-orange-500/20 text-orange-200"
            />
            <textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 h-24 rounded-md bg-black/30 border border-orange-500/20 text-orange-200"
            />
            <button
              type="submit"
              className="w-full p-2 bg-orange-500 text-black font-semibold rounded-md hover:bg-orange-400 transition"
            >
              Sign
            </button>
          </form>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-orange-300">Guestbook</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="h-4 w-3/4 bg-gray-900 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-gray-900 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : signatures.length > 0 ? (
              signatures.map((sig, i) => (
                <div key={i} className="border-l-4 border-orange-500/20 pl-4">
                  <p className="text-orange-200">
                    <span className="font-bold">{sig.name}</span>: {sig.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-orange-400">
                No signatures yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <ToastContainer className="toast-container" />
    </div>
  );
}
