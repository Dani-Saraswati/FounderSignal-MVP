import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStyle, ThemeName } from '../context/StyleContext';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Zap, 
  Bell, 
  Shield, 
  Check, 
  LogOut, 
  Save, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, token, logout } = useAuth();
  const { theme, setTheme, themeOptions } = useStyle();
  
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!token) return;
        const res = await fetch('/api/user/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setEmailAlerts(Boolean(data.settings.email_alerts));
            setWeeklyDigest(Boolean(data.settings.weekly_digest));
            setExportFormat(data.settings.export_format || 'pdf');
            if (data.settings.theme && themeOptions.some(t => t.id === data.settings.theme)) {
              setTheme(data.settings.theme as ThemeName);
            }
          }
        }
      } catch (e) {}
    };
    fetchSettings();
  }, [token]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      if (token) {
        await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            theme,
            emailAlerts,
            weeklyDigest,
            exportFormat
          })
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 space-y-8 animate-fade-up">
      {/* Top Banner */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
          <SettingsIcon className="h-3.5 w-3.5" />
          <span>PREFERENCES & SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">
          Application Settings
        </h1>
        <p className="mt-1.5 text-sm text-on-surface-variant max-w-2xl">
          Customize your interface theme, configure intelligence alerts, and manage your authenticated session.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-signal/10 border border-emerald-signal/30 p-4 text-xs font-semibold text-emerald-signal animate-fade-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Preferences updated and saved to your account.</span>
        </div>
      )}

      {/* 1. Theme Selection */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">Interface Visual Theme</h2>
            <p className="text-xs text-on-surface-variant">Select from 8 curated visual styles tailored for high-contrast opportunity analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                    : 'border-border bg-surface-low hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-on-surface">{opt.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: opt.color }} />
                  <span className="text-[10px] text-on-surface-variant capitalize">{opt.id}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. AI Generation Quota & Credits */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-signal/10 text-amber-signal">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">AI Credit & Quota Management</h2>
            <p className="text-xs text-on-surface-variant">Remaining runs for Idea Validator, 4-Week Roadmaps, and Compliance Audits.</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-low p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-on-surface">Standard Founder Tier</div>
            <div className="text-xs text-on-surface-variant mt-0.5">
              {user?.aiCredits?.remaining ?? 5} of {user?.aiCredits?.limit ?? 5} Free AI runs remaining in current cycle
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-on-surface">
              {user?.aiCredits?.remaining ?? 5} Runs
            </span>
          </div>
        </div>
      </div>

      {/* 3. Alerts & Notification Preferences */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-signal/10 text-indigo-signal">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">Intelligence Alerts</h2>
            <p className="text-xs text-on-surface-variant">Configure digest frequencies for new RBI circulars and hiring shifts.</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-low cursor-pointer">
            <div>
              <span className="text-xs font-bold text-on-surface block">Surging Market Signal Alerts</span>
              <span className="text-[11px] text-on-surface-variant">Notify when an opportunity in your primary vertical crosses 90+ score.</span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface-low cursor-pointer">
            <div>
              <span className="text-xs font-bold text-on-surface block">Weekly Founder Signal Digest</span>
              <span className="text-[11px] text-on-surface-variant">Curated weekly summary of top Indian tech hiring shortages and regulatory circulars.</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="h-4 w-4 rounded text-primary focus:ring-primary"
            />
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={logout}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-rose-signal/30 bg-rose-signal/10 px-4 py-2.5 text-xs font-bold text-rose-signal hover:bg-rose-signal/20 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out of Session</span>
        </button>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Saving Settings...' : 'Save Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
