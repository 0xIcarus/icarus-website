import { Github, Twitter, Linkedin, Youtube, Circle } from "lucide-react";
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

  const webringLink = {
    icon: Circle,
    href: "/webring",
    label: "UD2 Webring",
  };

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
            <a
              href={webringLink.href}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <IconWrapper className="h-6 w-6">
                <webringLink.icon className="h-6 w-6" />
              </IconWrapper>
              <span className="sr-only">{webringLink.label}</span>
            </a>
          </div>
          <p className="text-orange-400/60 text-sm">
            © {new Date().getFullYear()} - Icarus. Powered By My Brain 🧠 ⚡.
          </p>
        </div>
      </div>
    </footer>
  );
}
