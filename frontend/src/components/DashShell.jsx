/**
 * DashShell — shared layout for Admin, Driver, Customer dashboards.
 *
 * Toggle button: top-right corner of the dark sidebar (☰ icon).
 * When sidebar is CLOSED: a floating ☰ button appears with left spacing
 *   so it doesn't overlap main content text.
 * Main content + Footer both shift left/right with the sidebar.
 */

import { useState } from 'react';
import Footer from './Footer';

// The 3-line hamburger icon as inline SVG bars
function Hamburger({ className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="block w-4 h-0.5 bg-current rounded-full" />
      <span className="block w-3 h-0.5 bg-current rounded-full" />
      <span className="block w-4 h-0.5 bg-current rounded-full" />
    </div>
  );
}

export default function DashShell({ sidebar: SidebarComponent, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col min-h-screen pt-16 bg-slate-50">
      <div className="flex flex-1 relative">

        {/* ── Mobile backdrop ── */}
        {open && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 z-40 transition-transform duration-300 ease-in-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Toggle inside sidebar — top-right corner of the dark panel */}
          <button
            onClick={() => setOpen(false)}
            title="Hide sidebar"
            className="absolute top-3 right-3 z-50 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <Hamburger />
          </button>

          <SidebarComponent />
        </aside>

        {/* ── Re-open button when closed — left-aligned with spacing ── */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            title="Show sidebar"
            className="fixed top-19 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg transition-all duration-200 text-white hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#1e1b4b,#0f172a)' }}
          >
            <Hamburger />
          </button>
        )}

        {/* ── Main content ── */}
        <main
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            open ? 'lg:ml-64' : 'ml-0 pl-16'
          }`}
        >
          <div className="flex-1 p-6 sm:p-8">
            {children}
          </div>

          {/* Footer moves with the content */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
