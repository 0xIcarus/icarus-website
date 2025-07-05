import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import IconWrapper from "./IconWrapper";

export default function Footer() {
  const socialLinks = [
    { icon: Github, href: "https://github.com/0xIcarus", label: "GitHub" },
    {
      icon: Twitter,
      href: "https://x.com/icarus_rs",
      label: "Twitter",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/anirudh-r-prasad/",
      label: "LinkedIn",
    },
    {
      icon: Youtube,
      href: "https://www.youtube.com/@0xic4rus",
      label: "YouTube",
    },
  ];

  const WebringIcon = () => (
    <svg 
      width="28" 
      height="28" 
      viewBox="0 0 24 24" 
      className="text-orange-400"
      fill="none"
    >
      {/* Ring circle */}
      <circle 
        cx="12" 
        cy="12" 
        r="8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.6"
      />
      
      {/* Node 1 (top) */}
      <circle 
        cx="12" 
        cy="4" 
        r="1.5" 
        fill="currentColor"
      />
      
      {/* Node 2 (bottom right) */}
      <circle 
        cx="16.5" 
        cy="16.5" 
        r="1.5" 
        fill="currentColor"
      />
      
      {/* Node 3 (bottom left) */}
      <circle 
        cx="7.5" 
        cy="16.5" 
        r="1.5" 
        fill="currentColor"
      />
      
      {/* Connection lines */}
      <line 
        x1="12" 
        y1="5.5" 
        x2="15.5" 
        y2="15" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.8"
      />
      <line 
        x1="15.5" 
        y1="15" 
        x2="8.5" 
        y2="15" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.8"
      />
      <line 
        x1="8.5" 
        y1="15" 
        x2="12" 
        y2="5.5" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.8"
      />
    </svg>
  );

  return (
    <footer className="border-t border-orange-900/30 py-8 mt-12 backdrop-blur-sm shadow-sm shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
                <IconWrapper className="h-6 w-6">
                  <social.icon className="h-6 w-6" />
                </IconWrapper>
                <span className="sr-only">{social.label}</span>
              </a>
            ))}
            <Link
              href="/webring"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <IconWrapper className="h-6 w-6">
                <WebringIcon />
              </IconWrapper>
              <span className="sr-only">UD2 Webring</span>
            </Link>
          </div>
          <p className="text-orange-400/60 text-sm">
            © {new Date().getFullYear()} - Icarus. Powered By My Brain 🧠 ⚡.
          </p>
        </div>
      </div>
    </footer>
  );
}
