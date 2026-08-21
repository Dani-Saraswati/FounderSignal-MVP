import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Radar, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google OAuth 2.0 Trigger
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (data.configured && data.url) {
        window.location.href = data.url;
      } else {
        // Fallback if client secret not yet configured in local environment
        setErrorMessage('Google OAuth is not configured with client keys. Please log in using your Founder email and password below.');
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMessage('Failed to initiate Google OAuth login. Please try email login.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name');
          setIsLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed. Please check your credentials.');
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-on-surface relative overflow-hidden font-sans">
      {/* Background Radial Glow Meshes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-tertiary/15 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 gap-8 lg:gap-16 z-10 my-auto">
        
        {/* Left Column: Product Showcase Hero */}
        <div className="flex-1 max-w-xl space-y-6 text-left animate-fade-up">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary p-2 text-on-primary shadow-lg ring-1 ring-primary/40">
              <svg viewBox="0 0 32 32" className="h-full w-full" role="img" aria-label="FounderSignal">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.28" />
                <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
                <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
                <path d="M16 16 L16 3 A13 13 0 0 1 27.3 9.5 Z" fill="currentColor" opacity="0.25">
                  <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="4s" repeatCount="indefinite" />
                </path>
                <circle cx="23" cy="11" r="2.2" fill="currentColor" />
              </svg>
            </span>
            <div>
              <span className="text-2xl font-black tracking-tight text-on-surface block leading-tight">
                Founder<span className="text-primary">Signal</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                INDIA OPPORTUNITY RADAR
              </span>
            </div>
          </div>

          {/* Value Prop Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight leading-[1.12]">
              Real market signals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                Validated startup opportunities.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Monitors regulatory circulars (RBI, SEBI, DPDP), surging developer shortages, and hiring velocity to score high-conviction startup ideas in India.
            </p>
          </div>

          {/* Key Platform Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="glass-card rounded-xl p-3.5 border border-border/80 bg-surface/80">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <Radar className="h-4 w-4" />
                <span>Opportunity Radar</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-normal">
                11 live synthesized startup dossiers backed by 100+ public signals.
              </p>
            </div>

            <div className="glass-card rounded-xl p-3.5 border border-border/80 bg-surface/80">
              <div className="flex items-center gap-2 text-emerald-signal font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>AI Idea Validator</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-normal">
                7-dimension viability scorecard with private idea notebook saving.
              </p>
            </div>
          </div>

          {/* Sample Mini Signal Pill */}
          <div className="rounded-xl border border-emerald-signal/30 bg-emerald-signal/10 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-on-surface">
                Latest Batch: 102 Tracked Public Signals Active
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-signal">Live DB</span>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="w-full max-w-md animate-fade-up">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-border bg-surface shadow-2xl backdrop-blur-2xl relative">
            
            {/* Header Tabs */}
            <div className="flex rounded-xl border border-border bg-surface-low p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'login'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  authMode === 'signup'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-on-surface">
                {authMode === 'login' ? 'Welcome back, Founder' : 'Begin Your Founder Journey'}
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {authMode === 'login'
                  ? 'Access live opportunities and your saved notebook.'
                  : 'Get 5 free AI runs and personalized startup matches.'}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 rounded-xl bg-rose-signal/15 border border-rose-signal/30 p-3.5 flex items-start space-x-2 text-xs text-rose-signal font-semibold animate-fade-up">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Google OAuth 2.0 Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-surface-low hover:bg-surface-high hover:border-primary/50 text-xs font-bold text-on-surface py-3 px-4 transition-all shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-surface px-2 text-on-surface-variant font-bold tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* 2. Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Deshmukh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface-low pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <input
                    type="email"
                    required
                    placeholder="founder@startup.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-low pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-low pl-10 pr-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary py-3 px-4 text-xs font-bold shadow-md hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{authMode === 'login' ? 'Sign In to Dashboard' : 'Create Account & Start Onboarding'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-[11px] text-on-surface-variant">
              <span>By signing in, you agree to our </span>
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              <span> and </span>
              <a href="#" className="text-primary hover:underline">DPDP Privacy Policy</a>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
