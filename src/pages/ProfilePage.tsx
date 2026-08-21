import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Save, 
  Zap, 
  Sparkles,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    founderRole: 'Technical Founder / Full-Stack',
    experienceYears: '3-5 years',
    locationCity: 'Bengaluru',
    primaryVertical: 'BFSI',
    knowledgeAreas: 'Fintech, RegTech, Compliance Auditing',
    skills: 'React, Node.js, Python, PostgreSQL',
    codingProficiency: 'Hands-on Full Stack',
    capitalBudget: 'Moderate (₹1L - ₹5L)',
    timeCommitment: 'Full-time commitment (40+ hrs/wk)',
    regulatoryAppetite: 'High'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setFormData({
              fullName: data.profile.full_name || data.user.name || '',
              founderRole: data.profile.founder_role || 'Technical Founder / Full-Stack',
              experienceYears: data.profile.experience_years || '3-5 years',
              locationCity: data.profile.location_city || 'Bengaluru',
              primaryVertical: data.profile.primary_vertical || 'BFSI',
              knowledgeAreas: data.profile.knowledge_areas || '',
              skills: data.profile.skills || '',
              codingProficiency: data.profile.coding_proficiency || 'Hands-on Full Stack',
              capitalBudget: data.profile.capital_budget || 'Moderate (₹1L - ₹5L)',
              timeCommitment: data.profile.time_commitment || 'Full-time commitment (40+ hrs/wk)',
              regulatoryAppetite: data.profile.regulatory_appetite || 'High'
            });
          } else if (data.user) {
            setFormData(prev => ({ ...prev, fullName: data.user.name }));
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccessMessage('Founder profile updated successfully. Your Opportunity Radar personalization has been recalculated.');
        await refreshProfile();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-xs font-bold text-on-surface-variant">Loading your founder profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 space-y-8 animate-fade-up">
      {/* Top Header */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mb-3">
          <User className="h-3.5 w-3.5" />
          <span>FOUNDER IDENTITY & FIT PROFILE</span>
        </div>
        <h1 className="text-3xl font-black text-on-surface tracking-tight">
          Founder Profile & Personalization
        </h1>
        <p className="mt-1.5 text-sm text-on-surface-variant max-w-2xl">
          Your profile preferences directly influence your personalized <strong>Founder Fit</strong> match percentages on the Opportunity Radar and Builder Match algorithms.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card rounded-2xl p-6 border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-black text-on-primary text-2xl shadow-md">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">{formData.fullName || user?.name}</h2>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                {user?.role || 'Founder'}
              </span>
              <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member since 2026
              </span>
            </div>
          </div>
        </div>

        {/* AI Credit Balance Pill */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-low p-3.5 self-start sm:self-auto">
          <Zap className="h-5 w-5 text-amber-signal shrink-0" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
              AI Generation Quota
            </div>
            <div className="text-sm font-black text-on-surface">
              {user?.aiCredits?.remaining ?? 5} / {user?.aiCredits?.limit ?? 5} Free Runs
            </div>
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-signal/10 border border-emerald-signal/30 p-4 text-xs font-semibold text-emerald-signal animate-fade-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-rose-signal/10 border border-rose-signal/30 p-4 text-xs font-semibold text-rose-signal animate-fade-up">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Edit Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-6 shadow-sm">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-on-surface">Founder Background & Skills</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Tell us about your strengths and operational focus.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Founder Archetype / Role
              </label>
              <select
                value={formData.founderRole}
                onChange={(e) => setFormData({ ...formData, founderRole: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="Technical Founder / Full-Stack">Technical Founder / Full-Stack</option>
                <option value="Product Architect / Lead">Product Architect / Lead</option>
                <option value="Domain Expert / Fintech Operator">Domain Expert / Fintech Operator</option>
                <option value="Growth & GTM Specialist">Growth & GTM Specialist</option>
                <option value="Solo Builder / Indie Hacker">Solo Builder / Indie Hacker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Experience Level
              </label>
              <select
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="1-2 years">1-2 years (Early Career)</option>
                <option value="3-5 years">3-5 years (Experienced Engineer/PM)</option>
                <option value="6-10 years">6-10 years (Senior Leader / Tech Lead)</option>
                <option value="10+ years">10+ years (Staff / Exec / Repeat Founder)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Base Location
              </label>
              <select
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR (Gurugram / Noida)</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
                <option value="Remote">Remote / Distributed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1.5">
              Technical & Domain Skills (comma-separated)
            </label>
            <input
              type="text"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. React, Node.js, Python, FastApi, PostgreSQL, Redis"
              className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none"
            />
            <span className="text-[10px] text-on-surface-variant mt-1 block">
              Used to match with skill scarcity signals in Indian tech hubs.
            </span>
          </div>
        </div>

        {/* Capital & Execution Profile */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface space-y-6 shadow-sm">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-on-surface">Execution Preferences & Constraints</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Parameters that calibrate startup opportunity scoring.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Primary Industry Focus
              </label>
              <select
                value={formData.primaryVertical}
                onChange={(e) => setFormData({ ...formData, primaryVertical: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="BFSI">BFSI & Fintech (Lending, Payments, RegTech)</option>
                <option value="IT">IT & DevTools (AI Infrastructure, Observability)</option>
                <option value="ClimateTech">ClimateTech & ESG Sustainability</option>
                <option value="HealthTech">HealthTech & Ayushman Digital Ecosystem</option>
                <option value="Logistics">Logistics & Supply Chain Intelligence</option>
                <option value="EdTech">EdTech & Upskilling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Starting Capital Runway
              </label>
              <select
                value={formData.capitalBudget}
                onChange={(e) => setFormData({ ...formData, capitalBudget: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="Bootstrapped (Under ₹50k, sweat equity)">Bootstrapped (&lt; ₹50k, only sweat equity)</option>
                <option value="Moderate (₹1L - ₹5L)">Moderate (₹1L - ₹5L, can fund infra & pilots)</option>
                <option value="Significant (₹5L+ runway)">Significant (₹5L+, full-time runway)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Time Availability
              </label>
              <select
                value={formData.timeCommitment}
                onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="Full-time commitment (40+ hrs/wk)">Full-time commitment (40+ hrs/wk)</option>
                <option value="Part-time side hustle (15-20 hrs/wk)">Part-time side project (15-20 hrs/wk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                Regulatory Moat Appetite
              </label>
              <select
                value={formData.regulatoryAppetite}
                onChange={(e) => setFormData({ ...formData, regulatoryAppetite: e.target.value })}
                className="w-full rounded-xl border border-border bg-surface-low px-3.5 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="High">High (Navigate complex RBI/DPDP rules for high defensibility)</option>
                <option value="Low">Low (Prefer lean SaaS without strict government compliance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-on-primary shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
