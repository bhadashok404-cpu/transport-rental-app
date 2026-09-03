import { useState, useEffect } from 'react';
import Footer from './Footer';

function Hamburger() {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="block w-4 h-0.5 bg-current rounded-full" />
      <span className="block w-3 h-0.5 bg-current rounded-full" />
      <span className="block w-4 h-0.5 bg-current rounded-full" />
    </div>
  );
}

export default function DashShell({ sidebar: SidebarComponent, children }) {
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) setOpen(false);
      else setOpen(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    /*
     * The page is just a scroll container — no min-h-screen flex tricks.
     * Footer sits naturally at the bottom of content, never floating over modals.
     * Modal uses position:fixed which is relative to the real viewport, not this container.
     */
    <div className="pt-16 bg-slate-50">

      {/* ── Fixed sidebar ── */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 z-40 transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <button onClick={() => setOpen(false)} title="Hide sidebar"
          className="absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center rounded-lg
            bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all">
          <Hamburger />
        </button>
        <SidebarComponent />
      </aside>

      {/* Mobile backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)} />
      )}

      {/* Floating open button */}
      {!open && (
        <button onClick={() => setOpen(true)} title="Show sidebar"
          className="fixed top-20 left-3 z-50 w-10 h-10 flex items-center justify-center
            rounded-xl shadow-lg text-white hover:scale-105 transition-all duration-200"
          style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)' }}>
          <Hamburger />
        </button>
      )}

      {/* ── Main content — margin matches sidebar, min-height fills viewport ── */}
      <div className={`transition-all duration-300 ease-in-out
        ${open ? 'lg:ml-64' : 'ml-0'}`}>
        <div className={`min-h-[calc(100vh-64px)] p-6 sm:p-8 ${!open ? 'pl-16 sm:pl-16' : ''}`}>
          {children}
        </div>

        {/* Footer is INSIDE the content flow, after page content — never affects viewport height for fixed modals */}
        <div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
