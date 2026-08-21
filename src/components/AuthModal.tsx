import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radar, Lock, Mail, User as UserIcon, ArrowRight, Sparkles, Shield, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

interface AuthModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen = true, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      if (err === 'google_oauth_not_configured' || err === 'google_credentials_missing') {
        setError('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
      } else if (err === 'google_auth_cancelled') {
        setError('Google Sign-In was cancelled by user.');
      } else {
        setError(`Google Authentication error: ${err.replace(/_/g, ' ')}`);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        const res = await register(name, email, password);
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else if (onClose) {
          onClose();
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid credentials');
        } else if (onClose) {
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setError(res.error || 'Failed to start Google sign-in');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Google OAuth error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-up">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl glass-strong">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Decorative Top Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-tertiary to-emerald-signal" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md">
              <svg viewBox="0 0 32 32" className="h-7 w-7" role="img" aria-label="FounderSignal">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.28" />
                <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
                <circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
                <circle cx="23" cy="11" r="2.2" fill="currentColor" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-black text-on-surface tracking-tight">
              {isRegister ? 'Create Founder Account' : 'Welcome back to FounderSignal'}
            </h2>
            <p className="mt-1 text-xs text-on-surface-variant">
              {isRegister 
                ? 'Join India’s premier startup opportunity intelligence network' 
                : 'Access scored Indian market signals & regulatory intelligence'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-surface-low p-1 mb-6 border border-border/60">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isRegister ? 'bg-surface text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isRegister ? 'bg-surface text-on-surface shadow-xs' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center space-x-2 rounded-lg bg-rose-signal/10 border border-rose-signal/30 p-3 text-xs text-rose-signal">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/60" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ananya Deshmukh"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-surface-low text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@company.in"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-surface-low text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-lg border border-border bg-surface-low text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Continue to Onboarding' : 'Sign In to Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-surface px-3 text-on-surface-variant/80 font-bold">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg border border-border bg-surface-low/40 hover:bg-surface-low text-xs font-bold text-on-surface transition-all duration-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Trust notice */}
          <div className="mt-5 pt-3 border-t border-border/40 text-center">
            <p className="text-[10px] text-on-surface-variant/70 flex items-center justify-center">
              <Shield className="h-3 w-3 mr-1 text-emerald-signal" />
              Secure 256-bit encrypted authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
