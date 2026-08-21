import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Opportunity } from '../data/mockData';
import { useAuth } from './AuthContext';

export interface MatchResult {
  opportunity: Opportunity;
  fitScore: number;
  rationale: string;
  complexity: 'Low' | 'Medium' | 'High';
  mvpEffort: string;
}

export interface ResumeProfile {
  scanned: boolean;
  name: string;
  currentRole: string;
  skills: string[];
  initialScore: number;
  currentScore: number;
  addedSkills: string[];
  recommendations: { skill: string; impactScore: number; difficulty: string; roleImpacted: string }[];
  adjacentPaths: { role: string; salaryJump: string; demandIndex: number }[];
}

export interface ValidationResult {
  validated: boolean;
  ideaText: string;
  validationScore: number;
  scores: {
    demand: number;
    competition: number;
    feasibility: number;
    timing: number;
    indiaRelevance: number;
    regulation: number;
  };
  gaps: string[];
  competitors: string[];
  mvpBuild: string;
}

interface AppContextType {
  opportunities: Opportunity[];
  filteredOpportunities: Opportunity[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  verticalFilter: string;
  setVerticalFilter: (filter: string) => void;
  sortBy: 'recommended' | 'score' | 'momentum' | 'demand';
  setSortBy: (sort: 'recommended' | 'score' | 'momentum' | 'demand') => void;
  savedOpportunities: string[];
  toggleSaveOpportunity: (id: string) => Promise<void>;
  refreshOpportunities: () => Promise<void>;
  // Quiz
  quizAnswers: Record<string, string>;
  setQuizAnswer: (qId: string, value: string) => void;
  quizResults: MatchResult[];
  submitQuiz: () => Promise<void>;
  resetQuiz: () => void;
  // Resume / Career Signal
  resumeProfile: ResumeProfile;
  matchedCareerOpportunities: Opportunity[];
  uploadResume: (fileName: string, resumeText?: string) => Promise<void>;
  toggleSimulatorSkill: (skillName: string) => Promise<void>;
  // Idea Validator
  validateCustomIdea: (idea: string) => Promise<{ success: boolean; error?: string; isLimitReached?: boolean }>;
  generateContextualFollowup: (ideaText: string, followUpType: 'roadmap' | 'compliance' | 'gtm') => Promise<{ success: boolean; data?: any; error?: string; isLimitReached?: boolean }>;
  validationResult: ValidationResult;
  relatedIdeaOpportunities: Opportunity[];
  resetValidation: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [verticalFilter, setVerticalFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recommended' | 'score' | 'momentum' | 'demand'>('recommended');
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResults, setQuizResults] = useState<MatchResult[]>([]);

  // Career Signal State
  const [matchedCareerOpportunities, setMatchedCareerOpportunities] = useState<Opportunity[]>([]);
  const [relatedIdeaOpportunities, setRelatedIdeaOpportunities] = useState<Opportunity[]>([]);

  // Career Signal State
  const [resumeProfile, setResumeProfile] = useState<ResumeProfile>({
    scanned: false,
    name: '',
    currentRole: '',
    skills: [],
    initialScore: 0,
    currentScore: 0,
    addedSkills: [],
    recommendations: [],
    adjacentPaths: []
  });

  // Idea Validator State
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    validated: false,
    ideaText: '',
    validationScore: 0,
    scores: { demand: 0, competition: 0, feasibility: 0, timing: 0, indiaRelevance: 0, regulation: 0 },
    gaps: [],
    competitors: [],
    mvpBuild: ''
  });

  // Fetch opportunities from API
  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (verticalFilter !== 'ALL') params.append('vertical', verticalFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('sortBy', sortBy);

      const response = await fetch(`/api/opportunities?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error('Failed to load opportunities from database');
      }

      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (err: any) {
      console.error('Error fetching opportunities:', err);
      setError(err.message || 'Error fetching opportunities');
    } finally {
      setIsLoading(false);
    }
  }, [verticalFilter, searchQuery, sortBy, token]);

  // Load opportunities on mount and filter changes
  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Fetch saved opportunities for authenticated user
  useEffect(() => {
    const fetchSaved = async () => {
      if (!isAuthenticated || !token) {
        setSavedOpportunities([]);
        return;
      }

      try {
        const res = await fetch('/api/user/saved', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSavedOpportunities(data.savedIds || []);
        }
      } catch (e) {
        console.error('Error loading saved watchlist:', e);
      }
    };

    fetchSaved();
  }, [isAuthenticated, token]);

  const toggleSaveOpportunity = async (id: string) => {
    const isCurrentlySaved = savedOpportunities.includes(id);

    // Optimistic update
    setSavedOpportunities(prev =>
      isCurrentlySaved ? prev.filter(x => x !== id) : [...prev, id]
    );

    if (isAuthenticated && token) {
      try {
        if (isCurrentlySaved) {
          await fetch(`/api/user/saved/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          await fetch(`/api/user/saved/${id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      } catch (err) {
        console.error('Error saving opportunity to backend:', err);
      }
    }
  };

  // Quiz Logics
  const setQuizAnswer = (qId: string, value: string) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const submitQuiz = async () => {
    try {
      const response = await fetch('/api/builder/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answers: quizAnswers })
      });

      if (response.ok) {
        const data = await response.json();
        setQuizResults(data.results || []);
      }
    } catch (e) {
      console.error('Error submitting builder quiz:', e);
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizResults([]);
  };

  // Resume Scanner Logics
  const uploadResume = async (fileName: string, resumeText?: string) => {
    try {
      const response = await fetch('/api/career/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ fileName, resumeText })
      });

      if (response.ok) {
        const data = await response.json();
        setResumeProfile(data.profile);
        if (data.matchedOpportunities) {
          setMatchedCareerOpportunities(data.matchedOpportunities);
        }
      }
    } catch (e) {
      console.error('Error parsing resume:', e);
    }
  };

  const toggleSimulatorSkill = async (skillName: string) => {
    if (!resumeProfile.scanned) return;

    try {
      const response = await fetch('/api/career/simulate-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentProfile: resumeProfile, skillName })
      });

      if (response.ok) {
        const data = await response.json();
        setResumeProfile(data.profile);
      }
    } catch (e) {
      console.error('Error toggling simulated skill:', e);
    }
  };

  // Idea Validator Logics
  const validateCustomIdea = async (ideaText: string): Promise<{ success: boolean; error?: string; isLimitReached?: boolean }> => {
    try {
      const response = await fetch('/api/validator/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ideaText })
      });

      const data = await response.json();

      if (response.status === 429) {
        return {
          success: false,
          error: data.message || 'You have exhausted your free AI generation credits.',
          isLimitReached: true
        };
      }

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to validate idea' };
      }

      setValidationResult(data.result);
      if (data.relatedOpportunities) {
        setRelatedIdeaOpportunities(data.relatedOpportunities);
      }
      return { success: true };
    } catch (e) {
      console.error('Error validating idea:', e);
      return { success: false, error: 'Network error connecting to AI validation engine' };
    }
  };

  const generateContextualFollowup = async (ideaText: string, followUpType: 'roadmap' | 'compliance' | 'gtm'): Promise<{ success: boolean; data?: any; error?: string; isLimitReached?: boolean }> => {
    try {
      const response = await fetch('/api/validator/followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ ideaText, followUpType })
      });

      const data = await response.json();

      if (response.status === 429) {
        return {
          success: false,
          error: data.message || 'You have exhausted your free AI generation credits.',
          isLimitReached: true
        };
      }

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to generate AI follow-up' };
      }

      return { success: true, data };
    } catch (e) {
      console.error('Error generating AI follow-up:', e);
      return { success: false, error: 'Network error connecting to AI engine' };
    }
  };

  const resetValidation = () => {
    setValidationResult({
      validated: false,
      ideaText: '',
      validationScore: 0,
      scores: { demand: 0, competition: 0, feasibility: 0, timing: 0, indiaRelevance: 0, regulation: 0 },
      gaps: [],
      competitors: [],
      mvpBuild: ''
    });
    setRelatedIdeaOpportunities([]);
  };

  // Filtered opportunities is simply the live opportunities returned by the backend query
  const filteredOpportunities = opportunities;

  return (
    <AppContext.Provider
      value={{
        opportunities,
        filteredOpportunities,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        verticalFilter,
        setVerticalFilter,
        sortBy,
        setSortBy,
        savedOpportunities,
        toggleSaveOpportunity,
        refreshOpportunities: fetchOpportunities,
        // Quiz
        quizAnswers,
        setQuizAnswer,
        quizResults,
        submitQuiz,
        resetQuiz,
        // Resume
        resumeProfile,
        matchedCareerOpportunities,
        uploadResume,
        toggleSimulatorSkill,
        // Idea Validator
        validateCustomIdea,
        generateContextualFollowup,
        validationResult,
        relatedIdeaOpportunities,
        resetValidation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
