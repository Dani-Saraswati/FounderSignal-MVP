import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Layers, 
  Cpu, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Database,
  RefreshCw,
  Clock,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';

interface AdminMetricsResponse {
  metrics: {
    totalUsers: number;
    activeOnboardedFounders: number;
    totalOpportunities: number;
    totalSignalsParsed: number;
    totalSavedItems: number;
    totalValidationsRun: number;
    healthySourcesCount: number;
    totalSourcesCount: number;
  };
  sourceHealth: {
    name: string;
    status: string;
    latency: string;
    volume: number;
    lastRun: string;
  }[];
  pipelineStages: {
    stage: string;
    count: number;
    percent: number;
  }[];
  userGrowthData: {
    day: string;
    activeUsers: number;
  }[];
  recentLogs: {
    event_type: string;
    message: string;
    created_at: string;
  }[];
}

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<AdminMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to load admin metrics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleTriggerIngestion = async () => {
    setIsTriggering(true);
    setTriggerSuccess(null);
    try {
      const res = await fetch('/api/admin/trigger-ingestion', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setTriggerSuccess('Ingestion pipeline batch triggered successfully. Adapters refreshed.');
        setTimeout(() => {
          fetchMetrics();
          setTriggerSuccess(null);
        }, 2000);
      }
    } catch (e) {
      console.error('Failed to trigger ingestion:', e);
    } finally {
      setIsTriggering(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-on-surface">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-spin">
          <Settings className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold">Querying Operational Database Metrics</h3>
        <p className="text-xs text-on-surface-variant mt-1">Collecting ingestion adapter logs, table counts, and active user telemetry...</p>
      </div>
    );
  }

  const { metrics, sourceHealth, pipelineStages, userGrowthData, recentLogs } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight flex items-center">
            <Settings className="h-6 w-6 mr-2 text-primary" />
            Admin Analytics & Ingestion Control Panel
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Live operational observability for the SQLite database, data ingestion health, and user telemetry.
          </p>
        </div>

        <button
          onClick={handleTriggerIngestion}
          disabled={isTriggering}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-xs font-bold hover:opacity-95 transition-opacity self-start sm:self-center shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isTriggering ? 'animate-spin' : ''}`} />
          <span>{isTriggering ? 'Running Ingestion Pipeline...' : 'Trigger Pipeline Ingestion'}</span>
        </button>
      </div>

      {triggerSuccess && (
        <div className="mb-6 rounded-lg bg-emerald-signal/15 border border-emerald-signal/30 p-3.5 flex items-center space-x-2 text-xs font-bold text-emerald-signal">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{triggerSuccess}</span>
        </div>
      )}

      {/* Overview Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered Founders</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="mt-2 block text-2xl font-black text-on-surface">
            {metrics.totalUsers}
          </span>
          <span className="text-[10px] text-emerald-signal font-semibold flex items-center mt-1">
            <ShieldCheck className="h-3 w-3 mr-0.5" />
            {metrics.activeOnboardedFounders} completed onboarding
          </span>
        </div>

        <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Database Signals</span>
            <Database className="h-4 w-4 text-violet-signal" />
          </div>
          <span className="mt-2 block text-2xl font-black text-on-surface">
            {metrics.totalSignalsParsed}
          </span>
          <span className="text-[10px] text-on-surface-variant/80 flex items-center mt-1">
            Across {metrics.totalOpportunities} synthesized briefs
          </span>
        </div>

        <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Validations & Saves</span>
            <Bookmark className="h-4 w-4 text-indigo-signal" />
          </div>
          <span className="mt-2 block text-2xl font-black text-on-surface">
            {metrics.totalValidationsRun + metrics.totalSavedItems}
          </span>
          <span className="text-[10px] text-on-surface-variant/80 flex items-center mt-1">
            {metrics.totalSavedItems} saved items • {metrics.totalValidationsRun} idea queries
          </span>
        </div>

        <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-[10px] font-bold uppercase tracking-wider">Adapter Health Status</span>
            <Activity className="h-4 w-4 text-emerald-signal" />
          </div>
          <span className="mt-2 block text-2xl font-black text-on-surface">
            {metrics.healthySourcesCount} / {metrics.totalSourcesCount}
          </span>
          <span className="text-[10px] text-emerald-signal font-semibold flex items-center mt-1">
            100% operational uptime
          </span>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Pipeline Funnel and Ingestion Health (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ingestion Source Health from DB */}
          <div className="glass-card rounded-lg p-6 border border-border bg-surface">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
              Ingestion Adapters Health Monitors (Live DB Table)
            </h3>
            <div className="space-y-3">
              {sourceHealth.map((src, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-surface-low/30 hover:bg-surface-low/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    {src.status === 'Healthy' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-signal" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-signal animate-pulse" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{src.name}</h4>
                      <span className="text-[9px] text-on-surface-variant/80 block mt-0.5">
                        Volume: {src.volume} items • Latency: {src.latency} • Last Polled: {src.lastRun}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    src.status === 'Healthy' ? 'bg-emerald-signal/15 text-emerald-signal' : 'bg-amber-signal/15 text-amber-signal'
                  }`}>
                    {src.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Active Growth chart */}
          <div className="glass-card rounded-lg p-6 border border-border bg-surface">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
              Platform Engagement Trend (Daily Active Telemetry)
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="var(--text-on-surface-variant)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--text-on-surface-variant)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface-low)',
                      borderColor: 'var(--border-color)',
                      borderRadius: 'var(--radius-default)',
                      fontSize: '12px',
                      color: 'var(--text-on-surface)'
                    }}
                  />
                  <Line type="monotone" dataKey="activeUsers" stroke="var(--color-primary)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Side: Pipeline stage funnel & Recent Logs (Span 1) */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4">
              Pipeline Conversion Funnel
            </h3>
            <div className="space-y-4">
              {pipelineStages.map((stage, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-on-surface-variant">{stage.stage}</span>
                    <span className="font-bold text-on-surface">{stage.count} items</span>
                  </div>
                  <div className="w-full h-2 bg-surface-low rounded-full overflow-hidden border border-border/40">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${Math.max(2, stage.percent)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database System Audit Logs */}
          <div className="glass-card rounded-lg p-5 border border-border bg-surface">
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-primary" />
              Live Audit Log Events
            </h3>
            <div className="space-y-2 text-xs divide-y divide-border/40 max-h-56 overflow-y-auto pr-1">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.map((log, idx) => (
                  <div key={idx} className="pt-2 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary text-[10px] uppercase">{log.event_type}</span>
                      <span className="text-[9px] text-on-surface-variant">{log.created_at}</span>
                    </div>
                    <p className="text-[11px] text-on-surface mt-0.5 leading-relaxed">{log.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-on-surface-variant">No events recorded in audit log yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
