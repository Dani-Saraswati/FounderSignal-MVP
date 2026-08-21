import React, { useState } from 'react';
import { 
  Radar, 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  Route, 
  Bookmark, 
  ShieldCheck, 
  HelpCircle, 
  User, 
  Settings as SettingsIcon, 
  Palette, 
  LogOut, 
  LogIn, 
  Zap, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useStyle, ThemeName } from '../context/StyleContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, aiCredits } = useAuth();
  const { savedOpportunities } = useApp();
  const { theme, setTheme, themeOptions } = useStyle();
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);

  const isAdmin = user && (user.role || '').toLowerCase() === 'admin';

  const navGroups = [
    {
      groupName: 'Discover',
      items: [
        {
          id: 'radar',
          label: 'Opportunity Radar',
          icon: Radar,
          badge: null
        }
      ]
    },
    {
      groupName: 'Evaluate',
      items: [
        {
          id: 'validator',
          label: 'Idea Validator',
          icon: Sparkles,
          badge: null
        },
        {
          id: 'builder',
          label: 'Builder Match',
          icon: UserCheck,
          badge: null
        },
        {
          id: 'career',
          label: 'Career Signal',
          icon: Briefcase,
          badge: null
        },
        {
          id: 'roadmap',
          label: 'Suggested Roadmap',
          icon: Route,
          badge: '4-Wk'
        }
      ]
    },
    {
      groupName: 'Track',
      items: [
        {
          id: 'saves',
          label: 'Saved Watchlist',
          icon: Bookmark,
          badge: savedOpportunities.length > 0 ? String(savedOpportunities.length) : null
        }
      ]
    },
    {
      groupName: 'Help',
      items: [
        {
          id: 'help',
          label: 'Help & Guides',
          icon: HelpCircle,
          badge: null
        }
      ]
    },
    {
      groupName: 'Account',
      items: [
        {
          id: 'profile',
          label: 'Founder Profile',
          icon: User,
          badge: null
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: SettingsIcon,
          badge: null
        }
      ]
    }
  ];

  return (
    <aside 
      className="group/rail fixed inset-y-0 left-0 z-40 hidden md:flex md:flex-col w-[4.5rem] hover:w-64 focus-within:w-64 glass border-r border-border transition-[width] duration-300 ease-out"
      aria-label="Primary navigation"
    >
      {/* Top Animated Radar Logo */}
      <div className="flex h-16 items-center overflow-hidden px-4 border-b border-border/40">
        <button 
          onClick={() => onSelectTab('radar')}
          className="flex items-center rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary w-full"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary p-1.5 text-on-primary shadow-sm">
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
          <span className="ml-3 whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
            <span className="block text-[15px] font-black leading-tight tracking-tight text-on-surface">
              Founder<span className="text-primary">Signal</span>
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.14em] text-on-surface-variant/80">
              India Opportunity Radar
            </span>
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="hide-scrollbar flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.groupName} className="mb-2.5 last:mb-0">
            <p className="mb-1.5 h-3 overflow-hidden px-2.5 text-[9px] font-black uppercase tracking-[0.16em] text-on-surface-variant/55 opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
              {group.groupName}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelectTab(item.id)}
                      title={item.label}
                      className={`relative flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isActive
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 ${
                          isActive ? 'bg-on-primary/20 text-on-primary' : 'bg-primary/10 text-primary'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Admin Navigation (Gated to role === 'admin') */}
        {isAdmin && (
          <div className="pt-2 border-t border-border/40">
            <button
              onClick={() => onSelectTab('admin')}
              title="Admin Dashboard"
              className={`relative flex h-10 w-full items-center gap-3 overflow-hidden rounded-lg px-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === 'admin'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-signal" />
              <span className="flex-1 text-left whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
                Admin & Ingestion
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Bottom Section: Theme Switcher & User Profile */}
      <div className="relative overflow-visible border-t border-border/60 p-3 space-y-2">
        {/* Theme Picker Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-border bg-surface-low px-2.5 text-xs font-bold text-on-surface transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Theme switcher"
          >
            <Palette className="h-4 w-4 shrink-0 text-on-surface-variant" />
            <span className="flex-1 text-left capitalize truncate opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100 text-[11px]">
              Theme: {theme}
            </span>
          </button>

          {/* Theme Dropdown Popover */}
          {showThemePicker && (
            <div className="absolute bottom-12 left-2 z-50 w-56 rounded-xl border border-border bg-[#0f1524] p-2 shadow-2xl backdrop-blur-2xl animate-fade-up">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 border-b border-border/40 mb-1">
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

        {/* User Card / Auth Button */}
        {isAuthenticated && user ? (
          <div className="rounded-lg border border-border/60 bg-surface-low/50 p-2 text-xs">
            <div className="flex items-center gap-2">
              <div 
                onClick={() => onSelectTab('profile')}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary font-black text-on-primary text-[11px] cursor-pointer hover:opacity-90 transition-opacity"
                title="View Profile"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="flex-1 min-w-0 opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
                <p 
                  onClick={() => onSelectTab('profile')}
                  className="font-bold text-on-surface truncate leading-tight cursor-pointer hover:underline"
                >
                  {user.name}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate flex items-center gap-1 mt-0.5">
                  <Zap className="h-2.5 w-2.5 text-amber-signal" />
                  <span>{aiCredits?.remaining ?? 5} / {aiCredits?.limit ?? 5} runs</span>
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                className="opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 text-on-surface-variant hover:text-rose-signal p-1 rounded transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
          >
            <LogIn className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/rail:opacity-100 group-focus-within/rail:opacity-100">
              Sign In
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};
