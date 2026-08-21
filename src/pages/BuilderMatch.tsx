import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { mockQuestions } from '../data/mockData';
import { 
  UserCheck, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Clock, 
  CheckCircle, 
  Sparkles,
  Loader2,
  Zap
} from 'lucide-react';

interface BuilderMatchProps {
  onViewDetails: (id: string) => void;
}

export const BuilderMatch: React.FC<BuilderMatchProps> = ({ onViewDetails }) => {
  const {
    quizAnswers,
    setQuizAnswer,
    quizResults,
    submitQuiz,
    resetQuiz
  } = useApp();
  const { aiCredits } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOptionSelect = (qId: string, val: string) => {
    setQuizAnswer(qId, val);
    if (currentStep < mockQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentStep < mockQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCalculateMatches = async () => {
    setIsProcessing(true);
    try {
      await submitQuiz();
    } catch (e) {
      console.error('Submit quiz failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeQuestion = mockQuestions[currentStep];
  const progressPercent = ((currentStep) / mockQuestions.length) * 100;
  const isQuizComplete = Object.keys(quizAnswers).length === mockQuestions.length;

  const getComplexityColor = (comp: string) => {
    switch (comp) {
      case 'Low': return 'text-emerald-signal bg-emerald-signal/10 border-emerald-signal/20';
      case 'Medium': return 'text-indigo-signal bg-indigo-signal/10 border-indigo-signal/20';
      case 'High': return 'text-rose-signal bg-rose-signal/10 border-rose-signal/20';
      default: return 'text-on-surface-variant bg-surface-low border-border';
    }
  };

  // Rendering 1: Processing Loader
  if (isProcessing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-on-surface">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-spin">
          <Loader2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Matching Your Builder Profile</h3>
        <p className="mt-2 text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          Correlating your technical competencies, capital constraints, and regulatory appetite against all live opportunities in the database catalog...
        </p>
      </div>
    );
  }

  // Rendering 2: Matching Results Screen
  if (quizResults.length > 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6 animate-fade-up">
        
        {/* Results header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                <Clock className="h-3 w-3" />
                <span>Evaluated in 1.2s</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-signal/10 text-emerald-signal border border-emerald-signal/20">
                <Zap className="h-3 w-3" />
                <span>{aiCredits?.remaining ?? 5} / {aiCredits?.limit ?? 5} AI runs remaining</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight flex items-center">
              <UserCheck className="h-6 w-6 mr-2 text-emerald-signal" />
              Your Custom Opportunity Matches
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              The opportunities below are ranked based on how well they align with your skillset and constraints. (5 AI evaluation runs included per account).
            </p>
          </div>
          <button 
            onClick={() => { resetQuiz(); setCurrentStep(0); }}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-border text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors self-start sm:self-center shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Diagnostic Quiz</span>
          </button>
        </div>

        {/* Matches lists */}
        <div className="space-y-6">
          {quizResults.map((match, idx) => (
            <div 
              key={match.opportunity.id} 
              className={`glass-card rounded-lg p-5 border transition-all duration-300 ${
                idx === 0 
                  ? 'border-emerald-signal/30 bg-surface shadow-md relative overflow-hidden' 
                  : 'border-border bg-surface hover:shadow-sm'
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-emerald-signal text-white px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-bl-lg flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Top Match Recommendation
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                
                {/* Score & core details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-primary">{match.fitScore}%</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Founder Fit Match</span>
                  </div>

                  <h3 
                    className="mt-2 text-lg font-bold text-on-surface hover:text-primary cursor-pointer transition-colors" 
                    onClick={() => onViewDetails(match.opportunity.id)}
                  >
                    {match.opportunity.title}
                  </h3>
                  
                  <p className="mt-1.5 text-xs text-on-surface-variant leading-relaxed">
                    {match.opportunity.problem}
                  </p>

                  <div className="mt-3 bg-surface-low/55 rounded border border-border/40 p-3 text-xs text-on-surface font-medium leading-relaxed">
                    <span className="font-bold text-primary">Fit Rationale:</span> {match.rationale}
                  </div>
                </div>

                {/* Scope specs & Actions */}
                <div className="md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-5 gap-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Complexity:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getComplexityColor(match.complexity)}`}>
                        {match.complexity}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant">Est. MVP Effort:</span>
                      <span className="font-bold text-on-surface flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-primary" />
                        {match.mvpEffort}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewDetails(match.opportunity.id)}
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold rounded bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <span>Analyze Opportunity</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    );
  }

  // Rendering 3: Quiz step questions
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-on-surface tracking-tight flex items-center justify-center">
          <UserCheck className="h-6 w-6 mr-2 text-emerald-signal" />
          Builder Match
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Answer a few questions about yourself. We’ll analyze your skills, experience, and interests to match you with the startup opportunities that fit you best.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface shadow-xl">
        
        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold mb-2">
            <span>Diagnostic Progress</span>
            <span>Question {currentStep + 1} of {mockQuestions.length}</span>
          </div>
          <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-on-surface leading-snug">
            {activeQuestion.questionText}
          </h2>
        </div>

        {/* Options list */}
        <div className="space-y-3 mb-8">
          {activeQuestion.options.map((option, idx) => {
            const isSelected = quizAnswers[activeQuestion.id] === option.value;
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(activeQuestion.id, option.value)}
                className={`w-full text-left px-4 py-3.5 text-xs font-bold rounded-lg border transition-all duration-150 ${
                  isSelected 
                    ? 'bg-primary/10 border-primary text-on-surface font-extrabold shadow-sm'
                    : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/80 hover:text-on-surface'
                }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-border/40 pt-5">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded ${
              currentStep === 0 
                ? 'opacity-40 cursor-not-allowed text-on-surface-variant' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          {currentStep === mockQuestions.length - 1 ? (
            <button
              onClick={handleCalculateMatches}
              disabled={!isQuizComplete}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-black rounded-lg ${
                isQuizComplete 
                  ? 'bg-emerald-signal text-white hover:bg-emerald-600 shadow-md' 
                  : 'bg-surface-low text-on-surface-variant/40 cursor-not-allowed'
              }`}
            >
              <span>Discover Opportunity Matches</span>
              <CheckCircle className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!quizAnswers[activeQuestion.id]}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded ${
                !quizAnswers[activeQuestion.id]
                  ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                  : 'text-primary hover:opacity-80'
              }`}
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
