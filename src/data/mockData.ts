export interface Opportunity {
  feeds?: {
    reddit: string[];
    linkedin: string[];
    github: string[];
  };
  provenance?: {
    signalCount: number;
    sourceCount: number;
    lastUpdated: string;
    hiringVolume: number;
    regulatoryCount: number;
    agencies: string[];
    redditCount: number;
    githubCount: number;
  };
  founderFit?: {
    fitScore: number;
    rationale: string;
  };

  id: string;
  title: string;
  problem: string;
  targetCustomer: string;
  industry: string;
  vertical: 'IT' | 'BFSI' | 'HealthTech' | 'EdTech' | 'ClimateTech' | 'AgriTech' | 'Logistics' | 'ECommerce';
  score: number;
  scores: {
    demand: number;
    hiring: number;
    regulation: number;
    skills: number;
    competition: number;
    timing: number;
    indiaRelevance: number;
  };
  momentum: 'rising' | 'steady' | 'declining';
  changePercentage: number;
  signalCount: number;
  sourceCount: number;
  whyInteresting: string;
  overview: string;
  whyMatters: string;
  demandAnalysis: string;
  signalsTimeline: { date: string; value: number }[];
  hiringSignals: { role: string; volume: 'High' | 'Medium' | 'Low'; salaryRange: string; count: number }[];
  skillSignals: { skill: string; scarcity: 'High' | 'Critical' | 'Medium'; impact: string }[];
  regulatorySignals?: { regulationName: string; agency: string; summary: string; date: string }[];
  technologySignals: { tech: string; adoptionRate: string; description: string }[];
  competitionList: { name: string; category: string; strength: 'Strong' | 'Emerging' | 'Weak' | 'Medium'; pricing: string }[];
  marketGap: string;
  mvpRecommendation: string;
  monetizationHypothesis: string;
  risks: string[];
  indiaRelevanceText: string;
  relatedOpportunities: string[];
  lastUpdated: string;
}

export const mockOpportunities: Opportunity[] = [
  {
    id: 'bfsi-ai-compliance',
    title: 'AI Compliance Automation for BFSI',
    problem: 'Manual compliance reviews of multi-channel client communications are slow, expensive, and fail to prevent regulatory penalties.',
    targetCustomer: 'Indian Banks, NBFCs, and Digital Lending Apps',
    industry: 'BFSI / RegTech',
    vertical: 'BFSI',
    score: 92,
    scores: {
      demand: 91,
      hiring: 88,
      regulation: 94,
      skills: 82,
      competition: 68,
      timing: 93,
      indiaRelevance: 98
    },
    momentum: 'rising',
    changePercentage: 48,
    signalCount: 18,
    sourceCount: 6,
    whyInteresting: 'Multiple independent signals indicate rising demand for compliance automation while specialized regulatory talent remains constrained in India.',
    overview: 'With the RBI increasing its supervisory intensity and publishing stricter guidelines for fair practices and digital lending disclosures, financial institutions struggle to audit 100% of customer interactions. This system automates the compliance review of voice logs, WhatsApp messages, and advertising materials using fine-tuned Indian finance LLMs.',
    whyMatters: 'Failure to comply with digital lending guidelines results in direct RBI bans on product releases, huge financial penalties, and significant brand damage. In a high-velocity market, slow audit cycles bottleneck growth.',
    demandAnalysis: 'Job postings for BFSI Compliance Officers with "AI automation" keywords grew by 65% in the last two quarters. In parallel, public complaints regarding predatory collections and mis-selling continue to trigger regulatory scrutiny.',
    signalsTimeline: [
      { date: 'Mar 26', value: 45 },
      { date: 'Apr 26', value: 52 },
      { date: 'May 26', value: 68 },
      { date: 'Jun 26', value: 74 },
      { date: 'Jul 26', value: 85 },
      { date: 'Aug 26', value: 91 }
    ],
    hiringSignals: [
      { role: 'Head of RegTech Compliance', volume: 'High', salaryRange: '₹35L - ₹50L L.A.', count: 42 },
      { role: 'Lending Compliance Analyst', volume: 'High', salaryRange: '₹12L - ₹20L L.A.', count: 110 },
      { role: 'AI Integration Specialist (FinTech)', volume: 'Medium', salaryRange: '₹22L - ₹32L L.A.', count: 35 }
    ],
    skillSignals: [
      { skill: 'RBI Fair Practice Code Auditing', scarcity: 'Critical', impact: 'Ensures system flags collection agency behavior patterns.' },
      { skill: 'Fine-Tuning Fin-LLMs', scarcity: 'High', impact: 'Used to process transcripts with mixed English/Hindi dialects.' },
      { skill: 'Audio Transcription Analysis', scarcity: 'Medium', impact: 'Necessary to ingest multi-lingual call center voice recordings.' }
    ],
    regulatorySignals: [
      { regulationName: 'RBI Digital Lending Guidelines (Updates)', agency: 'Reserve Bank of India', summary: 'Mandatory logging and disclosures of borrower communications, strict penalties on outsourced agent misconduct.', date: 'April 2026' },
      { regulationName: 'DPDP Act (Digital Personal Data Protection)', agency: 'Govt of India', summary: 'Requires clear consent management logs for marketing outreach and financial disclosures.', date: 'August 2025' }
    ],
    technologySignals: [
      { tech: 'Llama 3 Fin-Tuned Models', adoptionRate: 'Emerging', description: 'Used to perform offline domain-specific intent auditing cheaply.' },
      { tech: 'Whisper India-Acoustics', adoptionRate: 'Growing', description: 'Advanced transcription model optimized for regional Indian accents and dialects.' }
    ],
    competitionList: [
      { name: 'Signzy', category: 'General KYC/Onboarding', strength: 'Strong', pricing: 'Enterprise contract' },
      { name: 'Performios', category: 'Call Quality Audit', strength: 'Emerging', pricing: '₹1,500/agent/month' },
      { name: 'ComplianceAI', category: 'Global RegTech', strength: 'Weak', pricing: 'USD pricing ($$$), lacks Indian local codes' }
    ],
    marketGap: 'Existing platforms audit for basic customer support quality (e.g., tone, greeting) but lack the deep, deterministic semantic mapping of RBI circular compliance rules, specifically around collection harassment and unauthorized credit lines.',
    mvpRecommendation: 'Build a standalone batch processing dashboard. Users upload voice logs or chat records. The system flags interactions that violate specific RBI Fair Practice codes, citing the exact circular clause violated.',
    monetizationHypothesis: 'B2B SaaS with tiered billing. Starter tier at ₹45,000/month for up to 5,000 audit minutes. Enterprise tier with customized model fine-tuning for regional Indian languages (Hindi, Tamil, Telugu).',
    risks: [
      "Strict data residency requirements in Indian banking require on-premise or sovereign private cloud deployment.",
      "High transcription error rates in Indian colloquial English ('Hinglish') call recordings."
    ],
    indiaRelevanceText: 'Highly localized. Driven entirely by the Reserve Bank of India (RBI) aggressive crackdowns on digital lending misconduct and the recently implemented DPDP compliance requirements.',
    relatedOpportunities: ['bfsi-upi-fraud', 'bfsi-regulatory-filing'],
    lastUpdated: '12 Aug 2026'
  },
  {
    id: 'bfsi-upi-fraud',
    title: 'Real-time UPI Merchant Fraud Prevention',
    problem: 'Instant credit payouts over UPI make merchant accounts high-value targets for quick-cash mule schemes and synthetic identity fraud.',
    targetCustomer: 'Payment Gateways, POS Providers, and Merchant Acquirers',
    industry: 'BFSI / Payments',
    vertical: 'BFSI',
    score: 89,
    scores: {
      demand: 90,
      hiring: 85,
      regulation: 88,
      skills: 80,
      competition: 72,
      timing: 90,
      indiaRelevance: 99
    },
    momentum: 'rising',
    changePercentage: 35,
    signalCount: 14,
    sourceCount: 4,
    whyInteresting: 'UPI merchant volumes hit record highs in 2026, alongside a 240% spike in cyber cell accounts freezes affecting innocent merchants.',
    overview: 'As digital transaction volume grows exponentially in tier-2/3 cities, fraudsters use fake GST registrations to create merchant accounts and funnel stolen funds. Gateways are penalized or face accounts freezes. This platform uses device fingerprinting and behavioral analytics to flag high-risk transaction patterns.',
    whyMatters: 'Merchant acquirers are liable for KYC failures and face severe warnings from NPCI. Merchant partners suffer when accounts are frozen by state cyber cells, locking their working capital.',
    demandAnalysis: 'Risk and Fraud analyst hiring posts on LinkedIn India for fintechs increased by 50% YoY. Mention of "device telemetry" and "velocity rules" in job scopes is critical.',
    signalsTimeline: [
      { date: 'Mar 26', value: 50 },
      { date: 'Apr 26', value: 58 },
      { date: 'May 26', value: 65 },
      { date: 'Jun 26', value: 72 },
      { date: 'Jul 26', value: 80 },
      { date: 'Aug 26', value: 90 }
    ],
    hiringSignals: [
      { role: 'Fraud Risk Manager', volume: 'High', salaryRange: '₹20L - ₹32L L.A.', count: 28 },
      { role: 'Risk Engine Engineer', volume: 'Medium', salaryRange: '₹18L - ₹28L L.A.', count: 18 }
    ],
    skillSignals: [
      { skill: 'Device Fingerprinting & Telemetry', scarcity: 'Critical', impact: 'Detecting emulator environments running multiple merchant profiles.' },
      { skill: 'NPCI Compliance Frameworks', scarcity: 'High', impact: 'Ensuring routing behavior adheres to national payments council guidelines.' }
    ],
    technologySignals: [
      { tech: 'Graph Neural Networks (GNN)', adoptionRate: 'Emerging', description: 'Used to map device sharing networks and mule ring transactions.' }
    ],
    competitionList: [
      { name: 'Bureau.id', category: 'Identity Verification', strength: 'Strong', pricing: 'Pay-per-check API' },
      { name: 'Sift', category: 'Global Fraud Engine', strength: 'Medium', pricing: 'Global USD pricing, slow support for UPI flows' }
    ],
    marketGap: 'Global tools fail to recognize UPI-specific transaction speed profiles and regional device types popular in semi-urban India. Specialized Indian UPI tools are emerging but focus mostly on customer KYC rather than post-onboarding transaction telemetry.',
    mvpRecommendation: 'An API SDK that merchant apps call during high-value UPI withdrawals. It analyses device health, geolocation stability, and NPCI blacklist flags to return a transaction risk score within 20ms.',
    monetizationHypothesis: 'API model: charging ₹0.15 per risk audit call, with volume discount tiers. Custom onboarding security implementation for large aggregators.',
    risks: [
      "Extremely low latency requirement (under 20 milliseconds) to prevent payment friction.",
      "Strict merchant data privacy compliance under NPCI directives."
    ],
    indiaRelevanceText: 'UPI is a native Indian payments protocol. Mule accounts and cyber cell freezes are major bottlenecks for small business merchants in India.',
    relatedOpportunities: ['bfsi-ai-compliance', 'it-cybersecurity-access'],
    lastUpdated: '10 Aug 2026'
  },
  {
    id: 'it-llm-devops',
    title: 'LLM DevOps & Latency Monitoring',
    problem: 'Production LLM apps suffer from unpredictable token costs, API throttling, and latency spikes that ruin user experiences.',
    targetCustomer: 'IT Services, SaaS Dev Teams, and AI Product Startups',
    industry: 'IT / Developer Tools',
    vertical: 'IT',
    score: 87,
    scores: {
      demand: 89,
      hiring: 84,
      regulation: 60,
      skills: 90,
      competition: 75,
      timing: 92,
      indiaRelevance: 85
    },
    momentum: 'rising',
    changePercentage: 42,
    signalCount: 22,
    sourceCount: 5,
    whyInteresting: 'Dev teams are migrating models to production and encountering high token bill shocks and rate limit issues.',
    overview: 'As enterprises transition from simple LLM wrappers to complex multi-agent architectures, tracking cost per session, model latency distributions, and semantic cache hit rates becomes vital. This platform offers lightweight agent telemetry for production AI apps.',
    whyMatters: 'API latency spikes directly impact conversions, and unmonitored recursive loops in AI agents can rack up thousands of dollars in server costs overnight.',
    demandAnalysis: 'Stack Overflow questions on "LLM rate limits" and "semantic caching" are up 120% in the last 6 months. Node/Python job scopes in IT services increasingly ask for "LLMOps observability" skills.',
    signalsTimeline: [
      { date: 'Mar 26', value: 30 },
      { date: 'Apr 26', value: 42 },
      { date: 'May 26', value: 55 },
      { date: 'Jun 26', value: 68 },
      { date: 'Jul 26', value: 77 },
      { date: 'Aug 26', value: 89 }
    ],
    hiringSignals: [
      { role: 'AI Platform Engineer', volume: 'High', salaryRange: '₹18L - ₹30L L.A.', count: 85 },
      { role: 'observability developer', volume: 'Medium', salaryRange: '₹14L - ₹22L L.A.', count: 40 }
    ],
    skillSignals: [
      { skill: 'Semantic Caching Implementation', scarcity: 'High', impact: 'Reduces model billing by caching query intents rather than raw text match.' },
      { skill: 'LLM Telemetry Integration', scarcity: 'Medium', impact: 'Adding tracing hooks inside LangChain/LlamaIndex agents.' }
    ],
    technologySignals: [
      { tech: 'LangSmith / Langfuse', adoptionRate: 'Growing', description: 'Open-source trace frameworks gaining massive adoption.' }
    ],
    competitionList: [
      { name: 'Langsmith', category: 'AI Observation', strength: 'Strong', pricing: 'Free tier / Paid team seats' },
      { name: 'Helicone', category: 'LLM Gateway', strength: 'Emerging', pricing: 'Paid per-million-tokens audited' }
    ],
    marketGap: 'Existing tools focus heavily on model debugging in sandbox staging. There is a gap for a lightweight, production-grade gateway proxy that handles local failovers, token quotas, and budget caps automatically for Indian IT consulting teams who build for global clients.',
    mvpRecommendation: 'A lightweight Node/Python SDK acting as an API proxy. Developers replace standard LLM clients with the proxy, instantly getting dashboards on token usage, API latency, and fallback rules.',
    monetizationHypothesis: 'SaaS subscription: Free for first 50,000 requests/month, then ₹7,500/month for up to 500,000 requests.',
    risks: [
      "Adding a network hop could introduce minor latency to LLM responses.",
      "High data privacy requirements: customers must be able to hash prompt contents before auditing."
    ],
    indiaRelevanceText: 'Indian IT services companies (Infosys, TCS, Wipro) are building AI solutions for thousands of global clients and require lightweight cost/governance gateways to prove value and manage client token budgets.',
    relatedOpportunities: ['it-code-migration', 'it-cybersecurity-access'],
    lastUpdated: '11 Aug 2026'
  },
  {
    id: 'bfsi-regulatory-filing',
    title: 'Automated SEBI & RBI Regulatory Filing',
    problem: 'NBFCs and Mutual Funds spend hundreds of hours manually compiling, validating, and submitting compliance reports to SEBI and RBI portals.',
    targetCustomer: 'Indian FinTechs, NBFCs, Mutual Funds, and AIFs',
    industry: 'BFSI / RegTech',
    vertical: 'BFSI',
    score: 88,
    scores: {
      demand: 87,
      hiring: 82,
      regulation: 96,
      skills: 75,
      competition: 60,
      timing: 94,
      indiaRelevance: 100
    },
    momentum: 'rising',
    changePercentage: 55,
    signalCount: 12,
    sourceCount: 3,
    whyInteresting: 'RBI and SEBI have updated report formats twice in 2026, leading to backlog fines and filing delays across mid-tier financial firms.',
    overview: 'Compliance filing in India involves complex XBRL and XML schemas. Even small errors reject the entire file. This platform ingests raw accounting database records, cross-references active SEBI/RBI tax taxonomies, validates data consistency, and packages the results into compliance-ready formats.',
    whyMatters: 'Late filing fines compound daily, and repeated delays trigger audit penalties or direct regulatory freezes on fund onboarding operations.',
    demandAnalysis: 'Filing errors and portal compliance discussion threads on ICAI and financial forums spiked by 80% since the updated RBI circulars.',
    signalsTimeline: [
      { date: 'Mar 26', value: 35 },
      { date: 'Apr 26', value: 45 },
      { date: 'May 26', value: 58 },
      { date: 'Jun 26', value: 70 },
      { date: 'Jul 26', value: 81 },
      { date: 'Aug 26', value: 88 }
    ],
    hiringSignals: [
      { role: 'Regulatory Reporting Specialist', volume: 'Medium', salaryRange: '₹10L - ₹18L L.A.', count: 32 },
      { role: 'XBRL Compliance Architect', volume: 'Low', salaryRange: '₹15L - ₹24L L.A.', count: 12 }
    ],
    skillSignals: [
      { skill: 'XBRL Taxonomy Mapping', scarcity: 'Critical', impact: 'Correctly mapping accounting nodes to RBI schema structures.' },
      { skill: 'SEBI Mutual Fund regulations', scarcity: 'High', impact: 'Validating portfolio disclosures against asset allocation rules.' }
    ],
    technologySignals: [
      { tech: 'XBRL Parsing Frameworks', adoptionRate: 'Stable', description: 'Industry standard reporting schemas used by global government portals.' }
    ],
    competitionList: [
      { name: 'IRIS Business Services', category: 'Enterprise Reporting', strength: 'Strong', pricing: 'Custom enterprise quotes' },
      { name: 'Taxmann compliance portal', category: 'General Tax portal', strength: 'Medium', pricing: 'Annual subscriptions' }
    ],
    marketGap: 'Enterprise software handles general corporate filings but lacks high-frequency validations for mutual fund portfolio splits, and AIF reports, leaving mid-tier fund operations to rely heavily on error-prone Excel scripts.',
    mvpRecommendation: 'A web portal for AIFs (Alternative Investment Funds) to upload monthly asset allocation sheets, running automatic schema checks and outputting SEBI compliance-ready XML/PDF packages.',
    monetizationHypothesis: 'Annual SaaS subscription model starting at ₹1.2L per fund manager, including portal submission receipts and audit trail logs.',
    risks: [
      "Any change in government portals requires instant adapter updates to prevent filing failures.",
      "High liability associated with validation failures resulting in late fees."
    ],
    indiaRelevanceText: '100% India-centric, mapping directly to SEBI and RBI reporting compliance standards for asset managers.',
    relatedOpportunities: ['bfsi-ai-compliance', 'bfsi-upi-fraud'],
    lastUpdated: '08 Aug 2026'
  },
  {
    id: 'it-code-migration',
    title: 'Automated AI Code Migration Agent',
    problem: 'Indian IT services companies waste millions of developer hours manually refactoring legacy enterprise codebases to modern stacks.',
    targetCustomer: 'System Integrators, IT Consulting Houses, and Enterprise CTOs',
    industry: 'IT / Software Engineering',
    vertical: 'IT',
    score: 91,
    scores: {
      demand: 93,
      hiring: 89,
      regulation: 50,
      skills: 92,
      competition: 78,
      timing: 95,
      indiaRelevance: 88
    },
    momentum: 'rising',
    changePercentage: 60,
    signalCount: 25,
    sourceCount: 7,
    whyInteresting: 'Enterprises are accelerating migrations from Cobol/Java 8/PHP 5 to Python/Go/Node, but lacks budget to hire thousands of refactoring developers.',
    overview: 'Legacy codebase refactoring is the largest segment of Indian IT services delivery. Developers spend months mapping logic, writing test cases, and migrating frameworks. This platform uses structural AST (Abstract Syntax Tree) parsers and Gemini models to translate code blocks, auto-generating unit tests for the target code to guarantee semantic equivalence.',
    whyMatters: 'Manual migration projects regularly exceed timelines by 200%, bottlenecking legacy digital transformations and creating technical debt.',
    demandAnalysis: 'Enterprise RFPs requesting "AI-accelerated migration processes" grew by 150% in Indian IT consulting firms (TCS, HCL, Cognizant) according to industry news.',
    signalsTimeline: [
      { date: 'Mar 26', value: 40 },
      { date: 'Apr 26', value: 50 },
      { date: 'May 26', value: 65 },
      { date: 'Jun 26', value: 78 },
      { date: 'Jul 26', value: 85 },
      { date: 'Aug 26', value: 91 }
    ],
    hiringSignals: [
      { role: 'Enterprise Migration Lead', volume: 'High', salaryRange: '₹24L - ₹40L L.A.', count: 68 },
      { role: 'Cobol refactoring engineer', volume: 'Medium', salaryRange: '₹18L - ₹28L L.A.', count: 45 }
    ],
    skillSignals: [
      { skill: 'AST Code Translation parsing', scarcity: 'Critical', impact: 'Ensures compiler-level logical checking instead of basic regex LLM generation.' },
      { skill: 'Legacy code structure mapping', scarcity: 'High', impact: 'Understanding deprecated structures in Java 6 or legacy systems.' }
    ],
    technologySignals: [
      { tech: 'Gemini Code Translation models', adoptionRate: 'Growing', description: 'Large context window models capable of analyzing entire source code repositories.' }
    ],
    competitionList: [
      { name: 'vFunction', category: 'Microservices Refactoring', strength: 'Strong', pricing: 'Enterprise contract' },
      { name: 'GitHub Copilot Workspace', category: 'AI Agent coding', strength: 'Medium', pricing: '$19/developer/month, lacks batch migration logic' }
    ],
    marketGap: 'Generic AI autocomplete tools parse single lines or files but lack context of complex repository dependency graphs, causing generated code to fail imports and break compilations.',
    mvpRecommendation: 'CLI refactoring tool. It ingests legacy directories (e.g. Java 8), parses dependencies, generates equivalent structures in modern Node.js/TypeScript, and exports mock tests checking that outputs match.',
    monetizationHypothesis: 'Project-based software pricing: charging ₹200 per source file migrated, or enterprise software licensing for IT consulting houses.',
    risks: [
      "Complex proprietary legacy frameworks are difficult for public AI models to interpret correctly.",
      "Enterprise compliance codes strictly prohibit uploading source code folders to cloud-hosted models."
    ],
    indiaRelevanceText: 'India is the global backend office for software systems engineering; over 70% of legacy migration projects are executed by developers based in Bengaluru, Pune, Hyderabad, and Chennai.',
    relatedOpportunities: ['it-llm-devops', 'it-cybersecurity-access'],
    lastUpdated: '12 Aug 2026'
  },
  {
    id: 'it-cybersecurity-access',
    title: 'Zero-Trust Cloud Access Monitor',
    problem: 'Remote consulting teams working on public cloud setups accidentally expose DB endpoints or leak service accounts credentials, causing catastrophic leaks.',
    targetCustomer: 'Tech startups, IT services firms, and Cloud Consultancies',
    industry: 'IT / Cybersecurity',
    vertical: 'IT',
    score: 83,
    scores: {
      demand: 82,
      hiring: 80,
      regulation: 78,
      skills: 85,
      competition: 70,
      timing: 83,
      indiaRelevance: 80
    },
    momentum: 'steady',
    changePercentage: 15,
    signalCount: 11,
    sourceCount: 3,
    whyInteresting: 'Recent ransomware attacks on Indian FinTechs were traced back to exposed developer keys leaked in slack chats or configuration files.',
    overview: 'As developers shift to remote work environments, managing access permissions to AWS/GCP setups becomes highly complex. This tool scans cloud logs, active terminal sessions, and configuration directories in real-time to identify anomalies in access patterns, auto-revoking credentials that exceed parameters.',
    whyMatters: 'Leaked developer credentials can lead to complete database wipes, regulatory fines from CERT-In, and absolute loss of customer credibility.',
    demandAnalysis: 'CERT-In cybersecurity audits are tightening compliance protocols. Job postings with certifications like CISSP and "cloud access governance" grew by 35% in India.',
    signalsTimeline: [
      { date: 'Mar 26', value: 70 },
      { date: 'Apr 26', value: 72 },
      { date: 'May 26', value: 75 },
      { date: 'Jun 26', value: 78 },
      { date: 'Jul 26', value: 80 },
      { date: 'Aug 26', value: 83 }
    ],
    hiringSignals: [
      { role: 'Cloud Security Analyst', volume: 'High', salaryRange: '₹15L - ₹26L L.A.', count: 54 },
      { role: 'Access Control developer', volume: 'Medium', salaryRange: '₹12L - ₹20L L.A.', count: 32 }
    ],
    skillSignals: [
      { skill: 'AWS IAM Policy Auditing', scarcity: 'High', impact: 'Parsing complex JSON policies to detect permission wildcard risks.' },
      { skill: 'Real-time log stream auditing', scarcity: 'Medium', impact: 'Handling large volumes of cloud trail logs without introducing cost.' }
    ],
    technologySignals: [
      { tech: 'eBPF Kernel Telemetry', adoptionRate: 'Emerging', description: 'Audits access logs at the operating system level, impossible for users to tamper with.' }
    ],
    competitionList: [
      { name: 'Wiz', category: 'Cloud Security Platform', strength: 'Strong', pricing: 'Global enterprise scale ($$$$)' },
      { name: 'Tailscale Access', category: 'VPN access control', strength: 'Medium', pricing: 'Per-user monthly billing' }
    ],
    marketGap: 'Global Cloud Security Posture Management (CSPM) software is expensive and built for large enterprise compliance teams. Indian mid-market tech startups need a lightweight, self-serve access checker that costs under ₹10,000/month.',
    mvpRecommendation: 'Slack integration + AWS CloudTrail auditor. Hook up the app to AWS logs; it alerts developers in Slack when an endpoint is made public or accessed from a new IP, providing a one-click button to block access.',
    monetizationHypothesis: 'SaaS: ₹4,999/month for up to 3 cloud accounts, and ₹14,999/month for unlimited cloud accounts with SLA support.',
    risks: [
      "Exposing cloud access credentials to a security startup is itself a security risk.",
      "High rate of false-positive warnings can cause alert fatigue in developers."
    ],
    indiaRelevanceText: 'Indian startups face unique constraints, including high developer turnover rates and sudden security compliance checks under new CERT-In data protection rules.',
    relatedOpportunities: ['it-llm-devops', 'it-code-migration'],
    lastUpdated: '06 Aug 2026'
  },
  {
    id: 'healthtech-telemed',
    title: 'AI‑Powered Tele‑medicine Platform',
    problem: 'Rural patients lack access to specialist doctors; clinics struggle with appointment scheduling and follow‑up.',
    targetCustomer: 'Tier‑2/3 Clinics, Remote Patient Monitoring Startups',
    industry: 'HealthTech',
    vertical: 'HealthTech',
    score: 86,
    scores: { demand: 88, hiring: 84, regulation: 70, skills: 80, competition: 65, timing: 90, indiaRelevance: 92 },
    momentum: 'rising',
    changePercentage: 40,
    signalCount: 12,
    sourceCount: 4,
    whyInteresting: 'Post‑pandemic surge in remote consults and government tele‑health incentives.',
    overview: 'A unified platform that aggregates doctor calendars, patient records, and AI symptom triage to schedule video consults and generate e‑prescriptions.',
    whyMatters: 'Improves health outcomes in underserved regions and creates a scalable revenue stream for clinics.',
    demandAnalysis: 'Job postings for “tele‑medicine product manager” grew 70% YoY in India.',
    signalsTimeline: [
      { date: 'Mar 26', value: 30 },
      { date: 'Apr 26', value: 45 },
      { date: 'May 26', value: 58 },
      { date: 'Jun 26', value: 70 },
      { date: 'Jul 26', value: 78 },
      { date: 'Aug 26', value: 85 }
    ],
    hiringSignals: [
      { role: 'Tele‑health Engineer', volume: 'Medium', salaryRange: '₹12L - ₹22L L.A.', count: 30 }
    ],
    skillSignals: [
      { skill: 'FHIR Integration', scarcity: 'High', impact: 'Standardized patient data exchange.' }
    ],

    technologySignals: [
      { tech: 'Live video SDKs (Agora, Twilio)', adoptionRate: 'Emerging', description: 'Low‑latency streaming for Indian bandwidth.' }
    ],
    competitionList: [
      { name: 'Practo Tele‑consult', category: 'Tele‑health', strength: 'Strong', pricing: 'Subscription per doctor' }
    ],
    marketGap: 'Existing tele‑health apps focus on urban users; lack AI triage and integration with local EMR systems.',
    mvpRecommendation: 'A web portal for clinics to upload schedules and AI‑driven symptom questionnaire; generates appointment slots automatically.',
    monetizationHypothesis: '₹5,000/month per clinic for up to 200 consultations, with per‑consult fee for extra usage.',
    risks: [
      "Data privacy compliance with India’s Health Data regulations.",
      "Doctor adoption – need easy onboarding."
    ],
    indiaRelevanceText: 'Government’s National Digital Health Mission promotes tele‑medicine adoption in rural India.',
    relatedOpportunities: [],
    lastUpdated: '13 Aug 2026'
  },
  {
    id: 'edtech-ai-tutor',
    title: 'Personalised AI Tutor for K‑12',
    problem: 'Students in low‑resource schools receive generic content; teachers cannot provide individualized feedback.',
    targetCustomer: 'EdTech startups, School districts',
    industry: 'EdTech',
    vertical: 'EdTech',
    score: 84,
    scores: { demand: 90, hiring: 85, regulation: 60, skills: 78, competition: 70, timing: 88, indiaRelevance: 95 },
    momentum: 'rising',
    changePercentage: 45,
    signalCount: 14,
    sourceCount: 5,
    whyInteresting: 'AI‑driven tutoring platforms saw 150% usage increase after remote learning shift.',
    overview: 'Generative AI creates custom practice problems, explains concepts in multiple Indian languages, and auto‑grades assignments.',
    whyMatters: 'Improves learning outcomes and reduces teacher workload, especially in multilingual classrooms.',
    demandAnalysis: 'Hiring spikes for “AI curriculum engineer” and “Multilingual content creator” in education tech.',
    signalsTimeline: [
      { date: 'Mar 26', value: 35 },
      { date: 'Apr 26', value: 48 },
      { date: 'May 26', value: 60 },
      { date: 'Jun 26', value: 72 },
      { date: 'Jul 26', value: 80 },
      { date: 'Aug 26', value: 88 }
    ],
    hiringSignals: [
      { role: 'Content AI Engineer', volume: 'Medium', salaryRange: '₹14L - ₹24L L.A.', count: 25 }
    ],
    skillSignals: [
      { skill: 'Multilingual LLM fine‑tuning', scarcity: 'Critical', impact: 'Supports Hindi, Tamil, Bengali etc.' }
    ],
    technologySignals: [
      { tech: 'Retrieval‑augmented generation (RAG)', adoptionRate: 'Growing', description: 'Keeps factual correctness for textbook content.' }
    ],
    competitionList: [
      { name: 'Vedantu AI', category: 'Online tutoring', strength: 'Emerging', pricing: 'Pay‑per‑session' }
    ],
    marketGap: 'Most platforms target English‑speaking markets; lack deep regional language support and curriculum alignment with Indian boards.',
    mvpRecommendation: 'A web app where teachers upload syllabus PDFs; AI generates quizzes and solution videos in selected language.',
    monetizationHypothesis: '₹3,000 per school per month for unlimited quiz generation.',
    risks: [
      "Content licensing for textbook material.",
      "Ensuring AI‑generated explanations meet educational standards."
    ],
    indiaRelevanceText: 'India’s K‑12 market (≈250 M students) is rapidly digitising, with government push for blended learning.',
    relatedOpportunities: [],
    lastUpdated: '13 Aug 2026'
  },
  {
    id: 'climatetech-carbon-saas',
    title: 'Carbon Footprint Tracking SaaS for SMEs',
    problem: 'Small manufacturers lack tools to measure and report emissions, hindering ESG compliance.',
    targetCustomer: 'SME manufacturers, Supply‑chain partners',
    industry: 'ClimateTech',
    vertical: 'ClimateTech',
    score: 82,
    scores: { demand: 85, hiring: 80, regulation: 88, skills: 70, competition: 60, timing: 85, indiaRelevance: 90 },
    momentum: 'steady',
    changePercentage: 30,
    signalCount: 10,
    sourceCount: 3,
    whyInteresting: 'India’s carbon credit market is opening, and ESG reporting mandates for medium enterprises are upcoming.',
    overview: 'A lightweight SaaS that ingests production data (energy usage, raw material consumption) and calculates Scope 1‑3 emissions with AI‑enhanced factor mapping.',
    whyMatters: 'Enables SMEs to participate in carbon offset programs and meet upcoming regulatory thresholds.',
    demandAnalysis: 'Job ads for “ESG analyst” in Indian manufacturing grew 40% YoY.',
    signalsTimeline: [
      { date: 'Mar 26', value: 20 },
      { date: 'Apr 26', value: 30 },
      { date: 'May 26', value: 45 },
      { date: 'Jun 26', value: 58 },
      { date: 'Jul 26', value: 70 },
      { date: 'Aug 26', value: 78 }
    ],
    hiringSignals: [
      { role: 'Sustainability Data Engineer', volume: 'Medium', salaryRange: '₹15L - ₹25L L.A.', count: 18 }
    ],
    skillSignals: [
      { skill: 'GHG Protocol modeling', scarcity: 'High', impact: 'Accurate emission factor calculations.' }
    ],
    technologySignals: [
      { tech: 'GraphQL data connectors', adoptionRate: 'Emerging', description: 'Simplifies integration with ERP systems.' }
    ],
    competitionList: [
      { name: 'CarbonChain', category: 'Carbon SaaS', strength: 'Emerging', pricing: '$0.05 per tonne' }
    ],
    marketGap: 'Enterprise carbon platforms are expensive; SMEs need a low‑cost, plug‑and‑play solution.',
    mvpRecommendation: 'A simple web dashboard where users upload CSV of monthly energy data; AI fills missing factors and produces a compliance report.',
    monetizationHypothesis: '₹2,500 per month per site, with tiered pricing for multiple sites.',
    risks: [
      "Regulatory changes could alter reporting standards.",
      "Data quality from legacy ERP systems."
    ],
    indiaRelevanceText: 'India aims to reduce emissions intensity by 33% by 2030; SMEs will be pressured to report.',
    relatedOpportunities: [],
    lastUpdated: '13 Aug 2026'
  }
];

export const mockSkillTrends = [
  { name: 'GenAI fine-tuning', demandScore: 94, scarcityScore: 92, lastMonthScore: 82 },
  { name: 'Audio acoustics NLP', demandScore: 82, scarcityScore: 89, lastMonthScore: 71 },
  { name: 'AWS CloudTrail telemetry', demandScore: 78, scarcityScore: 72, lastMonthScore: 75 },
  { name: 'RBI compliance auditing', demandScore: 91, scarcityScore: 96, lastMonthScore: 80 },
  { name: 'XBRL taxonomy mapping', demandScore: 87, scarcityScore: 94, lastMonthScore: 78 },
  { name: 'GNN graph tracking', demandScore: 68, scarcityScore: 81, lastMonthScore: 62 },
  { name: 'eBPF system telemetry', demandScore: 72, scarcityScore: 85, lastMonthScore: 68 }
];

export const mockIndustryStats = {
  BFSI: { opportunities: 14, signals: 2420, averageScore: 87 },
  IT: { opportunities: 18, signals: 3840, averageScore: 85 }
};

export const mockQuestions = [
  {
    id: 'q-skills',
    questionText: 'What is your primary functional skillset?',
    options: [
      { text: 'Engineering / Software Development', value: 'tech' },
      { text: 'Product Management / Strategy', value: 'product' },
      { text: 'Sales / Business Development / Operations', value: 'sales' },
      { text: 'Compliance / Legal / Risk auditing', value: 'compliance' }
    ]
  },
  {
    id: 'q-domain',
    questionText: 'Which business vertical are you most familiar with?',
    options: [
      { text: 'Software Development & IT services', value: 'IT' },
      { text: 'Banking & Financial Lending (NBFC)', value: 'BFSI' },
      { text: 'Payments, UPI & Fintech frameworks', value: 'BFSI' },
      { text: 'General SaaS & Enterprise Tools', value: 'IT' }
    ]
  },
  {
    id: 'q-capital',
    questionText: 'What is your available starting capital budget?',
    options: [
      { text: 'Bootstrapped (Under ₹50k, only sweat equity)', value: 'low' },
      { text: 'Moderate (₹1L - ₹5L, can hire freelancers)', value: 'mid' },
      { text: 'Significant (₹5L+, can fund runway and core infrastructure)', value: 'high' }
    ]
  },
  {
    id: 'q-time',
    questionText: 'What is your time commitment availability?',
    options: [
      { text: 'Part-time side project (10-20 hrs/week)', value: 'side' },
      { text: 'Full-time commitment (40+ hrs/week)', value: 'full' }
    ]
  },
  {
    id: 'q-risk',
    questionText: 'What is your risk and compliance profile appetite?',
    options: [
      { text: 'Low (Prefer simple B2B SaaS without regulatory exposure)', value: 'low' },
      { text: 'High (Willing to tackle complex RBI/regulatory markets for high moats)', value: 'high' }
    ]
  }
];
