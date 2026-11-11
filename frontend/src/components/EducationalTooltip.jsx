import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export default function EducationalTooltip({ term, definition, calculation, example, category }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-flex items-center ml-1" ref={tooltipRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5 rounded-full focus:outline-none"
        aria-label={`Educational explanation for ${term}`}
      >
        <HelpCircle size={14} className="stroke-[2.2]" />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-3.5 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-md text-left text-xs pointer-events-auto transition-all transform animate-in fade-in zoom-in-95 duration-150"
          style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))' }}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400"></span>
              {term}
            </span>
            {category && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                {category}
              </span>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed mb-2 font-normal">
            {definition}
          </p>

          {calculation && (
            <div className="bg-slate-950/80 rounded-lg p-2 mb-2 border border-slate-800 text-[11px] font-mono text-cyan-300">
              <span className="text-slate-400 font-sans block text-[10px] uppercase tracking-wider mb-0.5">Formula:</span>
              {calculation}
            </div>
          )}

          {example && (
            <div className="text-slate-400 bg-slate-800/40 rounded-lg p-2 text-[11px] border border-slate-800/60 leading-normal">
              <span className="text-amber-400 font-medium block text-[10px] uppercase tracking-wider mb-0.5">Example:</span>
              {example}
            </div>
          )}

          {/* Triangular arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}

