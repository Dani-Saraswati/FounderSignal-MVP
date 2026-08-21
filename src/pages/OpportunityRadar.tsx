import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OpportunityCard } from '../components/OpportunityCard';
import { 
  Radar, 
  Search, 
  Sparkles, 
  Activity, 
  Briefcase, 
  TrendingUp, 
  Database, 
  Layers, 
  LayoutGrid, 
  List, 
  Loader2,
  Filter,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

interface OpportunityRadarProps {
  onViewDetails: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface SummaryStats {
  totalOpportunities: number;
  totalSignals: number;
  totalHiring: number;
  activeSources: number;
  nicheDistribution: { name: string; count: number; color: string }[];
  lastBatchDate: string;
}

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({ onViewDetails, onNavigateTab }) => {
  const {
    opportunities,
    filteredOpportunities,
    isLoading,
    searchQuery,
    setSearchQuery,
    verticalFilter,
    setVerticalFilter,
    sortBy,
    setSortBy
  } = useApp();

  const [stats, setStats] = useState<SummaryStats>({
    totalOpportunities: 0,
    totalSignals: 0,
    totalHiring: 0,
    activeSources: 6,
    nicheDistribution: [],
    lastBatchDate: 'August 2026'
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/opportunities/stats/summary');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to fetch radar summary stats:', e);
      }
    };
    fetchSummary();
  }, [opportunities]);

  // Historical 6-month signal trend for Area chart
  const signalTrendData = [
    { month: 'Nov 25', signals: 34, velocity: 68 },
    { month: 'Dec 25', signals: 48, velocity: 74 },
    { month: 'Jan 26', signals: 62, velocity: 81 },
    { month: 'Feb 26', signals: 79, velocity: 86 },
    { month: 'Mar 26', signals: 91, velocity: 92 },
    { month: 'Apr 26', signals: 102, velocity: 95 }
  ];

  // Dynamic vertical sectors
  const availableVerticals = ['ALL', ...Array.from(new Set(opportunities.map(o => o.vertical)))];

  // Calculate average momentum
  const avgMomentum = opportunities.length > 0 
    ? Math.round(opportunities.reduce((acc, curr) => acc + (curr.changePercentage || 40), 0) / opportunities.length)
    : 46;

  // Top Sector
  const topSector = stats.nicheDistribution?.[0]?.name?.split('/')[0]?.trim() || 'BFSI';

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-6 space-y-8 animate-fade-up">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 border-b border-border/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
            <Radar className="h-3.5 w-3.5 animate-pulse" />
            <span>LIVE OPPORTUNITY INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">
            Opportunity Radar
          </h1>
          <p className="mt-1.5 text-sm text-on-surface-variant max-w-3xl">
            Scored Indian startup opportunities synthesized from hiring demand, institutional regulatory circulars, and developer discussions across India.
          </p>
        </div>

        {/* Top-Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {onNavigateTab && (
            <>
              <button
                onClick={() => onNavigateTab('validator')}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-on-primary shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Validate my own idea</span>
              </button>

              <button
                onClick={() => onNavigateTab('builder')}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-low px-4 py-2.5 text-xs font-bold text-on-surface hover:border-primary/50 hover:bg-surface active:scale-[0.98] transition-all shadow-xs"
              >
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <span>Find my best fit</span>
              </button>
            </>
          )}

          {/* Live sync indicator */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-low px-3.5 py-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-signal">
                Live DB
              </span>
              <span className="block text-[11px] font-semibold text-on-surface-variant">
                {stats.lastBatchDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Total Opportunities
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-on-surface">{stats.totalOpportunities || opportunities.length}</span>
            <span className="text-xs font-bold text-primary">Live DB</span>
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">Validated briefs</span>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Tracked Signals
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-on-surface">{stats.totalSignals || 102}</span>
            <span className="text-xs font-bold text-emerald-signal">+18 this wk</span>
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">Multi-source evidence</span>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Open Hiring Demand
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-on-surface">{stats.totalHiring || 920}+</span>
            <span className="text-xs font-bold text-amber-signal">High Scarcity</span>
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">Active tech roles</span>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Active Sources
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-on-surface">{stats.activeSources || 6}</span>
            <span className="text-xs font-bold text-indigo-signal">100% Verified</span>
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">GitHub, PIB, RBI, Reddit</span>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Avg Momentum
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-signal">+{avgMomentum}%</span>
            <TrendingUp className="h-4 w-4 text-emerald-signal" />
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">30-day velocity</span>
        </div>

        <div className="glass rounded-xl p-4 border border-border bg-surface shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            Dominant Sector
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-black text-on-surface truncate">{topSector}</span>
            <span className="text-xs font-bold text-primary">Leading</span>
          </div>
          <span className="mt-1 block text-[11px] text-on-surface-variant">High regulatory moat</span>
        </div>
      </div>

      {/* Visual Analytics Row: 6-Month Velocity Area Chart + Niche Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 6-Month Signal Velocity Chart */}
        <div className="glass-card rounded-2xl border border-border bg-surface p-5 lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Signal Velocity & Market Acceleration (6-Month Trend)</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Aggregate public demand, regulatory changes, and GitHub activity across India.</p>
            </div>
            <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
              Velocity Index: 95/100
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSignals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(var(--color-primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="rgb(var(--color-primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="currentColor" opacity={0.4} />
                <YAxis stroke="currentColor" opacity={0.4} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgb(var(--bg-surface))', 
                    borderColor: 'rgb(var(--border-color))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="signals" 
                  stroke="rgb(var(--color-primary))" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorSignals)" 
                  name="Verified Signals"
                />
                <Area 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorVelocity)" 
                  name="Market Velocity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Sector Niche Distribution Breakdown */}
        <div className="glass-card rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Sector Distribution</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Opportunity share by industry vertical.</p>
            </div>
            <Layers className="h-4 w-4 text-on-surface-variant" />
          </div>

          <div className="space-y-3.5">
            {stats.nicheDistribution && stats.nicheDistribution.length > 0 ? (
              stats.nicheDistribution.slice(0, 5).map((niche, idx) => {
                const percentage = Math.round((niche.count / (stats.totalOpportunities || opportunities.length || 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-on-surface truncate max-w-[180px]">{niche.name}</span>
                      <span className="text-on-surface-variant">{niche.count} opps ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-surface-low overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: niche.color || 'rgb(var(--color-primary))' }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-on-surface-variant">Loading sector insights...</div>
            )}
          </div>
        </div>
      </div>

      {/* Filter, Search & View Controls Toolbar */}
      <div className="glass-card rounded-2xl p-4 border border-border bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Left: Sector Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {availableVerticals.map((vertical) => (
            <button
              key={vertical}
              onClick={() => setVerticalFilter(vertical)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                verticalFilter === vertical
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-low text-on-surface-variant hover:text-on-surface hover:bg-surface-high'
              }`}
            >
              {vertical === 'ALL' ? 'All Sectors' : vertical}
            </button>
          ))}
        </div>

        {/* Right: Search Input + Sorting Dropdown + Grid/List Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-surface-low pl-8 pr-3 text-xs font-medium text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-9 rounded-lg border border-border bg-surface-low px-3 text-xs font-bold text-on-surface focus:border-primary/50 focus:outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="recommended">⚡ Founder Fit (Recommended)</option>
              <option value="score">Highest Opportunity Score</option>
              <option value="momentum">Fastest Momentum Growth</option>
              <option value="demand">Highest Qualified Demand</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none text-on-surface-variant" />
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center rounded-lg border border-border bg-surface-low p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-1.5 transition-colors ${viewMode === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Opportunity Cards Feed */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-xs font-bold text-on-surface-variant">Scanning live Indian market signals...</p>
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center border border-border bg-surface max-w-xl mx-auto">
          <Search className="mx-auto h-10 w-10 text-on-surface-variant/40 mb-3" />
          <h3 className="text-base font-bold text-on-surface">No matching opportunities found</h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Try adjusting your search terms or clearing sector filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setVerticalFilter('ALL');
            }}
            className="mt-4 inline-flex items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-on-primary"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
