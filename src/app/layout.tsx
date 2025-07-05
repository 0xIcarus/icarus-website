import { ThemeProvider } from "next-themes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <title>Icarus</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressive Dark Reader attribute cleanup to prevent hydration mismatches
              (function() {
                function removeDarkReaderAttributes() {
                  // Remove all Dark Reader related attributes and styles
                  const selectors = [
                    '[data-darkreader-inline-stroke]',
                    '[data-darkreader-inline-fill]',
                    '[data-darkreader-inline-bgcolor]',
                    '[data-darkreader-inline-color]',
                    '[style*="--darkreader-inline-stroke"]',
                    '[style*="--darkreader-inline-fill"]',
                    '[style*="--darkreader-inline-bgcolor"]',
                    '[style*="--darkreader-inline-color"]'
                  ];
                  
                  selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {
                      // Remove data attributes
                      el.removeAttribute('data-darkreader-inline-stroke');
                      el.removeAttribute('data-darkreader-inline-fill');
                      el.removeAttribute('data-darkreader-inline-bgcolor');
                      el.removeAttribute('data-darkreader-inline-color');
                      
                      // Remove CSS custom properties
                      if (el.style) {
                        el.style.removeProperty('--darkreader-inline-stroke');
                        el.style.removeProperty('--darkreader-inline-fill');
                        el.style.removeProperty('--darkreader-inline-bgcolor');
                        el.style.removeProperty('--darkreader-inline-color');
                      }
                    });
                  });
                }
                
                // Run immediately
                removeDarkReaderAttributes();
                
                // Run after DOM is ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeDarkReaderAttributes);
                }
                
                // Run after window load
                window.addEventListener('load', removeDarkReaderAttributes);
                
                // Run more frequently to catch new elements
                setInterval(removeDarkReaderAttributes, 50);
                
                // Use MutationObserver to catch dynamically added elements
                if (typeof MutationObserver !== 'undefined') {
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.type === 'childList') {
                        removeDarkReaderAttributes();
                      }
                    });
                  });
                  
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col crt" suppressHydrationWarning>
        <ThemeProvider attribute="class">
          <Navbar />
          <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <main className="py-8">{children}</main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
