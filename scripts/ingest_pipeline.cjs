// FounderSignal - daily Ingestion & AI Enrichment Pipeline
// Uses the Gemini API to analyze raw signal clusters and generate opportunities.
// Resilient fallback logic: Automatically retries without Google Search Grounding if billing is disabled (429/403).

const fs = require('fs');
const path = require('path');
const https = require('https');
const fetch = require('node-fetch');

// Load environment variables (from .env if available)
let apiKey = process.env.GEMINI_API_KEY || '';

// Raw Ingestion Feed (Simulated sources input)
const rawIngestedSignals = [
  // Cluster 1: UPI fraud and freezes
  { source: 'Reddit (r/IndiaTech)', text: 'My merchant account was frozen by Gujarat Cyber Cell due to a suspicious UPI credit transfer. Completely locked my working capital.', date: '11 Aug 2026' },
  { source: 'Reddit (r/indiastartups)', text: 'FINTECH WARNING: Gateways are blocking POS merchant settlements due to sudden rise in merchant mule accounts running UPI scams.', date: '10 Aug 2026' },
  { source: 'LinkedIn Jobs', text: 'Fintech Corp hiring: Fraud Analysts, Risk Engine Engineers. Expertise in device fingerprinting, transaction telemetry, NPCI regulations.', date: '12 Aug 2026' },
  
  // Cluster 2: RBI digital compliance
  { source: 'RBI Announcements', text: 'RBI circular updates on fair practices code: strict monitoring of outsourced lending communication apps and audit trail logs.', date: '08 Aug 2026' },
  { source: 'StackOverflow', text: 'How to implement DPDP compliance consent manager workflow for Indian fintech user onboarding?', date: '11 Aug 2026' },
  { source: 'LinkedIn Jobs', text: 'Razorpay hiring: Lead Compliance Officer. Deep knowledge of RBI fair practices guidelines, lending disclosures, and data protection.', date: '12 Aug 2026' },

  // Cluster 3: IT services code translation
  { source: 'Tech News India', text: 'Indian IT services sectors hit by margins pressure. Companies rushing to refactor legacy code migrations (Java 8 to Node.js/Go) to reduce timelines.', date: '09 Aug 2026' },
  { source: 'GitHub Discussions', text: 'Refactoring enterprise PHP legacy code to Python using Gemini code analysis. Need AST compilers to write tests for verified behavior.', date: '11 Aug 2026' },

  // Cluster 4: LLM Observability & DevOps
  { source: 'GitHub Discussions', text: 'My generative agents loops are calling OpenAI API recursively. Cost me $200 in an hour. Need a cost-limiting proxy caching layer.', date: '05 Aug 2026' },
  { source: 'Reddit (r/devops)', text: 'Is there a good open-source proxy to trace LLM latency, input prompt changes, and system errors in production?', date: '10 Aug 2026' },

  // Cluster 5: GST tax matching
  { source: 'GST Portal News', text: 'CBIC mandates invoice level matches for Input Tax Credit claims under GSTR-2B. Manual matching is locking cash claims.', date: '07 Aug 2026' },
  { source: 'Twitter (@SMEIndia)', text: 'GST reconciliation is a nightmare. Our suppliers upload invoices late, and we lose tax credits because of discrepancy issues.', date: '11 Aug 2026' }
];

// Heuristic Clustering
function clusterSignals(signals) {
  console.log(`Clustering ${signals.length} raw incoming signals...`);
  
  const complianceGroup = [];
  const upiFraudGroup = [];
  const codeMigrationGroup = [];
  const observabilityGroup = [];
  const taxGroup = [];

  signals.forEach(s => {
    const text = s.text.toLowerCase();
    if (text.includes('compliance') || text.includes('rbi') || text.includes('dpdp') || text.includes('audit')) {
      complianceGroup.push(s);
    } else if (text.includes('upi') || text.includes('fraud') || text.includes('freeze') || text.includes('mule')) {
      upiFraudGroup.push(s);
    } else if (text.includes('code') || text.includes('refactoring') || text.includes('legacy') || text.includes('migration')) {
      codeMigrationGroup.push(s);
    } else if (text.includes('openai') || text.includes('devops') || text.includes('observability') || text.includes('llm') || text.includes('proxy')) {
      observabilityGroup.push(s);
    } else if (text.includes('gst') || text.includes('tax') || text.includes('invoice') || text.includes('reconciliation')) {
      taxGroup.push(s);
    }
  });

  return [
    { id: 'bfsi-ai-compliance', name: 'BFSI AI Regulatory Compliance Audits', signals: complianceGroup, vertical: 'BFSI', industry: 'BFSI / RegTech' },
    { id: 'bfsi-fraud-prevention', name: 'Real-time UPI Merchant Fraud Prevention', signals: upiFraudGroup, vertical: 'BFSI', industry: 'BFSI / Payments' },
    { id: 'it-code-migration', name: 'AI Legacy Code Refactoring & Migration', signals: codeMigrationGroup, vertical: 'IT', industry: 'IT / Software Engineering' },
    { id: 'it-llm-devops', name: 'LLM Observability and Token Caching Gateway', signals: observabilityGroup, vertical: 'IT', industry: 'IT / DevOps & AI Infrastructure' },
    { id: 'bfsi-gst-reconciliation', name: 'GST Invoice Matching & Tax Arbitrage', signals: taxGroup, vertical: 'BFSI', industry: 'BFSI / Compliance Tech' }
  ].filter(c => c.signals.length > 0);
}

// Call Unified API (Gemini, Perplexity, or ChatGPT/OpenAI)
function callAPI(provider, apiKey, prompt, enableGrounding = true) {
  return new Promise((resolve, reject) => {
    // Disable SSL rejection for local environments behind proxies
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    let url = '';
    let headers = {
      'Content-Type': 'application/json'
    };
    let bodyObj = {};

    if (provider === 'gemini') {
      const modelName = 'gemini-3.5-flash';
      url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      bodyObj = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };
      if (enableGrounding) {
        bodyObj.tools = [{ googleSearch: {} }];
      }
    } else if (provider === 'chatgpt') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      bodyObj = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      };
    } else if (provider === 'perplexity') {
      url = 'https://api.perplexity.ai/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      bodyObj = {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{ role: 'user', content: prompt }]
      };
    }

    const data = JSON.stringify(bodyObj);
    headers['Content-Length'] = Buffer.byteLength(data);

    const parsedUrl = new URL(url);
    const options = {
      method: 'POST',
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: responseBody });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

// Helper: fetch top 3 Reddit posts for a topic
async function fetchRedditSummaries(topic) {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(topic)}&limit=3`;
    const res = await fetch(url, { headers: { 'User-Agent': 'FounderSignalBot/1.0' } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.children.map(c => `${c.data.title} (r/${c.data.subreddit})`);
  } catch (e) {
    console.error('Reddit fetch error:', e.message);
    return [];
  }
}

// Helper: fetch top 3 GitHub repositories for a topic
async function fetchGitHubSummaries(topic) {
  try {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic)}&per_page=3`;
    const res = await fetch(url, { headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'FounderSignalBot/1.0' } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.items.map(item => `${item.full_name}: ${item.description || 'No description'}`);
  } catch (e) {
    console.error('GitHub fetch error:', e.message);
    return [];
  }
}

// Helper: fetch top 2 LinkedIn articles using Gemini search grounding
async function fetchLinkedInSummaries(topic, provider, apiKey) {
  const prompt = `
Provide concise bullet‑point summaries (up to 2) of the most relevant LinkedIn articles/posts about "${topic}". Include the article title and a one‑sentence description. Return the result as a JSON array of strings.
`;
  try {
    const response = await callAPI(provider, apiKey, prompt, true);
    if (response.statusCode !== 200) return [];
    const responseJson = JSON.parse(response.body);
    let text = '';
    if (provider === 'gemini') {
      text = responseJson.candidates[0].content.parts[0].text.trim();
    } else if (provider === 'chatgpt' || provider === 'perplexity') {
      text = responseJson.choices[0].message.content.trim();
    }
    // Expect JSON array; attempt to parse
    const arr = JSON.parse(text.replace(/^```json/, '').replace(/```\s*$/, '').trim());
    return Array.isArray(arr) ? arr.slice(0, 2) : [];
  } catch (e) {
    console.error('LinkedIn API fetch error:', e.message);
    return [];
  }
}

// Run analysis for a specific cluster
async function analyzeCluster(cluster, provider, apiKey) {
  console.log(`\nAnalyzing cluster: ${cluster.name}...`);
  
  const signalsText = cluster.signals.map(s => `- [${s.source}]: "${s.text}"`).join('\n');
  
  const prompt = `
You are an expert startup opportunity intelligence analyzer. 
Analyze the following raw market signals for the Indian market in the ${cluster.vertical} vertical:

${signalsText}

Generate a structured business opportunity JSON matching this TypeScript interface:
interface Opportunity {
  id: string; // url-safe id, e.g. 'bfsi-ai-compliance'
  title: string; // opportunity name, e.g. 'AI Compliance Automation for BFSI'
  problem: string; // underlying customer problem in India
  targetCustomer: string; // e.g. 'Indian Banks, NBFCs, and Digital Lending Apps'
  industry: string; // e.g. 'BFSI / RegTech'
  vertical: 'IT' | 'BFSI';
  score: number; // overall opportunity score 0-100 calculated by weighing signals
  scores: {
    demand: number; // 0-100
    hiring: number; // 0-100
    regulation: number; // 0-100
    skills: number; // 0-100
    competition: number; // 0-100 (high gap = high score)
    timing: number; // 0-100
    indiaRelevance: number; // 0-100
  };
  momentum: 'rising' | 'steady' | 'declining';
  changePercentage: number; // e.g. 48 for +48% growth
  signalCount: number; // number of signal clusters supporting
  sourceCount: number; // number of source families
  whyInteresting: string; // one-sentence tagline summarizing the opportunity
  overview: string; // detailed product concept summary
  whyMatters: string; // why failure to solve this is critical for target customers
  demandAnalysis: string; // summary of hiring/discussion/search trends
  signalsTimeline: { date: string; value: number }[]; // 6 elements representing months (e.g. Mar 26 to Aug 26) and signal intensity counts
  hiringSignals: { role: string; volume: 'High' | 'Medium' | 'Low'; salaryRange: string; count: number }[]; // 2-3 roles
  skillSignals: { skill: string; scarcity: 'Critical' | 'High' | 'Medium'; impact: string }[]; // 2-3 skills
  regulatorySignals: { regulationName: string; agency: string; summary: string; date: string }[]; // Indian agencies (RBI, SEBI, NPCI, CERT-In)
  technologySignals: { tech: string; adoptionRate: string; description: string }[]; // tech tags
  competitionList: { name: string; category: string; strength: 'Strong' | 'Emerging' | 'Weak' | 'Medium'; pricing: string }[]; // 2-3 competitors
  marketGap: string; // why existing alternatives are insufficient in India
  mvpRecommendation: string; // description of the smallest buildable MVP
  monetizationHypothesis: string; // description of pricing model (in INR)
  risks: string[]; // 2 risk strings
  indiaRelevanceText: string; // explanation of India-specific catalysts
  relatedOpportunities: string[]; // empty array
  lastUpdated: string; // e.g. '13 Aug 2026'
}

Return ONLY valid JSON content. Do not include any markdown fences (like \`\`\`json).
`;

  let response;
  try {
    if (provider === 'gemini') {
      // Step A: Attempt with Google Search Grounding first (Requires paid tier)
      console.log("  Attempting analysis with Google Search Grounding...");
      response = await callAPI(provider, apiKey, prompt, true);
      
      // Step B: Resilient Fallback to standard model if 429 quota/billing block occurs
      if (response.statusCode === 429 || response.statusCode === 403) {
        console.log("  [Quota/Billing Limit] Falling back to standard Gemini API call (free tier)...");
        response = await callAPI(provider, apiKey, prompt, false);
      }
    } else {
      console.log(`  Attempting analysis with ${provider.toUpperCase()}...`);
      response = await callAPI(provider, apiKey, prompt, false);
    }
  } catch(err) {
    console.log("  [Network Error] Retrying...", err.message);
    response = await callAPI(provider, apiKey, prompt, false);
  }

  if (response.statusCode === 200) {
    try {
      const responseJson = JSON.parse(response.body);
      let generatedText = '';
      if (provider === 'gemini') {
        generatedText = responseJson.candidates[0].content.parts[0].text;
      } else if (provider === 'chatgpt' || provider === 'perplexity') {
        generatedText = responseJson.choices[0].message.content;
      }
      const cleanJsonText = generatedText.trim().replace(/^```json/, '').replace(/```\s*$/, '').trim();
      const parsedOpportunity = JSON.parse(cleanJsonText);
      console.log(`  Successfully generated opportunity: ${parsedOpportunity.title} (Score: ${parsedOpportunity.score})`);
      // Enrich with external feeds (Reddit, GitHub, LinkedIn)
      try {
        const [reddit, github, linkedin] = await Promise.all([
          fetchRedditSummaries(parsedOpportunity.title),
          fetchGitHubSummaries(parsedOpportunity.title),
          fetchLinkedInSummaries(parsedOpportunity.title, provider, apiKey)
        ]);
        parsedOpportunity.feeds = { reddit, github, linkedin };
      } catch (e) {
        console.error('Error fetching external feeds:', e);
        parsedOpportunity.feeds = { reddit: [], github: [], linkedin: [] };
      }
      return parsedOpportunity;
    } catch(e) {
      console.error("  Error parsing JSON generated by model. Error:", e.message);
      return null;
    }
  } else {
    console.error(`  Failed with Status Code: ${response.statusCode}. Error:`, response.body);
    return null;
  }
}

const readline = require('readline');

// Prompt user for API Key if not present in env
function askForKey() {
  return new Promise((resolve) => {
    const envKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.PERPLEXITY_API_KEY;
    if (envKey) {
      let provider = 'gemini';
      if (envKey.startsWith('sk-')) {
        provider = 'chatgpt';
      } else if (envKey.startsWith('pplx-')) {
        provider = 'perplexity';
      }
      resolve({ provider, key: envKey });
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nPlease enter your API Key (Gemini, Perplexity, or ChatGPT) to update the feed:\n> ', (input) => {
      rl.close();
      const key = input.trim();
      if (!key) {
        console.error('Error: API Key is required to run the ingestion pipeline.');
        process.exit(1);
      }

      let provider = 'gemini';
      if (key.startsWith('sk-')) {
        provider = 'chatgpt';
      } else if (key.startsWith('pplx-')) {
        provider = 'perplexity';
      }

      resolve({ provider, key });
    });
  });
}

// Ingestion Pipeline runner
async function runIngestionPipeline() {
  console.log("=== STARTING FOUNDER SIGNAL INGESTION PIPELINE ===");
  const { provider, key } = await askForKey();
  console.log(`Using API Provider: ${provider.toUpperCase()}`);
  console.log("Active API Key:", key.substring(0, 10) + "...");
  
  const clusters = clusterSignals(rawIngestedSignals);
  console.log(`Discovered ${clusters.length} active signal clusters.`);
  
  const opportunities = [];
  for (const c of clusters) {
    const opp = await analyzeCluster(c, provider, key);
    if (opp) {
      opportunities.push(opp);
    }
  }

  if (opportunities.length > 0) {
    const outputDir = path.join(__dirname, '../src/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'opportunities.json');
    fs.writeFileSync(outputPath, JSON.stringify(opportunities, null, 2), 'utf-8');
    console.log(`\nSUCCESS! Saved ${opportunities.length} opportunities to: ${outputPath}`);
  } else {
    console.log("\nPipeline finished, but zero opportunities were generated successfully.");
  }
}

runIngestionPipeline();
