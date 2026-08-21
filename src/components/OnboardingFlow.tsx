import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Briefcase, 
  Code, 
  Target, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  Building, 
  Clock, 
  DollarSign, 
  MapPin, 
  Scale, 
  AlertCircle 
} from 'lucide-react';

export const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    founderRole: 'Technical Founder / Full-Stack',
    experienceYears: '3-5 years',
    locationCity: 'Bengaluru',
    primaryVertical: 'BFSI',
    knowledgeAreas: ['RBI Fair Practice Directives', 'DPDP Consent Architecture', 'UPI Auto-Pay & QR Telemetry'],
    skills: ['React / Next.js', 'Node.js / Express', 'PostgreSQL / SQLite', 'Python / FastApi'],
    codingProficiency: 'Hands-on Full Stack',
    capitalBudget: 'Moderate (₹1L - ₹5L)',
    timeCommitment: 'Full-time commitment (40+ hrs/wk)',
    launchWindow: '1-3 months',
    fundingAmbition: 'Bootstrapped Profitability',
    regulatoryAppetite: 'High',
    mvpComplexity: 'Medium (4-6 weeks)'
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'knowledgeAreas' | 'skills', item: string) => {
    setFormData(prev => {
      const current = prev[field];
      const updated = current.includes(item)
        ? current.filter(x => x !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (currentStep === 2 && formData.knowledgeAreas.length === 0) {
      setError('Please select at least one knowledge area.');
      return;
    }
    if (currentStep === 3 && formData.skills.length === 0) {
      setError('Please select at least one core skill.');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await completeOnboarding(formData);
      if (!result.success) {
        setError(result.error || 'Failed to save onboarding information');
      }
    } catch (err) {
      setError('Network error saving onboarding profile. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = ((currentStep) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center my-auto">
        {/* Onboarding Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-on-surface-variant font-bold mb-2">
            <span className="text-primary flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Founder Onboarding
            </span>
            <span>Step {currentStep} of {totalSteps}</span>
          </div>

          <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-border bg-surface shadow-xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-lg bg-rose-signal/10 border border-rose-signal/30 p-3 flex items-start space-x-2.5 text-xs text-rose-signal">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Basic & Professional Identity */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Founder Identity & Background
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tell us who you are so we can calibrate market opportunities to your background.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Rohan Varma"
                  className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Primary Founder Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'Technical Founder / Full-Stack', label: 'Technical Founder', desc: 'Code architecture, backend & MVP shipping' },
                    { id: 'Product Founder / Strategist', label: 'Product Strategist', desc: 'UI/UX, market discovery & roadmaps' },
                    { id: 'Domain Expert / Operator', label: 'Domain Expert / Operator', desc: 'BFSI, legal, compliance or supply chain industry insider' },
                    { id: 'Growth / GTM Hacker', label: 'Growth / GTM Lead', desc: 'B2B sales, distribution & pilot conversions' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => updateField('founderRole', role.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.founderRole === role.id
                          ? 'border-primary bg-primary/10 text-on-surface shadow-sm'
                          : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/70'
                      }`}
                    >
                      <span className="text-xs font-bold block text-on-surface">{role.label}</span>
                      <span className="text-[10px] text-on-surface-variant/80 block mt-0.5">{role.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => updateField('experienceYears', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="0-2 years">0-2 years (Early Career / First-time Builder)</option>
                    <option value="3-5 years">3-5 years (Senior Engineer / Specialist)</option>
                    <option value="6-10 years">6-10 years (Staff / Lead / Director)</option>
                    <option value="10+ years">10+ years (Seasoned Tech Leader / Veteran)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Primary Location / Startup Hub
                  </label>
                  <select
                    value={formData.locationCity}
                    onChange={(e) => updateField('locationCity', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru (Electronic City / HSR / Indiranagar)</option>
                    <option value="Mumbai">Mumbai / MMR (FinTech Hub)</option>
                    <option value="NCR / Delhi">NCR / Delhi / Gurgaon</option>
                    <option value="Hyderabad">Hyderabad (HITEC City)</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Remote / Tier-2">Remote / Tier-2 City</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Sector & Domain Specialization */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Sector & Domain Focus
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Select the core industry verticals and regulation frameworks you want to build in.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Primary Sector Vertical
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'BFSI', label: 'BFSI / FinTech', icon: '🏦' },
                    { id: 'IT', label: 'IT & DevTools', icon: '⚡' },
                    { id: 'ClimateTech', label: 'Climate & ESG', icon: '🌱' },
                    { id: 'HealthTech', label: 'Health & Bio', icon: '🩺' },
                    { id: 'EdTech', label: 'EdTech & AI', icon: '🎓' },
                    { id: 'AgriTech', label: 'Agri & Supply', icon: '🌾' },
                    { id: 'Logistics', label: 'Logistics / D2C', icon: '📦' },
                    { id: 'Enterprise SaaS', label: 'Enterprise SaaS', icon: '💼' }
                  ].map((vert) => (
                    <button
                      key={vert.id}
                      type="button"
                      onClick={() => updateField('primaryVertical', vert.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.primaryVertical === vert.id
                          ? 'border-primary bg-primary/10 text-on-surface font-extrabold shadow-sm'
                          : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/70'
                      }`}
                    >
                      <span className="text-lg block mb-1">{vert.icon}</span>
                      <span className="text-xs font-bold block">{vert.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Select Knowledge Areas & Regulatory Tags (Choose 2+)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'RBI Fair Practice Directives',
                    'DPDP Consent Architecture',
                    'UPI Auto-Pay & QR Telemetry',
                    'LLM Fine-Tuning & AST Compilers',
                    'eBPF System Observability',
                    'SEBI BRSR ESG Mandates',
                    'GST Reconciliation & Invoicing',
                    'Device Fingerprinting Telemetry',
                    'Cloud Security & SOC2'
                  ].map((area) => {
                    const isSelected = formData.knowledgeAreas.includes(area);
                    return (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleArrayItem('knowledgeAreas', area)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-low border-border text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Technical Skills & Superpowers */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <Code className="h-5 w-5 mr-2 text-primary" />
                  Technical Competencies & Stacks
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Tag the developer stacks and engineering strengths you leverage for shipping products.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Coding & Architectural Hands-On Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'Hands-on Full Stack', label: 'Full-Stack Developer', desc: 'React, Node, DB & deployment' },
                    { id: 'Backend & Systems', label: 'Backend & Systems', desc: 'Go, Rust, Microservices & High-Scale' },
                    { id: 'AI & ML Engineer', label: 'AI / ML Engineer', desc: 'Python, Fine-Tuning, Agents, RAG' }
                  ].map((prof) => (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => updateField('codingProficiency', prof.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.codingProficiency === prof.id
                          ? 'border-primary bg-primary/10 text-on-surface shadow-sm'
                          : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/70'
                      }`}
                    >
                      <span className="text-xs font-bold block text-on-surface">{prof.label}</span>
                      <span className="text-[10px] text-on-surface-variant/80 block mt-0.5">{prof.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Core Skills & Frameworks (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'React / Next.js',
                    'Node.js / Express',
                    'Python / FastApi',
                    'PostgreSQL / SQLite',
                    'TypeScript',
                    'Vector Databases (Chroma/Pinecone)',
                    'Fine-Tuning LLMs',
                    'Go / Rust',
                    'Docker / AWS Cloud',
                    'Regulatory Audit & Compliance'
                  ].map((skill) => {
                    const isSelected = formData.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleArrayItem('skills', skill)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-low border-border text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Constraints & Goals */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Capacity, Runway & Startup Ambition
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Align opportunity timelines with your financial budget and time commitment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Starting Capital Budget
                  </label>
                  <select
                    value={formData.capitalBudget}
                    onChange={(e) => updateField('capitalBudget', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="Bootstrapped (< ₹50k)">Bootstrapped (&lt; ₹50k, Pure Sweat Equity)</option>
                    <option value="Moderate (₹1L - ₹5L)">Moderate (₹1L - ₹5L, Freelance / Tools)</option>
                    <option value="Significant (₹5L+)">Significant (₹5L+, Core Runway & Infrastructure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Weekly Time Commitment
                  </label>
                  <select
                    value={formData.timeCommitment}
                    onChange={(e) => updateField('timeCommitment', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="Full-time commitment (40+ hrs/wk)">Full-time commitment (40+ hrs/week)</option>
                    <option value="Part-time side project (15-25 hrs/wk)">Part-time side project (15-25 hrs/week)</option>
                    <option value="Nights & Weekends (5-15 hrs/wk)">Nights & Weekends (5-15 hrs/week)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Target MVP Launch Window
                  </label>
                  <select
                    value={formData.launchWindow}
                    onChange={(e) => updateField('launchWindow', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="Fast Sprint (1-4 weeks)">Fast Sprint (1-4 weeks)</option>
                    <option value="1-3 months">Quarterly Build (1-3 months)</option>
                    <option value="3-6 months">Comprehensive Scope (3-6 months)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Funding Strategy
                  </label>
                  <select
                    value={formData.fundingAmbition}
                    onChange={(e) => updateField('fundingAmbition', e.target.value)}
                    className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                  >
                    <option value="Bootstrapped Profitability">Bootstrapped Cash-Flow Profitability</option>
                    <option value="Angel / Pre-Seed Runway">Angel / Pre-Seed Accelerator Runway</option>
                    <option value="Venture Scale (Series A+)">Venture Scale (Institutional VC Track)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Risk & Regulatory Appetite */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <Scale className="h-5 w-5 mr-2 text-primary" />
                  Regulatory Moat & Risk Appetite
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  High-regulation sectors (RBI, SEBI, NPCI) create massive defensibility moats for founders willing to navigate them.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Regulatory Compliance Tolerance
                </label>
                <div className="space-y-2.5">
                  {[
                    { id: 'High', title: 'High Regulatory Appetite (High Moat)', desc: 'Comfortable solving complex RBI circulars, DPDP mandates, and fintech licensing workflows for high defensibility.' },
                    { id: 'Medium', title: 'Moderate Compliance (Standard B2B)', desc: 'Open to standard data protection, SOC2, and enterprise security requirements.' },
                    { id: 'Low', title: 'Low Regulatory Exposure (Pure Software)', desc: 'Prefer pure developer tools, productivity, and SaaS without regulatory oversight.' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateField('regulatoryAppetite', item.id)}
                      className={`w-full p-3.5 rounded-lg border text-left transition-all ${
                        formData.regulatoryAppetite === item.id
                          ? 'border-primary bg-primary/10 text-on-surface shadow-sm'
                          : 'border-border bg-surface-low/30 text-on-surface-variant hover:bg-surface-low/70'
                      }`}
                    >
                      <span className="text-xs font-bold block text-on-surface">{item.title}</span>
                      <span className="text-[11px] text-on-surface-variant/80 block mt-0.5 leading-relaxed">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Preferred MVP Build Complexity
                </label>
                <select
                  value={formData.mvpComplexity}
                  onChange={(e) => updateField('mvpComplexity', e.target.value)}
                  className="w-full bg-surface-low border border-border rounded-lg py-2.5 px-3 text-xs text-on-surface font-semibold focus:outline-none"
                >
                  <option value="Low (2-3 weeks)">Lean Prototype (2-3 weeks turnaround)</option>
                  <option value="Medium (4-6 weeks)">Production Beta (4-6 weeks turnaround)</option>
                  <option value="High (8-12 weeks)">Deep Infrastructure Engine (8-12 weeks)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Launch Platform */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fade-in">
              <div className="border-b border-border/60 pb-3">
                <h2 className="text-xl font-bold text-on-surface flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-signal" />
                  Review & Initialize Your Founder Radar
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Confirm your profile settings to unlock personalized market signal matching.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-low/40 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-on-surface-variant font-semibold">Founder:</span>
                  <span className="font-bold text-on-surface">{formData.fullName} ({formData.founderRole})</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-on-surface-variant font-semibold">Focus Vertical:</span>
                  <span className="font-bold text-primary">{formData.primaryVertical}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-on-surface-variant font-semibold">Location & Experience:</span>
                  <span className="font-bold text-on-surface">{formData.locationCity} • {formData.experienceYears}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-on-surface-variant font-semibold">Capital & Commitment:</span>
                  <span className="font-bold text-on-surface">{formData.capitalBudget} • {formData.timeCommitment}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-border/40">
                  <span className="text-on-surface-variant font-semibold">Regulatory Appetite:</span>
                  <span className="font-bold text-emerald-signal">{formData.regulatoryAppetite}</span>
                </div>
                <div className="pt-1">
                  <span className="text-on-surface-variant font-semibold block mb-1.5">Top Skills & Knowledge:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[...formData.skills, ...formData.knowledgeAreas].slice(0, 6).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-on-surface">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-signal/10 border border-emerald-signal/20 p-3.5 flex items-start space-x-3">
                <Sparkles className="h-4 w-4 text-emerald-signal flex-shrink-0 mt-0.5" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Your profile will be persisted to the backend database to automatically rank opportunities on the <strong>Opportunity Radar</strong> and <strong>Builder Match</strong> diagnostic.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between border-t border-border/60 pt-6 mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-border transition-colors ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed text-on-surface-variant'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 text-xs font-bold rounded-lg bg-primary text-on-primary hover:opacity-95 shadow-md transition-opacity"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 text-xs font-black rounded-lg bg-emerald-signal text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm Profile & Launch Radar</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
