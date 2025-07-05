"use client";

import { ReactNode, useEffect, useState } from "react";

interface IconWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function IconWrapper({ children, className = "" }: IconWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the icon after the component has mounted on the client
  if (!mounted) {
    return <div className={className} style={{ width: '1em', height: '1em' }} />;
  }

  return <div className={className}>{children}</div>;
} 