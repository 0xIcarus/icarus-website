export default function WebringPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold glitch-text">
          UD2 Webring
        </h1>
        
        <p className="text-orange-400/80 text-lg leading-relaxed">
          UD2 Webring - a collection of sites from the UD2 community. 
        </p>
        
        <div className="bg-black/20 border border-orange-900/30 rounded-lg p-8 backdrop-blur-sm shadow-lg shadow-black/50">
          <nav className="ud2-webring flex items-center justify-between space-x-4 text-lg">
            <a 
              href="https://ud2.rip/api/webring?member=icarus&dir=prev" 
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <span className="text-2xl">⟵</span>
              <span>prev</span>
            </a>
            
            <a 
              href="https://ud2.rip/webring" 
              className="text-orange-500 hover:text-orange-400 transition-colors duration-200 hover:scale-105 font-semibold"
            >
              ud2 webring
            </a>
            
            <a 
              href="https://ud2.rip/api/webring?member=icarus&dir=next" 
              className="text-orange-400 hover:text-orange-300 transition-colors duration-200 hover:scale-105 flex items-center space-x-2"
            >
              <span>next</span>
              <span className="text-2xl">⟶</span>
            </a>
          </nav>
        </div>
        
        <div className="text-orange-400/60 text-sm space-y-2">
          <p>You&apos;re currently viewing Icarus&apos;s site in the UD2 Webring</p>
          <p>Click the links above to navigate through the ring</p>
        </div>
      </div>
    </div>
  );
} 