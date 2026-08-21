// Seed Data combining live synthesized opportunities and deep dive market signal catalog
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getAllSeedOpportunities() {
  const jsonPath = path.join(__dirname, '..', 'src', 'data', 'opportunities.json');
  let opps = [];
  if (fs.existsSync(jsonPath)) {
    try {
      opps = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
      console.error('Error reading opportunities.json:', e);
    }
  }

  const existingIds = new Set(opps.map(o => o.id));

  // Additional rich sector opportunities (BFSI, IT, ClimateTech, HealthTech, EdTech, AgriTech)
  const additionalOpps = [
    {
      id: 'bfsi-ai-compliance',
      title: 'AI Compliance Automation for BFSI',
      problem: 'Manual compliance reviews of multi-channel client communications are slow, expensive, and fail to prevent regulatory penalties.',
      targetCustomer: 'Indian Banks, NBFCs, and Digital Lending Apps',
      industry: 'BFSI / RegTech',
      vertical: 'BFSI',
      score: 92,
      scores: { demand: 91, hiring: 88, regulation: 94, skills: 82, competition: 68, timing: 93, indiaRelevance: 98 },
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
        'Strict data residency requirements in Indian banking require on-premise or sovereign private cloud deployment.',
        'High transcription error rates in Indian colloquial English ("Hinglish") call recordings.'
      ],
      indiaRelevanceText: 'Highly localized. Driven entirely by the Reserve Bank of India (RBI) aggressive crackdowns on digital lending misconduct and the recently implemented DPDP compliance requirements.',
      relatedOpportunities: ['bfsi-upi-fraud', 'bfsi-dpdp-rbi-compliance-automation'],
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
      scores: { demand: 94, hiring: 92, regulation: 89, skills: 85, competition: 72, timing: 91, indiaRelevance: 99 },
      momentum: 'rising',
      changePercentage: 62,
      signalCount: 24,
      sourceCount: 7,
      whyInteresting: 'Recent cyber cell account freezes have alarmed MSME merchant platforms, driving urgent investment into real-time transaction telemetry.',
      overview: 'With the explosive growth of UPI Auto-Pay and merchant credit lines, cyber syndicates exploit small merchants as money mules. When a mule account is flagged, law enforcement freezes the entire settlement chain, trapping legitimate business capital. This platform provides real-time graph neural network telemetry to stop mule transactions before settlement.',
      whyMatters: 'Account freezes paralyze small merchants for months without judicial recourse, directly eroding merchant acquirer retention.',
      demandAnalysis: 'State police cyber cells in Gujarat, Maharashtra, and Telangana issued thousands of freeze notices in Q2 2026. Gateways are under immense pressure to filter out illicit funds pre-clearing.',
      signalsTimeline: [
        { date: 'Mar 26', value: 30 },
        { date: 'Apr 26', value: 42 },
        { date: 'May 26', value: 58 },
        { date: 'Jun 26', value: 71 },
        { date: 'Jul 26', value: 83 },
        { date: 'Aug 26', value: 94 }
      ],
      hiringSignals: [
        { role: 'Senior Risk Engineer (Fraud Telemetry)', volume: 'High', salaryRange: '₹30L - ₹48L L.A.', count: 28 },
        { role: 'Graph Neural Network Engineer', volume: 'Medium', salaryRange: '₹28L - ₹40L L.A.', count: 19 }
      ],
      skillSignals: [
        { skill: 'Device Fingerprinting (Telemetry)', scarcity: 'High', impact: 'Determines if multiple accounts originate from identical hardware.' },
        { skill: 'GNN Mule Ring Detection', scarcity: 'Critical', impact: 'Traces multi-hop rapid fund dispersion across UPI handles.' }
      ],
      regulatorySignals: [
        { regulationName: 'NPCI Mule Account Telemetry Directive', agency: 'NPCI', summary: 'Requires payment aggregators to implement real-time velocity checking and device binding.', date: 'May 2026' }
      ],
      technologySignals: [
        { tech: 'Rust High-Throughput Stream Engine', adoptionRate: 'Growing', description: 'Evaluates transaction latency in under 15ms.' }
      ],
      competitionList: [
        { name: 'Bureau.id', category: 'Identity & Fraud', strength: 'Strong', pricing: 'Per-API-call billing' },
        { name: 'Sift', category: 'Global Fraud Engine', strength: 'Medium', pricing: 'High enterprise pricing, weak UPI context' }
      ],
      marketGap: 'Existing solutions focus on credit card chargeback prevention and card-not-present fraud, but lack sub-second telemetry optimized for high-velocity UPI QR settlements.',
      mvpRecommendation: 'Lightweight JavaScript and Android SDK that measures transaction velocity, device stability, and sudden geo-hops before authorizing settlement.',
      monetizationHypothesis: 'Usage-based API pricing (₹0.15 per monitored transaction) or SaaS subscription for payment gateways.',
      risks: ['Strict latency constraints: decisions must return within 100ms without degrading UPI checkout UX.'],
      indiaRelevanceText: 'Unique to the Indian payment landscape where instant UPI volume exceeds 13 billion transactions monthly.',
      relatedOpportunities: ['bfsi-ai-compliance'],
      lastUpdated: '12 Aug 2026'
    },
    {
      id: 'it-legacy-code-refactor',
      title: 'AI Legacy Code Refactoring & Modernization Engine',
      problem: 'Enterprises spend billions maintaining legacy Java 8, PHP, and COBOL applications, bottlenecking cloud migrations.',
      targetCustomer: 'Indian IT Services firms (TCS, Infosys, Wipro clients), Mid-sized Enterprises',
      industry: 'IT / Developer Tools',
      vertical: 'IT',
      score: 87,
      scores: { demand: 89, hiring: 84, regulation: 70, skills: 90, competition: 74, timing: 88, indiaRelevance: 88 },
      momentum: 'rising',
      changePercentage: 35,
      signalCount: 15,
      sourceCount: 5,
      whyInteresting: 'Indian IT services companies are actively acquiring AI-assisted modernization tools to preserve gross margins in fixed-bid migration projects.',
      overview: 'An AI-powered AST (Abstract Syntax Tree) compiler that analyzes legacy codebases, converts them to modern TypeScript/Go microservices, and automatically writes 100% test suites verifying behavioral parity.',
      whyMatters: 'Legacy code migrations carry huge project overrun risks; automated validation cuts delivery timelines by 60%.',
      demandAnalysis: 'Discussion on developer forums regarding AI code modernization grew 75% YoY across Indian tech hubs.',
      signalsTimeline: [
        { date: 'Mar 26', value: 40 },
        { date: 'Apr 26', value: 48 },
        { date: 'May 26', value: 60 },
        { date: 'Jun 26', value: 72 },
        { date: 'Jul 26', value: 80 },
        { date: 'Aug 26', value: 89 }
      ],
      hiringSignals: [
        { role: 'Compilers & AST Engineer', volume: 'Medium', salaryRange: '₹35L - ₹55L L.A.', count: 16 },
        { role: 'Cloud Migration Specialist', volume: 'High', salaryRange: '₹20L - ₹35L L.A.', count: 54 }
      ],
      skillSignals: [
        { skill: 'AST Code Transformation', scarcity: 'Critical', impact: 'Ensures deterministic translation without hallucinating APIs.' }
      ],
      regulatorySignals: [],
      technologySignals: [
        { tech: 'Tree-sitter AST Parsers', adoptionRate: 'Mature', description: 'Used to parse polyglot source trees into uniform syntax nodes.' }
      ],
      competitionList: [
        { name: 'Moderne', category: 'Automated Refactoring', strength: 'Strong', pricing: 'Enterprise licensing' }
      ],
      marketGap: 'Global tools specialize in single languages (e.g. Java only), whereas Indian outsourcing giants require multi-stack conversion pipelines.',
      mvpRecommendation: 'CLI tool and web dashboard that translates monolithic Spring Boot Java 8 applications to idiomatic Node.js/Go with Jest/Go test harnesses.',
      monetizationHypothesis: 'Per-repository and lines-of-code analyzed pricing, targeting consulting firms.',
      risks: ['Edge cases in dynamic runtime reflection and legacy database triggers.'],
      indiaRelevanceText: 'Directly powers the global delivery operations of Indian IT services firms that manage the majority of the world’s legacy enterprise code.',
      relatedOpportunities: ['it-llm-observability-gateway'],
      lastUpdated: '11 Aug 2026'
    },
    {
      id: 'it-llm-observability-gateway',
      title: 'LLM Observability and Token Caching Gateway',
      problem: 'Generative AI applications running in production suffer from unpredictable cloud API bills, latency spikes, and recursive prompt loops.',
      targetCustomer: 'AI Startups, Enterprise Engineering Teams, and SaaS Builders',
      industry: 'IT / DevOps & AI Infrastructure',
      vertical: 'IT',
      score: 86,
      scores: { demand: 88, hiring: 82, regulation: 65, skills: 88, competition: 78, timing: 92, indiaRelevance: 85 },
      momentum: 'rising',
      changePercentage: 42,
      signalCount: 14,
      sourceCount: 5,
      whyInteresting: 'Rapid adoption of multi-agent workflows has led to compounding API costs, creating intense demand for smart semantic caching.',
      overview: 'A high-performance reverse proxy that sits between application code and model providers (OpenAI, Gemini, Anthropic). It provides semantic caching, automated fallback to cheaper Indian data center endpoints, and strict token budget enforcement.',
      whyMatters: 'Uncontrolled agent loops can exhaust monthly cloud budgets in hours; the gateway acts as an automated circuit breaker.',
      demandAnalysis: 'Developer discussions regarding LLM spend control and latency tracing spiked 90% across GitHub and Reddit.',
      signalsTimeline: [
        { date: 'Mar 26', value: 35 },
        { date: 'Apr 26', value: 45 },
        { date: 'May 26', value: 58 },
        { date: 'Jun 26', value: 70 },
        { date: 'Jul 26', value: 81 },
        { date: 'Aug 26', value: 88 }
      ],
      hiringSignals: [
        { role: 'AI Platform / DevOps Engineer', volume: 'High', salaryRange: '₹25L - ₹42L L.A.', count: 38 }
      ],
      skillSignals: [
        { skill: 'Semantic Vector Caching', scarcity: 'High', impact: 'Matches prompts by cosine similarity to return cached completions.' }
      ],
      regulatorySignals: [],
      technologySignals: [
        { tech: 'eBPF / Envoy Gateway Extension', adoptionRate: 'Growing', description: 'Zero-overhead proxy routing for LLM payloads.' }
      ],
      competitionList: [
        { name: 'Helicone', category: 'LLM Proxy', strength: 'Medium', pricing: 'Freemium / Usage' },
        { name: 'Portkey', category: 'AI Gateway', strength: 'Strong', pricing: 'Enterprise tier' }
      ],
      marketGap: 'Most gateways only support US-based clouds, lacking optimized regional Indian routing and localized cost controls.',
      mvpRecommendation: 'Deploy an open-source Rust proxy container with a web dashboard monitoring request latencies, cache hit rates, and real-time dollar burn.',
      monetizationHypothesis: 'Hosted managed cloud at ₹3,500/month with 10M token proxy allowance, plus enterprise self-hosted licenses.',
      risks: ['Provider pricing drops may reduce cache ROI for short prompts.'],
      indiaRelevanceText: 'Critical for Indian startups and tech agencies operating under strict dollar budget constraints.',
      relatedOpportunities: ['it-legacy-code-refactor'],
      lastUpdated: '12 Aug 2026'
    },
    {
      id: 'climatetech-carbon-saas',
      title: 'Carbon Footprint Tracking SaaS for Indian SMEs',
      problem: 'Small and medium manufacturers lack automated tools to measure and report Scope 1-3 emissions, hindering export and supply chain ESG compliance.',
      targetCustomer: 'SME manufacturers, Automotive Tier-1/2 Suppliers, Export Units',
      industry: 'ClimateTech / Sustainability',
      vertical: 'ClimateTech',
      score: 82,
      scores: { demand: 85, hiring: 80, regulation: 88, skills: 70, competition: 60, timing: 85, indiaRelevance: 90 },
      momentum: 'steady',
      changePercentage: 30,
      signalCount: 10,
      sourceCount: 3,
      whyInteresting: 'India’s carbon credit market is expanding, and SEBI BRSR Core reporting mandates are cascading to supply-chain vendors.',
      overview: 'A lightweight SaaS that ingests factory utility bills, fuel invoices, and raw material inputs to calculate verified emissions with AI-assisted emission factor mapping.',
      whyMatters: 'European CBAM (Carbon Border Adjustment Mechanism) tax penalties threaten Indian industrial exporters who cannot prove emissions data.',
      demandAnalysis: 'Job ads for ESG analysts in Indian manufacturing hubs grew 40% YoY.',
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
        { skill: 'GHG Protocol Factor Modeling', scarcity: 'High', impact: 'Accurate emission calculations matching Indian grid standards.' }
      ],
      regulatorySignals: [
        { regulationName: 'SEBI BRSR Core Mandates', agency: 'SEBI', summary: 'Mandatory ESG disclosures for top 1,000 listed entities and key supply-chain partners.', date: 'May 2026' }
      ],
      technologySignals: [
        { tech: 'ERP Connectors (SAP, Tally)', adoptionRate: 'Emerging', description: 'Automates raw data ingestion from Indian bookkeeping software.' }
      ],
      competitionList: [
        { name: 'CarbonChain', category: 'Carbon SaaS', strength: 'Emerging', pricing: 'High enterprise pricing' }
      ],
      marketGap: 'Global carbon platforms are prohibitively expensive for Indian SMEs; a low-cost, Tally-integrated solution is missing.',
      mvpRecommendation: 'Web dashboard where users upload monthly Tally XML or CSV energy data; system automatically generates a certified ESG audit report.',
      monetizationHypothesis: '₹2,500 per month per manufacturing facility.',
      risks: ['Data inconsistencies in legacy factory meters and paper invoices.'],
      indiaRelevanceText: 'India aims to reduce emissions intensity by 45% by 2030, putting pressure on supply chain suppliers.',
      relatedOpportunities: [],
      lastUpdated: '13 Aug 2026'
    }
  ];

  for (const item of additionalOpps) {
    if (!existingIds.has(item.id)) {
      opps.push(item);
    }
  }

  return opps;
}
