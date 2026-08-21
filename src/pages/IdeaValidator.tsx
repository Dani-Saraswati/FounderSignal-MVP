import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Search, 
  Cpu, 
  RotateCcw, 
  Building, 
  Scale, 
  Loader2, 
  AlertTriangle, 
  Lightbulb, 
  Zap, 
  ShieldAlert,
  ArrowRight,
  ClipboardList,
  CheckSquare,
  Users2,
  Check,
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  Trash2,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle,
  Copy
} from 'lucide-react';

interface IdeaValidatorProps {
  onViewDetails?: (id: string) => void;
}

interface SavedIdea {
  id: string;
  ideaText: string;
  validationScore: number;
  scores: any;
  gaps: string[];
  competitors: string[];
  mvpBuild: string;
  fullResult?: any;
  createdAt: string;
}

const EXAMPLE_IDEAS = [
  'Automated RBI digital lending compliance and grievance log monitor for NBFCs',
  'Developer toolkit for real-time UPI switch simulation and webhook failure replay',
  'DPDP Act consent audit log exporter and privacy manager for Indian B2B SaaS'
];

export const IdeaValidator: React.FC<IdeaValidatorProps> = ({ onViewDetails }) => {
  const { 
    validationResult, 
    validateCustomIdea, 
    resetValidation, 
    generateContextualFollowup 
  } = useApp();
  const { user, token, aiCredits, refreshProfile } = useAuth();
  
  const [ideaText, setIdeaText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validatingStep, setValidatingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Contextual AI Follow-up state
  const [activeFollowupType, setActiveFollowupType] = useState<'roadmap' | 'compliance' | 'gtm' | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupData, setFollowupData] = useState<{ title: string; sections: { subtitle: string; items: string[] }[] } | null>(null);
  const [copiedSection, setCopiedSection] = useState(false);

  // Saved Ideas Notebook state
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  const [ideaSaved, setIdeaSaved] = useState(false);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [savedIdeasList, setSavedIdeasList] = useState<SavedIdea[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const isCreditsExhausted = aiCredits.remaining <= 0;

  // Multi-step scanning animation during validation
  useEffect(() => {
    let interval: any;
    if (isValidating) {
      setValidatingStep(0);
      interval = setInterval(() => {
        setValidatingStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isValidating]);

  // Load user saved ideas from SQLite
  const loadSavedIdeas = async () => {
    if (!token) return;
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/validator/saved', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIdeasList(data.savedIdeas || []);
      }
    } catch (e) {
      console.error('Failed to load saved ideas:', e);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (showSavedDrawer) {
      loadSavedIdeas();
    }
  }, [showSavedDrawer, token]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ideaText.trim() || isValidating || isCreditsExhausted) return;

    setErrorMessage(null);
    setIsValidating(true);
    setActiveFollowupType(null);
    setFollowupData(null);
    setIdeaSaved(false);

    try {
      await validateCustomIdea(ideaText.trim());
      refreshProfile();
    } catch (err: any) {
      setErrorMessage(err.message || 'AI Idea validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Save Idea to private notebook in database
  const handleSaveIdea = async () => {
    if (!validationResult || isSavingIdea || !token) return;
    setIsSavingIdea(true);
    try {
      const res = await fetch('/api/validator/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ideaText: validationResult.ideaText,
          validationScore: validationResult.validationScore,
          scores: validationResult.scores,
          gaps: validationResult.gaps,
          competitors: validationResult.competitors,
          mvpBuild: validationResult.mvpBuild,
          fullResult: validationResult
        })
      });
      if (res.ok) {
        setIdeaSaved(true);
        loadSavedIdeas();
      }
    } catch (e) {
      console.error('Failed to save idea:', e);
    } finally {
      setIsSavingIdea(false);
    }
  };

  const handleDeleteSavedIdea = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/validator/saved/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedIdeasList(prev => prev.filter(i => i.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete saved idea:', e);
    }
  };

  // Execute Contextual AI Deep Dive action
  const handleRunFollowup = async (type: 'roadmap' | 'compliance' | 'gtm') => {
    if (!validationResult || followupLoading || isCreditsExhausted) return;
    setActiveFollowupType(type);
    setFollowupLoading(true);
    setFollowupData(null);
    try {
      const res = await generateContextualFollowup(validationResult.ideaText, type);
      if (res.success && res.data) {
        setFollowupData(res.data);
      }
      refreshProfile();
    } catch (err: any) {
      console.error('Failed to run followup action:', err);
    } finally {
      setFollowupLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-signal';
    if (score >= 80) return 'text-violet-signal';
    if (score >= 70) return 'text-indigo-signal';
    return 'text-amber-signal';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-signal';
    if (score >= 80) return 'bg-violet-signal';
    if (score >= 70) return 'bg-indigo-signal';
    return 'bg-amber-signal';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-signal/15 text-emerald-signal border-emerald-signal/30';
    if (score >= 80) return 'bg-violet-signal/15 text-violet-signal border-violet-signal/30';
    if (score >= 70) return 'bg-indigo-signal/15 text-indigo-signal border-indigo-signal/30';
    return 'bg-amber-signal/15 text-amber-signal border-amber-signal/30';
  };

  const getScoreTierLabel = (score: number) => {
    if (score >= 90) return 'Exceptional Market Signal';
    if (score >= 80) return 'High-Momentum Opportunity';
    if (score >= 70) return 'Viable Early-Stage Opportunity';
    return 'Developing / Speculative';
  };

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-6 animate-fade-up">
      {/* Top Header */}
      <div className="border-b border-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-primary mb-1.5 flex items-center gap-1.5">
            <span>EVALUATE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>Idea Validator</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-on-surface-variant max-w-3xl">
            Describe an idea and get a scorecard built from the same six dimensions used to rank the radar, plus the market gaps, competitors, a first build and the risks that would kill it.
          </p>
        </div>

        {/* Notebook Button */}
        <button
          onClick={() => setShowSavedDrawer(!showSavedDrawer)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-low px-3.5 py-2 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface transition-all shadow-xs self-start sm:self-center"
        >
          <FolderOpen className="h-3.5 w-3.5 text-primary" />
          <span>Saved Notebook</span>
          {savedIdeasList.length > 0 && (
            <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.2 text-[10px] font-black">
              {savedIdeasList.length}
            </span>
          )}
        </button>
      </div>

      {/* Saved Notebook Modal / Drawer if toggled */}
      {showSavedDrawer && (
        <div className="glass-card rounded-2xl p-6 border border-border bg-surface space-y-4 animate-fade-up">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-on-surface">Your Saved Idea Notebook ({savedIdeasList.length})</h3>
            </div>
            <button
              onClick={() => setShowSavedDrawer(false)}
              className="text-xs font-semibold text-on-surface-variant hover:text-on-surface"
            >
              Close
            </button>
          </div>

          {loadingSaved ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
              <p className="text-xs text-on-surface-variant mt-2">Loading saved notebook...</p>
            </div>
          ) : savedIdeasList.length === 0 ? (
            <p className="text-xs text-on-surface-variant text-center py-6">
              No saved ideas yet. Validate a concept below and click "Save to Notebook".
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedIdeasList.map(saved => (
                <div key={saved.id} className="rounded-xl border border-border bg-surface-low p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${getScoreBg(saved.validationScore)}`}>
                      Score {saved.validationScore}/100
                    </span>
                    <button
                      onClick={() => handleDeleteSavedIdea(saved.id)}
                      className="text-on-surface-variant/50 hover:text-rose-signal p-1 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-on-surface line-clamp-2">"{saved.ideaText}"</p>
                  <p className="text-[11px] text-on-surface-variant line-clamp-2">{saved.mvpBuild}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Form */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-border bg-surface shadow-md space-y-4">
            {/* Header with AI Runs Counter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-on-surface">
                YOUR IDEA
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase rounded-full border ${
                aiCredits.remaining > 2
                  ? 'bg-emerald-signal/10 text-emerald-signal border-emerald-signal/20'
                  : aiCredits.remaining > 0
                  ? 'bg-amber-signal/10 text-amber-signal border-amber-signal/20'
                  : 'bg-rose-signal/10 text-rose-signal border-rose-signal/20'
              }`}>
                <Sparkles className="h-2.5 w-2.5" />
                <span>{aiCredits.remaining} / {aiCredits.limit} AI RUNS LEFT</span>
              </span>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="rounded-xl bg-rose-signal/15 border border-rose-signal/30 p-3 text-xs text-rose-signal flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Textarea Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  rows={7}
                  maxLength={2000}
                  disabled={isValidating || isCreditsExhausted}
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the problem, who has it, and what you would build. The more specific the buyer, the more useful the score."
                  className="w-full rounded-xl border border-border bg-surface-low p-3.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Bottom bar of textarea */}
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant px-1">
                <span>Ctrl+Enter to submit</span>
                <span>{ideaText.length}/2000</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!ideaText.trim() || isValidating || isCreditsExhausted}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary py-3 px-4 text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Validating with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Validate idea</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Example Pills */}
            <div className="pt-2 border-t border-border/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                Or try an example prompt:
              </span>
              <div className="space-y-1.5">
                {EXAMPLE_IDEAS.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdeaText(ex)}
                    className="w-full text-left p-2 rounded-lg border border-border/70 bg-surface-low hover:border-primary/50 hover:bg-surface text-[11px] text-on-surface-variant hover:text-on-surface transition-all leading-normal truncate block"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Scorecard / Live Scanner */}
        <div className="lg:col-span-7 xl:col-span-8">
          {isValidating ? (
            /* Scanning Animation State */
            <div className="glass-card rounded-2xl p-8 border border-border bg-surface shadow-md text-center py-16 space-y-6 animate-fade-up">
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/20"></span>
                <span className="relative inline-flex rounded-full h-12 w-12 bg-primary/10 items-center justify-center text-primary border border-primary/30">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </span>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-bold text-on-surface">
                  Evaluating Startup Viability in India
                </h3>
                <div className="space-y-2 text-xs text-on-surface-variant text-left pt-3">
                  <div className={`flex items-center gap-2 transition-all ${validatingStep >= 0 ? 'text-primary font-bold' : 'opacity-40'}`}>
                    <Check className="h-3.5 w-3.5" />
                    <span>Deconstructing problem space & buyer persona...</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-all ${validatingStep >= 1 ? 'text-emerald-signal font-bold' : 'opacity-40'}`}>
                    <Check className="h-3.5 w-3.5" />
                    <span>Cross-referencing RBI, SEBI, PIB circulars & hiring velocity...</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-all ${validatingStep >= 2 ? 'text-violet-signal font-bold' : 'opacity-40'}`}>
                    <Check className="h-3.5 w-3.5" />
                    <span>Analyzing incumbent competitor defensibility & moats...</span>
                  </div>
                  <div className={`flex items-center gap-2 transition-all ${validatingStep >= 3 ? 'text-amber-signal font-bold' : 'opacity-40'}`}>
                    <Check className="h-3.5 w-3.5" />
                    <span>Synthesizing 6-dimension viability scorecard & 30-day MVP...</span>
                  </div>
                </div>
              </div>
            </div>
          ) : validationResult ? (
            /* Results Scorecard Dossier */
            <div className="space-y-6 animate-fade-up">
              {/* Scorecard Hero Banner */}
              <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${getScoreBg(validationResult.validationScore)}`}>
                        Score {validationResult.validationScore}/100 · {getScoreTierLabel(validationResult.validationScore)}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        Calibrated for Indian Market
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-on-surface mt-2 leading-snug">
                      "{validationResult.ideaText}"
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSaveIdea}
                      disabled={ideaSaved || isSavingIdea}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                        ideaSaved
                          ? 'bg-emerald-signal/15 border-emerald-signal/40 text-emerald-signal'
                          : 'bg-primary text-on-primary border-primary hover:opacity-90'
                      }`}
                    >
                      {ideaSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      <span>{ideaSaved ? 'Saved to Notebook' : isSavingIdea ? 'Saving...' : 'Save Idea'}</span>
                    </button>

                    <button
                      onClick={resetValidation}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-border bg-surface-low text-on-surface hover:bg-surface transition-colors"
                      title="Validate another"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-on-surface-variant" />
                      <span>New</span>
                    </button>
                  </div>
                </div>

                {/* 6-Dimension Score Meters */}
                <div className="space-y-3 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block">
                    6-DIMENSION SCORECARD
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(validationResult.scores).map(([metric, val]: [string, any]) => (
                      <div key={metric} className="rounded-xl border border-border bg-surface-low p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize font-bold text-on-surface truncate">
                            {metric.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className={`font-black ${getScoreColor(val)}`}>
                            {val}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-surface-high overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getScoreBarColor(val)} transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2-Column: Market Gaps & Competitors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="h-4 w-4 text-emerald-signal" />
                    <span>Market Gaps & Opportunities</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                    {validationResult.gaps.map((gap: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-signal font-bold mt-0.5">•</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-rose-signal" />
                    <span>Incumbent Competitor Moats</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
                    {validationResult.competitors.map((moat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-signal font-bold mt-0.5">•</span>
                        <span>{moat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended MVP Build Specification */}
              <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-2.5 shadow-xs">
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-primary" />
                  <span>Recommended 30-Day MVP Build Specification</span>
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {validationResult.mvpBuild}
                </p>
              </div>

              {/* Contextual AI Execution Blueprints */}
              <div className="glass-card rounded-2xl p-6 border border-border bg-surface space-y-5 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-violet-signal" />
                    <h3 className="text-sm font-bold text-on-surface">
                      AI Execution Actions for this Concept
                    </h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Generate customized blueprints for this thesis (consumes 1 AI credit).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRunFollowup('roadmap')}
                    disabled={isCreditsExhausted || followupLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      activeFollowupType === 'roadmap'
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border bg-surface-low hover:border-primary/50'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4 text-primary mb-1.5" />
                    <h4 className="text-xs font-bold text-on-surface">4-Week Build Roadmap</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Weekly sprint tasks & tech stack</p>
                  </button>

                  <button
                    onClick={() => handleRunFollowup('compliance')}
                    disabled={isCreditsExhausted || followupLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      activeFollowupType === 'compliance'
                        ? 'border-emerald-signal bg-emerald-signal/10 ring-1 ring-emerald-signal'
                        : 'border-border bg-surface-low hover:border-emerald-signal/50'
                    }`}
                  >
                    <CheckSquare className="h-4 w-4 text-emerald-signal mb-1.5" />
                    <h4 className="text-xs font-bold text-on-surface">Compliance Checklist</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">RBI, DPDP & CERT-In mandates</p>
                  </button>

                  <button
                    onClick={() => handleRunFollowup('gtm')}
                    disabled={isCreditsExhausted || followupLoading}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      activeFollowupType === 'gtm'
                        ? 'border-violet-signal bg-violet-signal/10 ring-1 ring-violet-signal'
                        : 'border-border bg-surface-low hover:border-violet-signal/50'
                    }`}
                  >
                    <Users2 className="h-4 w-4 text-violet-signal mb-1.5" />
                    <h4 className="text-xs font-bold text-on-surface">Target Enterprise ICPs</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Top 3 Indian pilot buyers</p>
                  </button>
                </div>

                {followupLoading && (
                  <div className="py-6 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-primary" />
                    <p className="mt-2 text-xs font-semibold text-on-surface-variant">Generating customized execution plan...</p>
                  </div>
                )}

                {followupData && (
                  <div className="rounded-xl border border-border bg-surface-low p-4 space-y-3 animate-fade-up">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                      <h4 className="text-xs font-bold text-on-surface">{followupData.title}</h4>
                      <button
                        onClick={() => {
                          const text = followupData.sections.map(s => `${s.subtitle}\n` + s.items.map(i => `• ${i}`).join('\n')).join('\n\n');
                          navigator.clipboard.writeText(text);
                          setCopiedSection(true);
                          setTimeout(() => setCopiedSection(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        {copiedSection ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedSection ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {followupData.sections.map((sec, idx) => (
                        <div key={idx} className="space-y-1">
                          <h5 className="text-[11px] font-bold text-primary uppercase tracking-wider">{sec.subtitle}</h5>
                          <ul className="space-y-1 text-xs text-on-surface-variant">
                            {sec.items.map((it, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2">
                                <span className="text-primary font-bold">•</span>
                                <span>{it}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State Box */
            <div className="glass-card rounded-2xl p-12 border border-dashed border-border bg-surface/50 text-center py-24 space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">
                Your idea scorecard will appear here
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Describe a startup concept on the left and click "Validate idea". We'll score demand, competition, feasibility, timing, India relevance and regulation, plus uncover market gaps, competitor moats, and a 30-day MVP build specification.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
