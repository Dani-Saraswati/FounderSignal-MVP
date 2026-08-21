import React, { useState } from 'react';
import { Opportunity } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { 
  TrendingUp, 
  Bookmark, 
  Layers, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

const RadialMetric = ({ score, label }: { score: number; label: string }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return 'text-emerald-signal';
    if (s >= 80) return 'text-violet-signal';
    if (s >= 70) return 'text-indigo-signal';
    return 'text-amber-signal';
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-md bg-surface-low border border-border/30">
      <div className="relative flex items-center justify-center w-10 h-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            className="text-on-surface opacity-10"
          />
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${getColor(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-on-surface">{score}</span>
      </div>
      <span className="mt-1 text-[9px] uppercase tracking-wider text-on-surface-variant/80 font-semibold">{label}</span>
    </div>
  );
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (id: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onViewDetails }) => {
  const { savedOpportunities, toggleSaveOpportunity } = useApp();
  const isSaved = savedOpportunities.includes(opportunity.id);
  const [showFeeds, setShowFeeds] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-signal';
    if (score >= 80) return 'text-violet-signal';
    if (score >= 70) return 'text-indigo-signal';
    return 'text-amber-signal';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-signal/10 text-emerald-signal border-emerald-signal/20';
    if (score >= 80) return 'bg-violet-signal/10 text-violet-signal border-violet-signal/20';
    if (score >= 70) return 'bg-indigo-signal/10 text-indigo-signal border-indigo-signal/20';
    return 'bg-amber-signal/10 text-amber-signal border-amber-signal/20';
  };

  // Sparklines points helper
  const getSparklinePath = (timeline: { value: number }[] = []) => {
    if (!timeline || timeline.length === 0) return 'M 0,15 L 100,15';
    const width = 100;
    const height = 30;
    const padding = 2;
    const minVal = Math.min(...timeline.map(t => t.value));
    const maxVal = Math.max(...timeline.map(t => t.value));
    const valRange = maxVal - minVal || 1;

    const points = timeline.map((t, index) => {
      const x = (index / Math.max(1, timeline.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((t.value - minVal) / valRange) * (height - padding * 2) - padding;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const hasFeeds = Boolean(
    opportunity.feeds &&
    ((opportunity.feeds.reddit && opportunity.feeds.reddit.length > 0) ||
     (opportunity.feeds.linkedin && opportunity.feeds.linkedin.length > 0) ||
     (opportunity.feeds.github && opportunity.feeds.github.length > 0))
  );

  return (
    <div className="relative glass-card flex flex-col justify-between rounded-lg p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-border bg-surface">
      {/* Card Header: Title & Vertical Badges */}
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getScoreBg(opportunity.score)}`}>
              {opportunity.vertical}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-surface-low border border-border text-on-surface-variant">
              {opportunity.industry.split(' / ')[1] || opportunity.industry}
            </span>
            {opportunity.founderFit && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-emerald-signal/15 text-emerald-signal border border-emerald-signal/30 flex items-center shadow-xs">
                ⚡ {opportunity.founderFit.fitScore}% Fit
              </span>
            )}
          </div>
          
          <button 
            onClick={() => toggleSaveOpportunity(opportunity.id)}
            className={`p-1.5 rounded-full hover:bg-surface-low transition-colors duration-200 ${isSaved ? 'text-primary' : 'text-on-surface-variant'}`}
            title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
          >
            <Bookmark className="h-4.5 w-4.5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Opportunity Title */}
        <h3 
          className="mt-3 text-lg font-bold leading-tight text-on-surface hover:text-primary cursor-pointer transition-colors duration-200" 
          onClick={() => onViewDetails(opportunity.id)}
        >
          {opportunity.title}
        </h3>

        {/* Dynamic score block & trend direction */}
        <div className="mt-4 flex items-center justify-between border-y border-border/60 py-3">
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <span className={`block text-3xl font-extrabold tracking-tight ${getScoreColor(opportunity.score)}`}>
                {opportunity.score}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
                Score
              </span>
            </div>
            
            {/* Sparkline chart */}
            <div className="flex flex-col items-start pl-2 border-l border-border/60">
              <svg className="h-7 w-24 overflow-visible" viewBox="0 0 100 30">
                <path
                  d={getSparklinePath(opportunity.signalsTimeline)}
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[9px] font-semibold text-on-surface-variant">6-Month Trend</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end text-emerald-signal font-bold text-sm">
              <TrendingUp className="h-4 w-4 mr-0.5" />
              <span>↑ {opportunity.changePercentage}%</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">
              Momentum
            </span>
          </div>
        </div>

        {/* Signal Matrix Grid */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <RadialMetric score={opportunity.scores.demand} label="Demand" />
          <RadialMetric score={opportunity.scores.hiring} label="Hiring" />
          <RadialMetric score={opportunity.scores.regulation} label="Regulation" />
          <RadialMetric score={opportunity.scores.skills} label="Skills" />
          <RadialMetric score={opportunity.scores.competition} label="Gap" />
          <RadialMetric score={opportunity.scores.timing} label="Timing" />
        </div>

        {/* Why this is interesting */}
        <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
          {opportunity.whyInteresting}
        </p>
      </div>

      {/* Card Footer: Metadata & Call to Action */}
      <div className="mt-5 border-t border-border/40 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-on-surface-variant">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-semibold">
              {opportunity.signalCount} signals • {opportunity.sourceCount} sources • {opportunity.lastUpdated}
            </span>
          </div>

          {hasFeeds && (
            <button
              onClick={() => setShowFeeds(!showFeeds)}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              {showFeeds ? 'Hide Feeds' : 'View Feeds'}
            </button>
          )}
        </div>

        {/* Collapsible Feeds Section */}
        {showFeeds && hasFeeds && (
          <div className="mt-3 space-y-2 p-3 bg-surface-low rounded-md border border-border/40 text-xs">
            {opportunity.feeds?.reddit && opportunity.feeds.reddit.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-rose-signal uppercase block">Reddit Discussions:</span>
                <ul className="list-disc pl-4 text-on-surface-variant text-[11px] space-y-0.5 mt-0.5">
                  {opportunity.feeds.reddit.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {opportunity.feeds?.linkedin && opportunity.feeds.linkedin.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-indigo-signal uppercase block">Hiring Trends:</span>
                <ul className="list-disc pl-4 text-on-surface-variant text-[11px] space-y-0.5 mt-0.5">
                  {opportunity.feeds.linkedin.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {opportunity.feeds?.github && opportunity.feeds.github.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-violet-signal uppercase block">GitHub Commits/Discussions:</span>
                <ul className="list-disc pl-4 text-on-surface-variant text-[11px] space-y-0.5 mt-0.5">
                  {opportunity.feeds.github.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => onViewDetails(opportunity.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Deep Dive Analysis</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
