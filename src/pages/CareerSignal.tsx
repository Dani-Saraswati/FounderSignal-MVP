import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Briefcase, 
  Upload, 
  Sparkles, 
  Plus, 
  Check, 
  FileText, 
  RotateCcw, 
  Info,
  Loader2,
  Edit3,
  ArrowRight
} from 'lucide-react';

interface CareerSignalProps {
  onViewDetails?: (id: string) => void;
}

export const CareerSignal: React.FC<CareerSignalProps> = ({ onViewDetails }) => {
  const { resumeProfile, uploadResume, toggleSimulatorSkill, matchedCareerOpportunities } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [isTextInput, setIsTextInput] = useState(false);

  const handleFileUpload = async (fileName: string, textContent?: string) => {
    setIsUploading(true);
    try {
      await uploadResume(fileName, textContent || resumeText);
    } catch (e) {
      console.error('Upload resume failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    await handleFileUpload('Founder_Resume_Pasted.txt', resumeText);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-signal';
    if (score >= 80) return 'text-violet-signal';
    if (score >= 70) return 'text-indigo-signal';
    return 'text-amber-signal';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-signal/15 text-emerald-signal border-emerald-signal/30';
    if (score >= 80) return 'bg-violet-signal/15 text-violet-signal border-violet-signal/30';
    if (score >= 70) return 'bg-indigo-signal/15 text-indigo-signal border-indigo-signal/30';
    return 'bg-amber-signal/15 text-amber-signal border-amber-signal/30';
  };

  // Rendering 1: Uploading State
  if (isUploading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center text-on-surface">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-6 animate-spin">
          <Loader2 className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Extracting Profile Details & Demand Signals</h3>
        <p className="mt-2 text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
          Correlating competencies against active database hiring signals, skill scarcity vectors, and Indian compensation benchmarks...
        </p>
      </div>
    );
  }

  // Rendering 2: Scanned Report View
  if (resumeProfile.scanned) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        {/* Profile header bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black text-on-surface tracking-tight">
                {resumeProfile.name}
              </h2>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
                PROFILE LOADED
              </span>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">
              Resolved Role: <strong>{resumeProfile.currentRole}</strong> • Verified Skills: {resumeProfile.skills.join(', ')}
            </p>
          </div>
          <button 
            onClick={() => handleFileUpload('clear', '')}
            className="flex items-center justify-center space-x-1.5 px-4 py-2 text-xs font-bold rounded border border-border text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors self-start md:self-center"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Upload Different Profile</span>
          </button>
        </div>

        {/* Report Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Scorecard, Recommendations, Adjacent Paths */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Score banner */}
            <div className="glass-card rounded-lg p-6 border border-border bg-surface flex flex-col md:flex-row items-center md:items-stretch gap-6 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-surface-low border border-border/50 md:w-48">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Market Demand Score
                </span>
                <span className={`block text-6xl font-black tracking-tighter my-2 ${getScoreColor(resumeProfile.currentScore)}`}>
                  {resumeProfile.currentScore}
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${getScoreBg(resumeProfile.currentScore)}`}>
                  {resumeProfile.currentScore >= 90 ? 'Outstanding' : resumeProfile.currentScore >= 80 ? 'High Demand' : 'Competitive'}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-lg font-bold text-on-surface leading-tight">
                    Your Skill Positioning Analysis
                  </h3>
                  <p className="mt-2 text-xs text-on-surface-variant leading-relaxed">
                    Your score represents how scarce and requested your skill combination is in the current Indian tech hiring market (PAN-India & local tech hubs). Your baseline score of <strong>{resumeProfile.initialScore}</strong> is solid; adding specialized regulatory or systems skills significantly shifts your profile value.
                  </p>
                </div>
                
                {/* Score slider bar display */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] text-on-surface-variant font-bold mb-1">
                    <span>Baseline: {resumeProfile.initialScore}</span>
                    <span className="text-primary font-black">Current Simulated: {resumeProfile.currentScore}</span>
                    <span>Max: 99</span>
                  </div>
                  <div className="w-full h-2 bg-surface-low rounded-full overflow-hidden relative border border-border/40">
                    <div 
                      className="absolute top-0 left-0 h-full bg-surface-high" 
                      style={{ width: `${resumeProfile.initialScore}%` }}
                    ></div>
                    <div 
                      className="absolute top-0 h-full bg-primary transition-all duration-300" 
                      style={{ 
                        left: `${Math.min(resumeProfile.initialScore, resumeProfile.currentScore)}%`, 
                        width: `${Math.max(2, Math.abs(resumeProfile.currentScore - resumeProfile.initialScore))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjacent High-Paying Paths */}
            <div className="glass-card rounded-lg p-6 border border-border bg-surface">
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 flex items-center">
                <Briefcase className="h-4.5 w-4.5 mr-2 text-indigo-signal" />
                High-Demand Adjacent Role Transitions
              </h3>
              <div className="space-y-4">
                {resumeProfile.adjacentPaths.map((path, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 hover:bg-surface-low/30 transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">{path.role}</h4>
                      <span className="text-[10px] text-on-surface-variant">Demand Index: <strong>{path.demandIndex}/100</strong></span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-signal font-extrabold text-xs block">{path.salaryJump}</span>
                      <span className="text-[9px] text-on-surface-variant/80">Est. salary premium</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Column 3: "What If?" Skill Simulator (Span 1) */}
          <div className="space-y-6">
            
            {/* The Simulator Tool panel */}
            <div className="glass-card rounded-lg p-5 border border-border bg-surface shadow-sm">
              <div className="border-b border-border/60 pb-3 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center">
                  <Sparkles className="h-4.5 w-4.5 mr-2" />
                  "What If?" Skill Simulator
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                  Toggle on adjacent high-scarcity skills below to dynamically see your Market Demand Score recalibrate against live database signals.
                </p>
              </div>

              <div className="space-y-3">
                {resumeProfile.recommendations.map((rec) => {
                  const isAdded = resumeProfile.addedSkills.includes(rec.skill);
                  return (
                    <button
                      key={rec.skill}
                      onClick={() => toggleSimulatorSkill(rec.skill)}
                      className={`w-full flex items-start justify-between p-3 rounded-lg border text-left transition-all ${
                        isAdded 
                          ? 'border-primary bg-primary/10 text-on-surface' 
                          : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/70'
                      }`}
                    >
                      <div className="pr-3">
                        <span className="text-xs font-bold block">{rec.skill}</span>
                        <span className="text-[9px] text-on-surface-variant/80 block mt-1">
                          Scarcity: {rec.difficulty} • Target: {rec.roleImpacted}
                        </span>
                      </div>
                      <div className="flex flex-col items-end justify-center h-full">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center ${
                          isAdded ? 'bg-primary text-on-primary' : 'bg-surface-low border border-border text-on-surface-variant'
                        }`}>
                          {isAdded ? <Check className="h-3 w-3 mr-0.5" /> : <Plus className="h-3 w-3 mr-0.5" />}
                          +{rec.impactScore}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="rounded-md bg-violet-signal/5 border border-violet-signal/20 p-3 flex items-start">
                  <Info className="h-4 w-4 text-violet-signal mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    These recommendations reflect talent deficits discovered by matching candidate resumes against active IT and BFSI hiring signals in India.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Matched Opportunities from Database */}
        {matchedCareerOpportunities && matchedCareerOpportunities.length > 0 && (
          <div className="mt-10 border-t border-border/60 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center">
                  <Sparkles className="h-4.5 w-4.5 mr-2 text-primary" />
                  Opportunities That Match Your Profile
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  High-momentum startup opportunities in the database aligned with your detected skills and domain experience.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchedCareerOpportunities.slice(0, 3).map((opp) => (
                <div 
                  key={opp.id} 
                  className="glass-card rounded-lg p-4 border border-border bg-surface flex flex-col justify-between hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                        {opp.vertical}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-signal">
                        Score: {opp.score}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-on-surface line-clamp-2 leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                      {opp.problem}
                    </p>
                  </div>

                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(opp.id)}
                      className="mt-4 w-full py-1.5 px-3 rounded bg-surface-low border border-border text-xs font-bold text-on-surface hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center space-x-1"
                    >
                      <span>Inspect Opportunity Brief</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  // Rendering 3: Landing / Input Screen
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-on-surface tracking-tight">
          Evaluate Your Builder Market Value
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Upload your resume or paste your skillset to calculate your Market Demand Score against active Indian tech hiring pipelines.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface shadow-xl">
        {/* Toggle between File Upload and Text Input */}
        <div className="flex rounded-lg bg-surface-low p-1 border border-border/60 mb-6">
          <button
            onClick={() => setIsTextInput(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              !isTextInput ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            File Upload (PDF / DOCX)
          </button>
          <button
            onClick={() => setIsTextInput(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
              isTextInput ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Paste Resume / Skills Text
          </button>
        </div>

        {isTextInput ? (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Paste Resume Text or Technical Bio
              </label>
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Example: Full Stack Software Engineer with 4 years experience in React, TypeScript, Node.js, Python, and PostgreSQL. Built scalable fintech lending systems adhering to RBI compliance..."
                className="w-full bg-surface-low border border-border rounded-lg p-3 text-xs text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>
            <button
              type="submit"
              disabled={!resumeText.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-primary text-on-primary text-xs font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Parse & Calculate Demand Score</span>
            </button>
          </form>
        ) : (
          <div className="border-2 border-dashed border-border hover:border-primary/60 transition-colors duration-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
            <div className="h-14 w-14 rounded-full bg-surface-low border border-border flex items-center justify-center mb-4 text-on-surface-variant">
              <Upload className="h-6 w-6" />
            </div>
            
            <h3 className="text-sm font-bold text-on-surface">Upload Resume File</h3>
            <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
              Upload your PDF or DOCX file to analyze skill positioning against active job market data.
            </p>

            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file.name);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="resume-file-input"
              className="mt-5 cursor-pointer px-4 py-2 text-xs font-bold rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-sm"
            >
              Select Resume File
            </label>

            {/* Quick Sample Profiles */}
            <div className="mt-8 w-full border-t border-border/50 pt-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-3">
                Or Analyze Pre-Configured Builder Profiles
              </span>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleFileUpload('Senior_FullStack_Engineer_Resume.pdf')}
                  className="flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-surface-low border border-border text-on-surface hover:bg-surface-low/80 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Full Stack Engineer CV</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFileUpload('BFSI_Risk_Compliance_Lead_CV.pdf')}
                  className="flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-surface-low border border-border text-on-surface hover:bg-surface-low/80 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-violet-signal" />
                  <span>BFSI Compliance Lead CV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
