import React, { useState, useEffect } from 'react';
import { Opportunity } from '../data/mockData';
import { 
  ArrowLeft, 
  Layers, 
  ShieldAlert, 
  DollarSign, 
  Code, 
  Building, 
  Info, 
  Scale, 
  Award, 
  Bookmark, 
  BookmarkCheck,
  Users, 
  Briefcase,
  Loader2,
  Sparkles,
  ExternalLink,
  Route,
  Check,
  TrendingUp,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '../context/AppContext';

interface OpportunityDetailProps {
  opportunityId: string;
  onBack: () => void;
  onValidateIdea?: (ideaText: string) => void;
  onOpenRoadmap?: (opportunityId: string) => void;
}

export const OpportunityDetail: React.FC<OpportunityDetailProps> = ({ 
  opportunityId, 
  onBack,
  onValidateIdea,
  onOpenRoadmap
}) => {
  const { opportunities, savedOpportunities, toggleSaveOpportunity } = useApp();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(() => {
    return opportunities.find(opp => opp.id === opportunityId) || null;
  });
  const [isLoading, setIsLoading] = useState(!opportunity);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/opportunities/${opportunityId}`);
        if (res.ok) {
          const data = await res.json();
          setOpportunity(data.opportunity);
        }
      } catch (e) {
        console.error('Failed to fetch opportunity detail:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [opportunityId]);

  const isSaved = opportunity ? savedOpportunities.includes(opportunity.id) : false;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-on-surface flex flex-col items-center justify-center animate-fade-up">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
        <h3 className="text-base font-bold">Loading Opportunity Deep Dive</h3>
        <p className="text-xs text-on-surface-variant mt-1">Retrieving regulatory catalysts, talent landscape, and execution blueprints...</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-on-surface">
        <h3 className="text-xl font-bold">Opportunity Not Found</h3>
        <p className="text-xs text-on-surface-variant mt-1">This opportunity ID may not exist in the live database catalog.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl">
          Back to Radar
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-signal';
    if (score >= 80) return 'text-violet-signal';
    if (score >= 70) return 'text-indigo-signal';
    return 'text-amber-signal';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-signal/15 text-emerald-signal border-emerald-signal/30';
    if (score >= 80) return 'bg-violet-signal/15 text-violet-signal border-violet-signal/30';
    if (score >= 70) return 'bg-indigo-signal/15 text-indigo-signal border-indigo-signal/30';
    return 'bg-amber-signal/15 text-amber-signal border-amber-signal/30';
  };

  const getWeightLabel = (score: number) => {
    if (score >= 90) return 'Exceptional Market Signal';
    if (score >= 80) return 'High-Momentum Opportunity';
    if (score >= 70) return 'Viable Early-Stage Opportunity';
    return 'Developing / Speculative';
  };

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-6 animate-fade-up">
      
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Opportunity Radar</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onValidateIdea && (
            <button
              onClick={() => onValidateIdea(opportunity.title + ': ' + opportunity.problem)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Validate in AI Studio</span>
            </button>
          )}

          <button 
            onClick={() => toggleSaveOpportunity(opportunity.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shadow-xs ${
              isSaved 
                ? 'bg-emerald-signal/15 border-emerald-signal/40 text-emerald-signal' 
                : 'bg-surface-low border-border text-on-surface hover:border-primary/50'
            }`}
          >
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
            <span>{isSaved ? 'Saved to Watchlist' : 'Save Opportunity'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Header & Analytical Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols): Core Narrative, Charts, Signals, Moats */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Hero Card */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface shadow-md space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border ${getScoreBg(opportunity.score)}`}>
                Score {opportunity.score}/100 · {getWeightLabel(opportunity.score)}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-surface-low border border-border text-on-surface-variant">
                {opportunity.vertical}
              </span>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-surface-low border border-border text-on-surface-variant">
                {opportunity.industry}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight leading-tight">
              {opportunity.title}
            </h1>

            {/* Core Problem Callout */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                Core Underlying Problem
              </span>
              <p className="text-xs sm:text-sm text-on-surface font-medium leading-relaxed">
                {opportunity.problem}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pt-1">
              {opportunity.overview}
            </p>
          </div>

          {/* 6-Month Signal Growth Trajectory */}
          <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>6-Month Signal Growth & Market Velocity</span>
              </h3>
              <span className="text-xs font-bold text-emerald-signal">
                +{opportunity.momentum || 46}% 30-Day Velocity
              </span>
            </div>

            {opportunity.signalsTimeline && opportunity.signalsTimeline.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={opportunity.signalsTimeline} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#93a9bd" fontSize={10} tickLine={false} />
                    <YAxis stroke="#93a9bd" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1524',
                        borderColor: '#28374e',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#e2ecf5'
                      }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#7dd3fc" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            <div className="bg-surface-low rounded-xl p-3.5 border border-border/50 text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-on-surface">Demand Interpretation:</span> {opportunity.demandAnalysis}
            </div>
          </div>

          {/* Regulatory Frameworks & Circulars */}
          {opportunity.regulatorySignals && opportunity.regulatorySignals.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <Scale className="h-4 w-4 text-indigo-signal" />
                <span>Regulatory Catalysts & Frameworks</span>
              </h3>
              <div className="space-y-3">
                {opportunity.regulatorySignals.map((reg, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-surface-low p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-on-surface">{reg.regulationName}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {reg.agency}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-semibold">{reg.date}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {reg.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Labor Market & Active Hiring Velocity */}
          {opportunity.hiringSignals && opportunity.hiringSignals.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-emerald-signal" />
                <span>Labor Market & Active Tech Hiring Demand</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/60 text-xs">
                  <thead className="bg-surface-low">
                    <tr>
                      <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Role Title</th>
                      <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Velocity</th>
                      <th className="px-3.5 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Salary Range</th>
                      <th className="px-3.5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Openings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {opportunity.hiringSignals.map((hire, idx) => (
                      <tr key={idx} className="hover:bg-surface-low/40">
                        <td className="px-3.5 py-2.5 font-bold text-on-surface">{hire.role}</td>
                        <td className="px-3.5 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hire.volume === 'High' ? 'bg-emerald-signal/15 text-emerald-signal' : 'bg-amber-signal/15 text-amber-signal'
                          }`}>
                            {hire.volume} Velocity
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-on-surface-variant">{hire.salaryRange}</td>
                        <td className="px-3.5 py-2.5 text-right font-bold text-on-surface">{hire.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Competitor Landscape & Market Gaps */}
          <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-signal" />
              <span>Competitor Landscape & Market Gaps</span>
            </h3>

            {opportunity.competitionList && opportunity.competitionList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {opportunity.competitionList.map((comp, idx) => (
                  <div key={idx} className="rounded-xl border border-border p-3.5 bg-surface-low space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      {comp.category}
                    </span>
                    <h4 className="text-xs font-bold text-on-surface">{comp.name}</h4>
                    <div className="flex justify-between items-center text-[11px] text-on-surface-variant pt-1">
                      <span>Strength: <strong>{comp.strength}</strong></span>
                      <span>{comp.pricing}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {opportunity.marketGap && (
              <div className="rounded-xl border border-amber-signal/30 bg-amber-signal/10 p-4 space-y-1">
                <h4 className="text-xs font-bold text-amber-signal flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  <span>Identified Arbitrage / Market Gap</span>
                </h4>
                <p className="text-xs text-on-surface leading-relaxed">
                  {opportunity.marketGap}
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Score Breakdown, MVP Spec, Monetization, Risks */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 7-Dimension Score Breakdown */}
          <div className="glass-card rounded-2xl p-6 border border-border bg-surface shadow-md space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block text-center">
              OPPORTUNITY CONVICTION SCORE
            </span>
            <div className="text-center space-y-1">
              <span className={`text-5xl font-black tracking-tight ${getScoreColor(opportunity.score)} block`}>
                {opportunity.score}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Out of 100
              </span>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/50 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Demand Intensity</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.demand ?? 92}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Hiring Velocity</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.hiring ?? 88}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Regulatory Impact</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.regulation ?? 94}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Skill Scarcity</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.skills ?? 85}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Competition Gap</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.competition ?? 80}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Timing Window</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.timing ?? 90}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">India Relevance</span>
                <span className="font-bold text-on-surface">{opportunity.scores?.indiaRelevance ?? 95}</span>
              </div>
            </div>
          </div>

          {/* MVP Build Blueprint */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Code className="h-4 w-4" />
              <span>Recommended MVP Build</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {opportunity.mvpRecommendation}
            </p>
          </div>

          {/* Monetization Strategy */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-signal flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              <span>Monetization Strategy</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {opportunity.monetizationHypothesis}
            </p>
          </div>

          {/* India Context */}
          <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-signal flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>India Market Specifics</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {opportunity.indiaRelevanceText}
            </p>
          </div>

          {/* Primary Risks */}
          {opportunity.risks && opportunity.risks.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-border bg-surface space-y-2.5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-signal flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Primary Risk Vectors</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-on-surface-variant">
                {opportunity.risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-signal font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
