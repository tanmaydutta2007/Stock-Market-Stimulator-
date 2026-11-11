import React, { useState } from 'react';
import { X, BookOpen, Search, ShieldCheck, Zap, DollarSign, TrendingUp, Layers } from 'lucide-react';

export default function EducationalGlossaryModal({ isOpen, onClose, terms = [] }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'Valuation', 'Order Types', 'Trading', 'Risk Management', 'Technical'];

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(filterQuery.toLowerCase()) ||
                          t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Stock Market Beginner Handbook
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Zero Financial Risk
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand core financial terms and order mechanisms before risking real money.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quick Beginner Tips Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-purple-950/40 border-b border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span><strong>Rule 1:</strong> Always diversify holdings across sectors.</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-400 shrink-0" />
            <span><strong>Rule 2:</strong> Use Limit Orders to avoid unexpected price spikes.</span>
          </div>
        </div>

        {/* Controls: Search & Category Filter */}
        <div className="p-6 pb-2 border-b border-slate-800/60 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search concepts (e.g. Market Cap, Limit Order, P/E)..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-semibold'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No matching financial terms found for "{filterQuery}".
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-base">{item.title}</span>
                    <span className="text-xs text-slate-400 font-mono">({item.term})</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  {item.definition}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {item.calculation && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                      <span className="text-slate-400 font-sans block text-[10px] uppercase tracking-wider mb-1">
                        Formula / Logic:
                      </span>
                      {item.calculation}
                    </div>
                  )}
                  {item.example && (
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                      <span className="text-amber-400 block text-[10px] uppercase tracking-wider mb-1 font-sans">
                        Real-world Example:
                      </span>
                      {item.example}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Simulation practice: All trades are recorded with virtual $10,000 capital.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}

