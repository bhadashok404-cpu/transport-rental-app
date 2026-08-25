import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { searchLocations } from '../data/india-locations';

const TYPE_SCHEME = {
  city:     { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#4338ca', badge: '#818cf8' },
  district: { bg: 'linear-gradient(135deg,#0ea5e9,#6366f1)', light: '#f0f9ff', text: '#0369a1', badge: '#38bdf8' },
  town:     { bg: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#065f46', badge: '#34d399' },
  taluka:   { bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', light: '#fffbeb', text: '#92400e', badge: '#fbbf24' },
};

const PinIcon = ({ color = '#9ca3af' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const LocationAutocomplete = forwardRef(function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'City or place',
  pinColor = '#6366f1',
  inputClass = '',
  id,
}, ref) {
  // query = what's shown in the input (always in sync with what user typed)
  const [query, setQuery]   = useState(value);
  const [results, setResults] = useState([]);
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(-1);
  const [rect, setRect]     = useState(null);

  // Track whether current query was set by user typing vs. programmatic
  const userTypingRef = useRef(false);

  const inputRef = useRef(null);
  const listRef  = useRef(null);

  // Expose close() to parent — blurs input so onFocus can't re-open
  useImperativeHandle(ref, () => ({
    close: () => {
      setOpen(false);
      setActive(-1);
      userTypingRef.current = false;
      inputRef.current?.blur();
    },
  }));

  // When parent updates value prop (swap, quickRoute, reset) — just update display, don't search
  useEffect(() => {
    setQuery(value);
    // Don't open dropdown for programmatic changes
  }, [value]);

  const updateRect = useCallback(() => {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
  }, []);

  // Only search when user is actually typing (userTypingRef = true)
  const runSearch = useCallback((q) => {
    if (!userTypingRef.current) return;
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const hits = searchLocations(trimmed, 10);
    setResults(hits);
    if (hits.length > 0) {
      updateRect();
      setOpen(true);
    } else {
      setOpen(false);
    }
    setActive(-1);
  }, [updateRect]);

  // Keep dropdown anchored on scroll/resize
  useEffect(() => {
    if (!open) return;
    const upd = () => updateRect();
    window.addEventListener('scroll', upd, true);
    window.addEventListener('resize', upd);
    return () => {
      window.removeEventListener('scroll', upd, true);
      window.removeEventListener('resize', upd);
    };
  }, [open, updateRect]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const portal = document.getElementById('__loc_portal__');
      if (portal?.contains(e.target)) return;
      if (!inputRef.current?.closest('[data-loc-root]')?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (active >= 0 && listRef.current) {
      listRef.current.children[active]?.scrollIntoView({ block: 'nearest' });
    }
  }, [active]);

  const select = useCallback((loc) => {
    userTypingRef.current = false;
    setQuery(loc.name);
    setOpen(false);
    setActive(-1);
    onChange(loc.name);
    // Short timeout then blur so the form can still read the value
    setTimeout(() => inputRef.current?.blur(), 50);
  }, [onChange]);

  const clear = (e) => {
    e.stopPropagation();
    userTypingRef.current = false;
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange('');
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    const v = e.target.value;
    userTypingRef.current = true;   // user is typing
    setQuery(v);
    onChange(v);
    runSearch(v);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (open && active >= 0) {
        e.preventDefault();
        select(results[active]);
      } else if (open && results.length > 0) {
        // auto-select first result
        e.preventDefault();
        select(results[0]);
      }
      // if dropdown closed, let form submit
      return;
    }
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const handleBlur = () => {
    // Delay so onMouseDown on a suggestion fires first
    setTimeout(() => {
      const portal = document.getElementById('__loc_portal__');
      // Don't close if mouse is hovering the portal (user scrolling suggestions)
      if (portal?.querySelector(':hover')) return;
      setOpen(false);
    }, 200);
  };

  const handleFocus = () => {
    updateRect();
    // Only re-open if user had typed something (not after programmatic set)
    if (userTypingRef.current && results.length > 0) {
      setOpen(true);
    }
  };

  // Highlight matched portion
  const hl = (text, q) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return text;
    return (
      <>
        {text.slice(0, i)}
        <span style={{ fontWeight: 900, background: '#fef9c3', color: '#854d0e', borderRadius: 3, padding: '0 2px' }}>
          {text.slice(i, i + q.length)}
        </span>
        {text.slice(i + q.length)}
      </>
    );
  };

  const getPortal = () => {
    let el = document.getElementById('__loc_portal__');
    if (!el) {
      el = document.createElement('div');
      el.id = '__loc_portal__';
      document.body.appendChild(el);
    }
    return el;
  };

  const portalEl = typeof document !== 'undefined' ? getPortal() : null;

  const dropdown = open && rect && results.length > 0 && portalEl
    ? createPortal(
        <div style={{
          position: 'fixed',
          top: rect.bottom + 6,
          left: rect.left,
          width: Math.max(rect.width, 300),
          zIndex: 2147483647,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(99,102,241,0.22), 0 8px 24px rgba(0,0,0,0.14)',
          border: '1.5px solid #e0e7ff',
          background: '#fff',
        }}>

          {/* Gradient header */}
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 8, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PinIcon color="#fff" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {results.length} location{results.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>↑↓ · Enter · Esc</span>
          </div>

          {/* Results */}
          <ul ref={listRef} style={{ maxHeight: 300, overflowY: 'auto', margin: 0, padding: '4px 0', listStyle: 'none' }}>
            {results.map((loc, i) => {
              const scheme = TYPE_SCHEME[loc.type] || TYPE_SCHEME.city;
              const isActive = active === i;
              return (
                <li key={`${loc.name}-${loc.state}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); select(loc); }}
                    onMouseEnter={() => setActive(i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px',
                      background: isActive ? scheme.light : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      borderLeft: isActive ? `3px solid ${scheme.badge}` : '3px solid transparent',
                      transition: 'all 0.1s',
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isActive ? scheme.bg : '#f3f4f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                    }}>
                      <PinIcon color={isActive ? '#fff' : '#9ca3af'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? scheme.text : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>
                        {hl(loc.name, query.trim())}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                        📍 {loc.state}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: 900, padding: '3px 9px', borderRadius: 99,
                      textTransform: 'capitalize', flexShrink: 0,
                      background: isActive ? scheme.bg : '#f3f4f6',
                      color: isActive ? '#fff' : '#6b7280',
                      letterSpacing: '0.05em', transition: 'all 0.15s',
                    }}>
                      {loc.type}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer */}
          <div style={{ padding: '7px 16px', background: 'linear-gradient(90deg,#f5f3ff,#fdf2f8)', borderTop: '1px solid #ede9fe' }}>
            <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>
              🇮🇳 All India — cities, districts, towns &amp; talukas
            </span>
          </div>
        </div>,
        portalEl
      )
    : null;

  return (
    <div data-loc-root="true" style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 10, pointerEvents: 'none', lineHeight: 0 }}>
          <PinIcon color={pinColor} />
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          // These three attributes kill the browser native autocomplete
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full pl-9 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all ${inputClass}`}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            style={{ position: 'absolute', right: 8, width: 20, height: 20, borderRadius: '50%', background: '#e5e7eb', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={11} color="#6b7280" />
          </button>
        )}
      </div>
      {dropdown}
    </div>
  );
});

export default LocationAutocomplete;
