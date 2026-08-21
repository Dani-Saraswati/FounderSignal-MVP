import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Palette, 
  LogIn, 
  LogOut, 
  Zap, 
  Command, 
  Check, 
  User, 
  Bookmark, 
  Settings as SettingsIcon, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStyle } from '../context/StyleContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onOpenSearch?: () => void;
  onNavigateHome?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAuth, 
  onOpenSearch, 
  onNavigateHome,
  onNavigateTab 
}) => {
  const { user, isAuthenticated, logout, aiCredits } = useAuth();
  const { theme, setTheme, themeOptions } = useStyle();
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (onOpenSearch) onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="glass sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-3 px-4 sm:px-6">
        {/* Mobile Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary p-1.5 text-on-primary shadow-sm">
            <svg viewBox="0 0 32 32" className="h-full w-full" role="img" aria-label="FounderSignal">
              <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.28" />
              <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
              <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
              <path d="M16 16 L16 3 A13 13 0 0 1 27.3 9.5 Z" fill="currentColor" opacity="0.25">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="4.5s" repeatCount="indefinite" />
              </path>
              <circle cx="23" cy="11" r="2.2" fill="currentColor" />
            </svg>
          </span>
          <span className="text-sm font-black tracking-tight text-on-surface">
            Founder<span className="text-primary">Signal</span>
          </span>
        </button>

        {/* Global Search Bar (⌘K Trigger) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenSearch) onOpenSearch();
          }}
          className="group ml-auto flex h-9 flex-1 items-center gap-2 rounded-xl border border-border bg-surface-low px-3.5 text-left transition-all hover:border-primary/50 hover:bg-surface md:ml-0 md:max-w-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer shadow-xs"
          aria-label="Search opportunities and tools"
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-on-surface-variant group-hover:text-primary transition-colors" />
          <span className="hidden truncate text-xs text-on-surface-variant sm:block">
            Search opportunities, tools, sectors...
          </span>
          <span className="truncate text-xs text-on-surface-variant sm:hidden">
            Search...
          </span>
          <kbd className="ml-auto hidden shrink-0 items-center gap-0.5 rounded-md border border-border/80 bg-surface px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant md:flex group-hover:border-primary/40">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Right Controls */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* Quick Theme Switcher Button */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-low text-xs font-bold text-on-surface transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary h-9 px-3.5"
              aria-label={`Theme: ${theme}. Change theme`}
            >
              <Palette className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" />
              <span className="hidden sm:inline capitalize">{theme}</span>
            </button>

            {showThemePicker && (
              <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-border bg-[#0d121f] p-2.5 shadow-2xl backdrop-blur-2xl animate-fade-up">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-border/40 mb-1.5">
                  Select Visual Style
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {themeOptions.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemePicker(false);
                      }}
                      className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-left transition-colors ${
                        theme === t.id
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface hover:bg-surface-low'
                      }`}
                    >
                      <span 
                        className="h-3 w-3 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: t.color }} 
                      />
                      <span className="truncate text-[11px]">{t.label}</span>
                      {theme === t.id && <Check className="h-3 w-3 ml-auto shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown or Sign In CTA */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 rounded-xl border border-border bg-surface-low p-1.5 pr-3 text-xs font-bold text-on-surface transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-black text-on-primary text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'F'}
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
                <ChevronDown className="h-3 w-3 text-on-surface-variant" />
              </button>

              {/* Profile Dropdown Menu - 100% Solid Opaque Background */}
              {showProfileDropdown && (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-border bg-[#0d121f] p-3.5 shadow-2xl animate-fade-up space-y-3">
                  {/* User Overview */}
                  <div className="border-b border-border/50 pb-3">
                    <p className="text-xs font-bold text-on-surface truncate">{user.name}</p>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{user.email}</p>
                    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-surface-low p-2 border border-border/40">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-signal" />
                        AI Credits
                      </span>
                      <span className="text-xs font-black text-on-surface">
                        {aiCredits?.remaining ?? 5} / {aiCredits?.limit ?? 5} Left
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onNavigateTab) onNavigateTab('profile');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-low transition-colors text-left"
                    >
                      <User className="h-4 w-4 text-on-surface-variant" />
                      <span>Founder Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onNavigateTab) onNavigateTab('saves');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-low transition-colors text-left"
                    >
                      <Bookmark className="h-4 w-4 text-on-surface-variant" />
                      <span>Saved Watchlist</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onNavigateTab) onNavigateTab('settings');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-low transition-colors text-left"
                    >
                      <SettingsIcon className="h-4 w-4 text-on-surface-variant" />
                      <span>Account Settings</span>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-border/50 pt-2">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-rose-signal hover:bg-rose-signal/15 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
