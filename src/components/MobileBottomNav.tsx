import React from 'react';
import { Radar, Sparkles, UserCheck, Briefcase, Route, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onSelectTab }) => {
  const { savedOpportunities } = useApp();

  const tabs = [
    { id: 'radar', label: 'Radar', icon: Radar },
    { id: 'validator', label: 'Validate', icon: Sparkles },
    { id: 'builder', label: 'Match', icon: UserCheck },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'roadmap', label: 'Roadmap', icon: Route },
    { id: 'saves', label: 'Saved', icon: Bookmark, badge: savedOpportunities.length > 0 ? savedOpportunities.length : null }
  ];

  return (
    <nav 
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden" 
      aria-label="Mobile navigation"
    >
      <ul className="hide-scrollbar flex items-stretch justify-between overflow-x-auto px-1 py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex w-full min-w-[3.5rem] flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-on-primary">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="truncate">{tab.label}</span>
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" aria-hidden="true" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
