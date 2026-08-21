import React, { useState, useEffect } from 'react';
import { Search, Radar, Sparkles, UserCheck, Briefcase, Route, Bookmark, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectOpportunity: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectOpportunity
}) => {
  const { opportunities } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNav = [
    { id: 'radar', label: 'Opportunity Radar', icon: Radar, category: 'Navigation' },
    { id: 'validator', label: 'AI Idea Validator', icon: Sparkles, category: 'Navigation' },
    { id: 'builder', label: 'Builder Match Quiz', icon: UserCheck, category: 'Navigation' },
    { id: 'career', label: 'Career Signal Parser', icon: Briefcase, category: 'Navigation' },
    { id: 'roadmap', label: 'Suggested Roadmap', icon: Route, category: 'Navigation' },
    { id: 'saves', label: 'Saved Watchlist', icon: Bookmark, category: 'Navigation' }
  ];

  const filteredNav = quickNav.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOpps = opportunities.filter(opp =>
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (opp.whyInteresting && opp.whyInteresting.toLowerCase().includes(searchQuery.toLowerCase())) ||
    opp.vertical.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden glass-strong">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search opportunities, tools, sectors, or press ESC to close..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline rounded border border-border px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Navigation Items */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                Tools & Pages
              </div>
              <div className="space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-surface-low hover:text-primary"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{item.label}</span>
                      <ArrowRight className="h-3 w-3 ml-auto opacity-40" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Scored Opportunities */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
              Scored Startup Opportunities ({filteredOpps.length})
            </div>
            <div className="space-y-1">
              {filteredOpps.map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => {
                    onSelectOpportunity(opp.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-low group"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-[11px]">
                    {opp.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                      {opp.title}
                    </p>
                    <p className="text-[10px] text-on-surface-variant truncate">
                      {opp.vertical} · {opp.signalCount || 12} signals · {opp.sourceCount || 4} sources
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-signal bg-emerald-signal/10 px-1.5 py-0.5 rounded shrink-0">
                    {opp.momentum}
                  </span>
                </button>
              ))}

              {filteredOpps.length === 0 && (
                <p className="px-3 py-4 text-center text-xs text-on-surface-variant">
                  No opportunities match "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
