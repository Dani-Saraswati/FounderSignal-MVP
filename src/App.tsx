import React, { useState } from 'react';
import { StyleProvider } from './context/StyleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal } from './components/AuthModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { OpportunityRadar } from './pages/OpportunityRadar';
import { OpportunityDetail } from './pages/OpportunityDetail';
import { CareerSignal } from './pages/CareerSignal';
import { BuilderMatch } from './pages/BuilderMatch';
import { IdeaValidator } from './pages/IdeaValidator';
import { SuggestedRoadmap } from './pages/SuggestedRoadmap';
import { AdminDashboard } from './pages/AdminDashboard';
import { HelpGuides } from './pages/HelpGuides';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { OpportunityCard } from './components/OpportunityCard';
import { Bookmark, Sparkles, Loader2, ArrowRight } from 'lucide-react';

import { AuthPage } from './pages/AuthPage';

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [selectedOppId, setSelectedOppId] = useState<string>('bfsi-ai-compliance');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const { opportunities, savedOpportunities } = useApp();
  const { user, isAuthenticated, isLoading, hasCompletedOnboarding, refreshProfile } = useAuth();

  const isAdmin = user && (user.role || '').toLowerCase() === 'admin';

  // 1. Session Loading State (no flashing of dashboard before auth resolves)
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-xs font-bold text-on-surface-variant">
            Initializing FounderSignal Intelligence...
          </p>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate (If not logged in, show the Auth / Login Page first!)
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // 3. Onboarding Gate (For authenticated users with incomplete 6-step onboarding)
  if (!hasCompletedOnboarding) {
    return (
      <div className="min-h-screen bg-background">
        <OnboardingFlow />
      </div>
    );
  }

  // 3. Router View Resolver
  const renderContent = () => {
    switch (activeTab) {
      case 'radar':
        return (
          <OpportunityRadar 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'detail':
        return (
          <OpportunityDetail 
            opportunityId={selectedOppId} 
            onBack={() => {
              setActiveTab('radar');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
      case 'validator':
        return (
          <IdeaValidator 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
      case 'builder':
        return (
          <BuilderMatch 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
      case 'career':
        return (
          <CareerSignal 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
      case 'roadmap':
        return (
          <SuggestedRoadmap 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateValidator={() => {
              setActiveTab('validator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'help':
        return (
          <HelpGuides 
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'admin':
        // Strict role gate
        if (!isAdmin) {
          return (
            <OpportunityRadar 
              onViewDetails={(id) => {
                setSelectedOppId(id);
                setActiveTab('detail');
              }} 
            />
          );
        }
        return <AdminDashboard />;
      case 'saves':
        // Real Saved Watchlist Opportunities filtered from live DB
        const savedCards = opportunities.filter(o => savedOpportunities.includes(o.id));
        return (
          <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-8 animate-fade-up">
            <div className="border-b border-border/60 pb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
                <Bookmark className="h-3.5 w-3.5" />
                <span>SAVED SHORTLIST</span>
              </div>
              <h1 className="text-3xl font-black text-on-surface tracking-tight">
                Saved Watchlist Opportunities
              </h1>
              <p className="mt-1.5 text-sm text-on-surface-variant max-w-3xl">
                You have bookmarked {savedCards.length} high-signal startup opportunities for ongoing tracking and diligence.
              </p>
            </div>
            
            {savedCards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {savedCards.map(opp => (
                  <OpportunityCard 
                    key={opp.id} 
                    opportunity={opp} 
                    onViewDetails={(id) => {
                      setSelectedOppId(id);
                      setActiveTab('detail');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 text-center border border-border bg-surface max-w-xl mx-auto space-y-3">
                <Bookmark className="mx-auto h-12 w-12 text-on-surface-variant/40" />
                <h3 className="text-base font-bold text-on-surface">No Saved Opportunities Yet</h3>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Explore the Opportunity Radar and click the bookmark icon on any opportunity card to save it here.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('radar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Browse Opportunity Radar</span>
                </button>
              </div>
            )}
          </div>
        );
      default:
        return (
          <OpportunityRadar 
            onViewDetails={(id) => {
              setSelectedOppId(id);
              setActiveTab('detail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* 1. Sleek Expandable Hover-Rail Left Sidebar (Matches reference UX) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* 2. Main Application Content (with md:pl-[4.5rem] for the resting sidebar rail) */}
      <div className="flex flex-col min-h-screen md:pl-[4.5rem]">
        {/* Sticky Top Header */}
        <Header
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onNavigateHome={() => {
            setActiveTab('radar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Dynamic Page Content */}
        <main id="main-content" className="flex-1 pb-24 md:pb-12 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Professional SaaS Footer */}
        <footer className="hidden border-t border-border/60 py-6 md:block bg-surface/50">
          <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-2 px-6 text-[11px] text-on-surface-variant">
            <p className="font-medium">
              Founder<span className="text-primary font-bold">Signal</span> · Opportunity intelligence for Indian founders and builders.
            </p>
            <p className="opacity-75">
              Signals are empirical evidence, not financial advice. Validate independently before committing capital.
            </p>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onSelectOpportunity={(id) => {
          setSelectedOppId(id);
          setActiveTab('detail');
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Google OAuth & Email Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <StyleProvider>
      <AuthProvider>
        <AppProvider>
          <MainDashboard />
        </AppProvider>
      </AuthProvider>
    </StyleProvider>
  );
}

export default App;
