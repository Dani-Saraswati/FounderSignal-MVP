import React, { useState } from 'react';
import { 
  Route, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  ShieldCheck, 
  Code, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SuggestedRoadmapProps {
  onViewDetails?: (id: string) => void;
  onNavigateValidator?: () => void;
}

export const SuggestedRoadmap: React.FC<SuggestedRoadmapProps> = ({ 
  onViewDetails, 
  onNavigateValidator 
}) => {
  const { opportunities } = useApp();
  const [selectedOppId, setSelectedOppId] = useState<string>(
    opportunities[0]?.id || 'bfsi-ai-compliance'
  );
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'w1-t1': true,
    'w1-t2': true
  });
  const [copied, setCopied] = useState<boolean>(false);

  const currentOpp = opportunities.find(o => o.id === selectedOppId) || opportunities[0];

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const roadmapWeeks = [
    {
      week: 'Week 1',
      title: 'Data Architecture, Schemas & Authentication',
      focus: 'Foundations & Ingestion Pipeline',
      badge: 'Infrastructure',
      badgeColor: 'text-indigo-signal bg-indigo-signal/10 border-indigo-signal/20',
      tasks: [
        { id: 'w1-t1', text: 'Define relational database tables for signals, circulars, and entity audit trails.' },
        { id: 'w1-t2', text: 'Configure Google OAuth 2.0 and JWT authorization-code session middleware.' },
        { id: 'w1-t3', text: 'Implement SHA-256 deduplication and normalization pipelines for raw signal ingestion.' }
      ],
      deliverable: 'Running backend service with persistent SQLite/Postgres and verified auth token exchange.'
    },
    {
      week: 'Week 2',
      title: 'Core Compliance Rule Engine & Connector Layer',
      focus: 'Business Logic & Real-time Evaluation',
      badge: 'Core Engine',
      badgeColor: 'text-primary bg-primary/10 border-primary/20',
      tasks: [
        { id: 'w2-t1', text: `Implement deterministic scoring algorithm for ${currentOpp?.vertical || 'BFSI'} domain rules.` },
        { id: 'w2-t2', text: 'Build real-time adapter for institutional regulatory feeds (RBI/SEBI/CERT-In).' },
        { id: 'w2-t3', text: 'Integrate multi-LLM synthesis fallback with strict JSON schema validation.' }
      ],
      deliverable: 'Automated signal evaluation engine producing scored briefs in <2.5 seconds.'
    },
    {
      week: 'Week 3',
      title: 'Founder Intelligence UI & Diligence Scorecards',
      focus: 'Frontend Experience & User Feedback',
      badge: 'UI & Analytics',
      badgeColor: 'text-amber-signal bg-amber-signal/10 border-amber-signal/20',
      tasks: [
        { id: 'w3-t1', text: 'Build Opportunity Radar grid with sparklines, momentum meters, and founder fit badges.' },
        { id: 'w3-t2', text: 'Implement 6-month historical timeline graphs and authentic provenance drawer.' },
        { id: 'w3-t3', text: 'Add contextual AI milestone execution generators with user credit tracking.' }
      ],
      deliverable: 'Responsive web application with all 8 visual themes and instant ⌘K search.'
    },
    {
      week: 'Week 4',
      title: 'Production Deployment & Pilot Customer Onboarding',
      focus: 'Go-to-Market & Validation',
      badge: 'Launch & Pilots',
      badgeColor: 'text-emerald-signal bg-emerald-signal/10 border-emerald-signal/20',
      tasks: [
        { id: 'w4-t1', text: 'Deploy single-process production Node.js container with TLS termination and health checks.' },
        { id: 'w4-t2', text: 'Onboard first 3 Indian startup design partners for weekly opportunity telemetry.' },
        { id: 'w4-t3', text: 'Set up automated daily background ingestion cron with error alert notifications.' }
      ],
      deliverable: 'Live production URL with active founders generating validated execution roadmaps.'
    }
  ];

  const allTaskIds = roadmapWeeks.flatMap(w => w.tasks.map(t => t.id));
  const completedCount = allTaskIds.filter(id => completedTasks[id]).length;
  const progressPercent = Math.round((completedCount / allTaskIds.length) * 100);

  const handleCopyRoadmap = () => {
    const text = `4-WEEK EXECUTION ROADMAP: ${currentOpp?.title}\n\n` + 
      roadmapWeeks.map(w => `${w.week}: ${w.title}\n` + w.tasks.map(t => `- [${completedTasks[t.id] ? 'x' : ' '}] ${t.text}`).join('\n')).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
            <Route className="h-3.5 w-3.5" />
            <span>ACTIONABLE BUILD SEQUENCING</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">
            Suggested 4-Week MVP Roadmap
          </h1>
          <p className="mt-1.5 text-sm text-on-surface-variant max-w-3xl">
            Deterministic week-by-week technical blueprints to validate market demand, build regulatory moats, and launch with paying Indian design partners.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyRoadmap}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-low px-3 py-2 text-xs font-bold text-on-surface hover:border-primary/40 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-signal" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied Plan' : 'Copy Roadmap'}</span>
          </button>
          {onNavigateValidator && (
            <button
              onClick={onNavigateValidator}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-on-primary shadow-sm hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Validate in AI Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Opportunity Selector Bar */}
      <div className="glass-card rounded-xl p-4 border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-black text-sm">
            {currentOpp?.score || 90}
          </div>
          <div>
            <label htmlFor="opp-select" className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block">
              Active Opportunity Blueprint
            </label>
            <select
              id="opp-select"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="mt-0.5 bg-transparent font-bold text-sm text-on-surface focus:outline-none cursor-pointer"
            >
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id} className="bg-surface text-on-surface">
                  {opp.title} ({opp.vertical} · Score {opp.score})
                </option>
              ))}
            </select>
          </div>
        </div>

        {onViewDetails && (
          <button
            onClick={() => onViewDetails(selectedOppId)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline shrink-0"
          >
            <span>Inspect Full Signal Dossier</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 border border-border bg-surface">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Roadmap Completion
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-on-surface">{progressPercent}%</span>
            <span className="text-xs font-bold text-primary">{completedCount} / {allTaskIds.length} tasks</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-low overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Estimated Runway
          </div>
          <div className="mt-2 text-2xl font-black text-on-surface">
            4 Weeks
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            Full-time founder / 2-person squad
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Compliance Moat
          </div>
          <div className="mt-2 text-sm font-bold text-on-surface truncate">
            {currentOpp?.regulatorySignals?.[0]?.regulationName || 'RBI & DPDP Framework'}
          </div>
          <div className="mt-1 text-xs text-emerald-signal font-semibold">
            Institutional Barrier to Entry
          </div>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Target Pilot Cohort
          </div>
          <div className="mt-2 text-2xl font-black text-on-surface">
            3-5 Enterprise
          </div>
          <div className="mt-1 text-xs text-on-surface-variant">
            Design partner commitments
          </div>
        </div>
      </div>

      {/* 4-Week Milestone Timeline */}
      <div className="space-y-6">
        {roadmapWeeks.map((week, idx) => {
          const isCurrent = idx === 0 || roadmapWeeks[idx - 1].tasks.every(t => completedTasks[t.id]);
          return (
            <div 
              key={week.week}
              className={`glass-card rounded-2xl border transition-all p-6 ${
                isCurrent 
                  ? 'border-primary/40 bg-surface shadow-md' 
                  : 'border-border/60 bg-surface-low/30'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary font-black text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-on-surface">{week.week}: {week.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${week.badgeColor}`}>
                        {week.badge}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">Focus: {week.focus}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>Sprint Duration: 7 Days</span>
                </div>
              </div>

              {/* Task Checklist */}
              <div className="space-y-3 mb-5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                  Sprint Execution Milestones
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {week.tasks.map((task) => {
                    const isDone = completedTasks[task.id];
                    return (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`flex items-start gap-3 rounded-xl p-3.5 text-left border transition-all ${
                          isDone
                            ? 'bg-emerald-signal/5 border-emerald-signal/30 text-on-surface'
                            : 'bg-surface-low/60 border-border hover:border-primary/40 text-on-surface'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-signal shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-on-surface-variant/40 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-xs font-medium leading-snug ${isDone ? 'line-through opacity-70' : ''}`}>
                          {task.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deliverable Badge */}
              <div className="flex items-center gap-2 rounded-lg bg-surface-low px-3.5 py-2.5 text-xs border border-border/50">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span className="font-bold text-on-surface">Target Deliverable:</span>
                <span className="text-on-surface-variant">{week.deliverable}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
