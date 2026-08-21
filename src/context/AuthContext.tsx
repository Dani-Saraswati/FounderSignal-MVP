import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  user_id: string;
  full_name: string;
  founder_role: string;
  experience_years: string;
  location_city: string;
  primary_vertical: string;
  knowledge_areas: string;
  skills: string;
  coding_proficiency: string;
  capital_budget: string;
  time_commitment: string;
  launch_window: string;
  funding_ambition: string;
  regulatory_appetite: string;
  mvp_complexity: string;
}

export interface UserAiCredits {
  limit: number;
  used: number;
  remaining: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  hasCompletedOnboarding: boolean;
  profile?: UserProfile | null;
  aiCredits?: UserAiCredits;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  aiCredits: UserAiCredits;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeOnboarding: (onboardingData: any) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  updateAiCredits: (credits: UserAiCredits) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'foundersignal_jwt_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const defaultAiCredits: UserAiCredits = {
    limit: 10,
    used: 0,
    remaining: 10
  };

  const aiCredits = user?.aiCredits || defaultAiCredits;

  const updateAiCredits = (credits: UserAiCredits) => {
    setUser(prev => prev ? { ...prev, aiCredits: credits } : null);
  };

  const fetchCurrentUser = async (jwtToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token expired or invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to verify session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if redirected with google_token URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('google_token');
    if (googleToken) {
      localStorage.setItem(TOKEN_KEY, googleToken);
      setToken(googleToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchCurrentUser(googleToken);
      return;
    }

    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  // Listen for Google OAuth popup postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS' && event.data?.token) {
        localStorage.setItem(TOKEN_KEY, event.data.token);
        setToken(event.data.token);
        fetchCurrentUser(event.data.token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error connecting to backend API' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error connecting to backend API' };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Fetch official Google OAuth 2.0 Authorization URL
      const urlRes = await fetch('/api/auth/google/url');
      const urlData = await urlRes.json();

      if (urlData.configured && urlData.url) {
        // Direct browser redirect to Google's official account selection and consent page
        window.location.href = urlData.url;
        return { success: true };
      }

      // If credentials not configured in .env, return clear setup message
      return {
        success: false,
        error: urlData.message || 'Google OAuth 2.0 credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.'
      };
    } catch (error) {
      return { success: false, error: 'Failed to initiate Google OAuth login flow.' };
    }
  };

  const completeOnboarding = async (onboardingData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!token) {
        return { success: false, error: 'User is not authenticated' };
      }

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingData)
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to complete onboarding' };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error saving onboarding profile' };
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(user && token);
  const hasCompletedOnboarding = Boolean(user?.hasCompletedOnboarding);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        hasCompletedOnboarding,
        aiCredits,
        login,
        register,
        loginWithGoogle,
        logout,
        completeOnboarding,
        refreshProfile,
        updateAiCredits
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
