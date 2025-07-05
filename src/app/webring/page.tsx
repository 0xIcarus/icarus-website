"use client";

import { useState } from "react";

export default function WebringPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-400">
        /webring
      </h1>
      
      <p className="text-orange-400/80 text-base sm:text-lg leading-relaxed">
        <a href="https://ud2.rip" className="text-orange-400 hover:text-orange-300 transition-colors duration-200 underline underline-offset-2">ud2</a> webring: a collection of sites from the ud2 community. 
      </p>
      
      <div className="bg-black/20 border border-orange-900/30 rounded-lg p-4 sm:p-6 md:p-8 backdrop-blur-sm shadow-lg shadow-black/50 w-full">
        <nav className="ud2-webring flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 text-base sm:text-lg">
          <a 
            href="https://ud2.rip/api/webring?member=icarus&dir=prev" 
            className="text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <span className="text-xl sm:text-2xl font-mono">&lt;</span>
            <span>prev</span>
          </a>
          
          <a 
            href="https://ud2.rip/webring" 
            className="text-orange-500 hover:text-orange-400 transition-colors duration-200 hover:scale-105 font-semibold order-first sm:order-none"
          >
            ud2 webring
          </a>
          
          <a 
            href="https://ud2.rip/api/webring?member=icarus&dir=next" 
            className="text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end"
          >
            <span>next</span>
            <span className="text-xl sm:text-2xl font-mono">&gt;</span>
          </a>
        </nav>
      </div>
      
      <div className="text-orange-400/60 text-xs sm:text-sm space-y-2">
        <p>You&apos;re currently viewing Icarus&apos; site in the ud2 Webring</p>
        <p>Click the links above to navigate through the ring</p>
      </div>
    </div>
  );
} 