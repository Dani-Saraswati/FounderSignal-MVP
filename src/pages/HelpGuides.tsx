import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Radar, 
  Sparkles, 
  UserCheck, 
  Briefcase, 
  Route, 
  Bookmark, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Database,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface HelpGuidesProps {
  onNavigateTab?: (tab: string) => void;
}

export const HelpGuides: React.FC<HelpGuidesProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaq, setExpandedFaq] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': false,
    'faq-3': false,
    'faq-4': false,
    'faq-5': false,
    'faq-6': false
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scoreBrackets = [
    {
      range: '90 – 100',
      label: 'Exceptional Market Signal',
      color: 'text-emerald-signal bg-emerald-signal/10 border-emerald-signal/30',
      description: 'High buyer urgency, imminent regulatory compliance deadlines (RBI/DPDP), high talent scarcity, and demonstrable monetization moats.'
    },
    {
      range: '80 – 89',
      label: 'High-Momentum Opportunity',
      color: 'text-violet-signal bg-violet-signal/10 border-violet-signal/30',
      description: 'Rapidly accelerating developer discussions, verified hiring demand volume, and strong enterprise pilot viability.'
    },
    {
      range: '70 – 79',
      label: 'Viable Early-Stage Opportunity',
      color: 'text-indigo-signal bg-indigo-signal/10 border-indigo-signal/30',
      description: 'Emerging technology niche with steady organic interest; requires founder-led customer discovery and lean MVP sequencing.'
    },
    {
      range: '< 70',
      label: 'Developing / Speculative',
      color: 'text-amber-signal bg-amber-signal/10 border-amber-signal/30',
      description: 'Nascent market signals with limited institutional urgency or fragmented monetization channels.'
    }
  ];

  const features = [
    {
      id: 'radar',
      title: 'Opportunity Radar',
      icon: Radar,
      summary: 'Curated daily feed of scored business opportunities. Filter by sector (BFSI, IT), sort by score or momentum, and view personalized ⚡ Founder Fit badges based on your onboarding profile.'
    },
    {
      id: 'validator',
      title: 'AI Idea Validator',
      icon: Sparkles,
      summary: 'Enter any startup thesis to evaluate market viability, 7-dimension score scorecard, competitor moats, regulatory gating, and save validated briefs directly to your private notebook.'
    },
    {
      id: 'builder',
      title: 'Builder Match',
      icon: UserCheck,
      summary: 'A 5-question diagnostic quiz that factors in your skills, domain knowledge, capital budget, and regulatory appetite to compute mathematical compatibility with active opportunities.'
    },
    {
      id: 'career',
      title: 'Career Signal',
      icon: Briefcase,
      summary: 'Upload or paste your resume to calculate your personal Market Demand Score (0-100), identify high-scarcity skill keywords, and explore matching live opportunities.'
    },
    {
      id: 'roadmap',
      title: 'Suggested Roadmap',
      icon: Route,
      summary: 'Deterministic 4-week execution blueprints breaking down schema design, compliance rule engines, frontend telemetry, and pilot customer outreach for any opportunity.'
    },
    {
      id: 'saves',
      title: 'Saved Watchlist',
      icon: Bookmark,
      summary: 'Bookmark opportunity dossiers to track their monthly signal trajectory, hiring updates, and regulatory circular releases over time.'
    }
  ];

  const faqs = [
    {
      id: 'faq-1',
      question: 'Where does FounderSignal get its market data?',
      answer: 'FounderSignal continuously monitors authentic public sources across India: GitHub Repositories Search API, PIB (Press Information Bureau) Government Circular RSS feeds, CERT-In Advisories, Dev.to Developer Discussions, and Reddit community JSON feeds. Signals are normalized, deduplicated via SHA-256 hashes, clustered into problem themes, and synthesized using Gemini AI into structured opportunity dossiers.'
    },
    {
      id: 'faq-2',
      question: 'How does the 5-to-7 Dimension Scoring Model work?',
      answer: 'Each opportunity receives a deterministic composite score: Demand Volume (30%) + Market Momentum Velocity (25%) + Regulatory Moat / Problem Severity (20%) + Commercial Intent (15%) + Competitive Gap (10%). Scores are calibrated specifically for the Indian enterprise and consumer tech landscape.'
    },
    {
      id: 'faq-3',
      question: 'How do AI Credits work?',
      answer: 'Every new registered user receives 5 free AI runs. Generating custom evaluations in the Idea Validator, requesting 4-Week Roadmaps, or executing compliance audits decrements one credit. Your remaining quota is tracked securely in the database and visible in your top header.'
    },
    {
      id: 'faq-4',
      question: 'How does Personalized "Founder Fit" work?',
      answer: 'During the 6-step onboarding wizard, you share your primary vertical, technical skills, capital budget, and regulatory appetite. FounderSignal cross-references your profile against active opportunities to compute a personalized match score (e.g. ⚡ 95% Fit) so you see the most relevant ideas first.'
    },
    {
      id: 'faq-5',
      question: 'Can I save my custom startup ideas?',
      answer: 'Yes! After validating an idea in the Idea Validator, click the "Save Idea" button. Your thesis, 7-dimension scorecard, competitor matrix, and recommended MVP are saved permanently to your account and accessible in the "Saved Ideas History" tab.'
    },
    {
      id: 'faq-6',
      question: 'Is FounderSignal financial or investment advice?',
      answer: 'No. FounderSignal provides empirical market intelligence and evidence synthesis from public datasets. Founders should always conduct independent customer discovery and diligence before committing capital or full-time resources.'
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-10 animate-fade-up">
      {/* Top Banner */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
          <BookOpen className="h-3.5 w-3.5" />
          <span>METHODOLOGY & USER MANUAL</span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">
          Help, Guides & Opportunity Methodology
        </h1>
        <p className="mt-1.5 text-sm text-on-surface-variant max-w-3xl">
          Everything you need to know about navigating market signals, interpreting opportunity scores, using AI evaluation studios, and executing 4-week MVP roadmaps.
        </p>

        {/* Search Input */}
        <div className="mt-6 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search guides, scoring questions, FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-low pl-10 pr-4 py-2.5 text-xs font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* 1. Opportunity Score Color Guide */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">1. Opportunity Score Visual Language</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            FounderSignal uses a consistent, standardized color taxonomy across cards, meters, and charts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreBrackets.map((bracket, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-5 border border-border bg-surface shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${bracket.color}`}>
                  Score {bracket.range}
                </span>
              </div>
              <h3 className="text-sm font-bold text-on-surface mt-3">{bracket.label}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mt-1.5">
                {bracket.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Core Features Overview */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">2. Platform Feature Walkthrough</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            How to use FounderSignal's interconnected modules to move from signal discovery to validation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="glass-card rounded-2xl p-5 border border-border bg-surface flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-on-surface">{feat.title}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
                    {feat.summary}
                  </p>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(feat.id)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
                  >
                    <span>Open {feat.title}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Authentic Data Provenance & Signal Ingestion */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-signal/10 text-emerald-signal">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-on-surface">Data Provenance & Verification Guarantee</h2>
            <p className="text-xs text-on-surface-variant">How public signals become ranked business opportunities.</p>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-on-surface-variant max-w-4xl">
          Every opportunity displayed on FounderSignal is backed by verifiable multi-source evidence. Unlike generic chatbots that hallucinate ideas, our system operates on a deterministic pipeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl border border-border/70 bg-surface-low p-3.5 text-xs">
            <span className="font-bold text-primary block mb-1">1. Live Data Ingestion</span>
            <span className="text-on-surface-variant">Pulls from GitHub APIs, PIB RSS releases, CERT-In advisories, and developer discussions.</span>
          </div>
          <div className="rounded-xl border border-border/70 bg-surface-low p-3.5 text-xs">
            <span className="font-bold text-primary block mb-1">2. SHA-256 Deduplication</span>
            <span className="text-on-surface-variant">Filters repetitive mentions and extracts exact dates, agency links, and salary brackets.</span>
          </div>
          <div className="rounded-xl border border-border/70 bg-surface-low p-3.5 text-xs">
            <span className="font-bold text-primary block mb-1">3. Problem Clustering</span>
            <span className="text-on-surface-variant">Correlates regulatory mandates with surging tech role shortages in target Indian niches.</span>
          </div>
          <div className="rounded-xl border border-border/70 bg-surface-low p-3.5 text-xs">
            <span className="font-bold text-primary block mb-1">4. LLM Synthesis & Scoring</span>
            <span className="text-on-surface-variant">Generates complete business briefs with competitor moats and persists to SQLite.</span>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Frequently Asked Questions</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Quick answers to common questions about FounderSignal.</p>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedFaq[faq.id];
            return (
              <div 
                key={faq.id} 
                className="glass-card rounded-xl border border-border bg-surface overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-on-surface hover:text-primary transition-colors"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 shrink-0 text-on-surface-variant" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-border/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <p className="py-6 text-center text-xs text-on-surface-variant">
              No FAQs matched your search.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
