import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { getAllSeedOpportunities } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'foundersignal.sqlite');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'Founder',
      avatar_url TEXT,
      auth_provider TEXT DEFAULT 'email',
      google_id TEXT,
      has_completed_onboarding INTEGER DEFAULT 0,
      ai_credits_limit INTEGER DEFAULT 5,
      ai_credits_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for existing tables
  try {
    db.exec('ALTER TABLE users ADD COLUMN ai_credits_limit INTEGER DEFAULT 5');
  } catch (e) {}
  try {
    db.exec('ALTER TABLE users ADD COLUMN ai_credits_used INTEGER DEFAULT 0');
  } catch (e) {}

  // 2. User Profiles Table (Onboarding & Preferences)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      founder_role TEXT NOT NULL,
      experience_years TEXT NOT NULL,
      location_city TEXT NOT NULL,
      primary_vertical TEXT NOT NULL,
      knowledge_areas TEXT NOT NULL,
      skills TEXT NOT NULL,
      coding_proficiency TEXT NOT NULL,
      capital_budget TEXT NOT NULL,
      time_commitment TEXT NOT NULL,
      launch_window TEXT NOT NULL,
      funding_ambition TEXT NOT NULL,
      regulatory_appetite TEXT NOT NULL,
      mvp_complexity TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Opportunities Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      problem TEXT NOT NULL,
      target_customer TEXT NOT NULL,
      industry TEXT NOT NULL,
      vertical TEXT NOT NULL,
      score INTEGER NOT NULL,
      demand_score INTEGER NOT NULL,
      hiring_score INTEGER NOT NULL,
      regulation_score INTEGER NOT NULL,
      skills_score INTEGER NOT NULL,
      competition_score INTEGER NOT NULL,
      timing_score INTEGER NOT NULL,
      india_relevance_score INTEGER NOT NULL,
      momentum TEXT DEFAULT 'steady',
      change_percentage INTEGER NOT NULL DEFAULT 0,
      signal_count INTEGER NOT NULL DEFAULT 0,
      source_count INTEGER NOT NULL DEFAULT 0,
      why_interesting TEXT NOT NULL,
      overview TEXT NOT NULL,
      why_matters TEXT NOT NULL,
      demand_analysis TEXT NOT NULL,
      market_gap TEXT NOT NULL,
      mvp_recommendation TEXT NOT NULL,
      monetization_hypothesis TEXT NOT NULL,
      risks_json TEXT NOT NULL DEFAULT '[]',
      india_relevance_text TEXT NOT NULL,
      related_opportunities_json TEXT NOT NULL DEFAULT '[]',
      feeds_json TEXT NOT NULL DEFAULT '{}',
      last_updated TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Signals Timeline Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS signals_timeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value INTEGER NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 5. Hiring Signals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS hiring_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      role TEXT NOT NULL,
      volume TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 6. Skill Signals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS skill_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      skill TEXT NOT NULL,
      scarcity TEXT NOT NULL,
      impact TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 7. Regulatory Signals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS regulatory_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      regulation_name TEXT NOT NULL,
      agency TEXT NOT NULL,
      summary TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 8. Technology Signals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS technology_signals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      tech TEXT NOT NULL,
      adoption_rate TEXT NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 9. Competitors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS competitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      strength TEXT NOT NULL,
      pricing TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 10. Source Health Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS source_health (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL,
      latency TEXT NOT NULL,
      volume INTEGER NOT NULL DEFAULT 0,
      last_run TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Saved Opportunities Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, opportunity_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 12. Idea Validations Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS idea_validations (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      idea_text TEXT NOT NULL,
      validation_score INTEGER NOT NULL,
      scores_json TEXT NOT NULL,
      gaps_json TEXT NOT NULL,
      competitors_json TEXT NOT NULL,
      mvp_build TEXT NOT NULL,
      full_result_json TEXT,
      is_saved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  try {
    db.exec('ALTER TABLE idea_validations ADD COLUMN full_result_json TEXT');
  } catch (e) {}
  try {
    db.exec('ALTER TABLE idea_validations ADD COLUMN is_saved INTEGER DEFAULT 0');
  } catch (e) {}

  // 12b. User Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'glacier',
      email_alerts INTEGER DEFAULT 1,
      weekly_digest INTEGER DEFAULT 1,
      export_format TEXT DEFAULT 'pdf',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 13. Career Profiles Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS career_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE,
      resume_name TEXT NOT NULL,
      parsed_title TEXT NOT NULL,
      parsed_skills_json TEXT NOT NULL,
      demand_score INTEGER NOT NULL,
      baseline_score INTEGER NOT NULL,
      added_skills_json TEXT NOT NULL,
      recommendations_json TEXT NOT NULL,
      adjacent_paths_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 14. Builder Diagnostic Quiz Results Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS builder_quiz_results (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      answers_json TEXT NOT NULL,
      matches_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 15. Admin Activity & Pipeline Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      message TEXT NOT NULL,
      details_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_opp_vertical ON opportunities(vertical);
    CREATE INDEX IF NOT EXISTS idx_opp_score ON opportunities(score);
    CREATE INDEX IF NOT EXISTS idx_signals_timeline_opp ON signals_timeline(opportunity_id);
    CREATE INDEX IF NOT EXISTS idx_hiring_signals_opp ON hiring_signals(opportunity_id);
    CREATE INDEX IF NOT EXISTS idx_saved_opp_user ON saved_opportunities(user_id);
  `);

  seedDatabase();
}

function seedDatabase() {
  const oppCount = db.prepare('SELECT COUNT(*) as count FROM opportunities').get().count;
  if (oppCount >= 5) {
    return; // Already comprehensively seeded
  }

  // Clear partial seeds if needed to ensure complete schema
  if (oppCount > 0 && oppCount < 5) {
    db.prepare('DELETE FROM opportunities').run();
  }

  console.log('Seeding initial opportunities and source health into SQLite database...');

  // Seed Source Health records
  const insertSource = db.prepare(`
    INSERT OR IGNORE INTO source_health (name, status, latency, volume, last_run)
    VALUES (?, ?, ?, ?, ?)
  `);

  const initialSources = [
    { name: 'Reddit Ingestion API (r/IndiaTech, r/developersIndia)', status: 'Healthy', latency: '380ms', volume: 1420, lastRun: '12 mins ago' },
    { name: 'NPCI UPI Registry & Merchant Feeds', status: 'Healthy', latency: '110ms', volume: 480, lastRun: '45 mins ago' },
    { name: 'RBI Regulatory Circular RSS & Gazette Feeds', status: 'Healthy', latency: '90ms', volume: 16, lastRun: '2 hours ago' },
    { name: 'SEBI Circular & Compliance Crawler', status: 'Healthy', latency: '240ms', volume: 8, lastRun: '3 hours ago' },
    { name: 'Naukri / LinkedIn India Jobs Pipeline', status: 'Healthy', latency: '450ms', volume: 3840, lastRun: '20 mins ago' },
    { name: 'GitHub India Trending & Developer Discussions', status: 'Healthy', latency: '210ms', volume: 510, lastRun: '1 hour ago' }
  ];

  for (const src of initialSources) {
    insertSource.run(src.name, src.status, src.latency, src.volume, src.lastRun);
  }

  const rawOpps = getAllSeedOpportunities();

  // Seed opportunities and relational tables
  const insertOpp = db.prepare(`
    INSERT INTO opportunities (
      id, title, problem, target_customer, industry, vertical,
      score, demand_score, hiring_score, regulation_score, skills_score, competition_score, timing_score, india_relevance_score,
      momentum, change_percentage, signal_count, source_count,
      why_interesting, overview, why_matters, demand_analysis, market_gap, mvp_recommendation, monetization_hypothesis,
      risks_json, india_relevance_text, related_opportunities_json, feeds_json, last_updated
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const insertTimeline = db.prepare(`INSERT INTO signals_timeline (opportunity_id, date, value) VALUES (?, ?, ?)`);
  const insertHiring = db.prepare(`INSERT INTO hiring_signals (opportunity_id, role, volume, salary_range, count) VALUES (?, ?, ?, ?, ?)`);
  const insertSkill = db.prepare(`INSERT INTO skill_signals (opportunity_id, skill, scarcity, impact) VALUES (?, ?, ?, ?)`);
  const insertReg = db.prepare(`INSERT INTO regulatory_signals (opportunity_id, regulation_name, agency, summary, date) VALUES (?, ?, ?, ?, ?)`);
  const insertTech = db.prepare(`INSERT INTO technology_signals (opportunity_id, tech, adoption_rate, description) VALUES (?, ?, ?, ?)`);
  const insertComp = db.prepare(`INSERT INTO competitors (opportunity_id, name, category, strength, pricing) VALUES (?, ?, ?, ?, ?)`);

  const seedTransaction = db.transaction((opps) => {
    for (const opp of opps) {
      insertOpp.run(
        opp.id,
        opp.title,
        opp.problem,
        opp.targetCustomer || opp.target_customer || 'Indian Startups & Enterprises',
        opp.industry || 'IT / Software',
        opp.vertical || 'IT',
        opp.score || 85,
        opp.scores?.demand ?? opp.demand_score ?? 85,
        opp.scores?.hiring ?? opp.hiring_score ?? 80,
        opp.scores?.regulation ?? opp.regulation_score ?? 85,
        opp.scores?.skills ?? opp.skills_score ?? 80,
        opp.scores?.competition ?? opp.competition_score ?? 70,
        opp.scores?.timing ?? opp.timing_score ?? 85,
        opp.scores?.indiaRelevance ?? opp.india_relevance_score ?? 90,
        opp.momentum || 'rising',
        opp.changePercentage ?? opp.change_percentage ?? 25,
        opp.signalCount ?? opp.signal_count ?? 12,
        opp.sourceCount ?? opp.source_count ?? 4,
        opp.whyInteresting || opp.why_interesting || '',
        opp.overview || '',
        opp.whyMatters || opp.why_matters || '',
        opp.demandAnalysis || opp.demand_analysis || '',
        opp.marketGap || opp.market_gap || '',
        opp.mvpRecommendation || opp.mvp_recommendation || '',
        opp.monetizationHypothesis || opp.monetization_hypothesis || '',
        JSON.stringify(opp.risks || []),
        opp.indiaRelevanceText || opp.india_relevance_text || '',
        JSON.stringify(opp.relatedOpportunities || opp.related_opportunities || []),
        JSON.stringify(opp.feeds || {}),
        opp.lastUpdated || opp.last_updated || 'August 2026'
      );

      if (Array.isArray(opp.signalsTimeline)) {
        for (const t of opp.signalsTimeline) {
          insertTimeline.run(opp.id, t.date, t.value);
        }
      }

      if (Array.isArray(opp.hiringSignals)) {
        for (const h of opp.hiringSignals) {
          insertHiring.run(opp.id, h.role, h.volume, h.salaryRange, h.count);
        }
      }

      if (Array.isArray(opp.skillSignals)) {
        for (const s of opp.skillSignals) {
          insertSkill.run(opp.id, s.skill, s.scarcity, s.impact);
        }
      }

      if (Array.isArray(opp.regulatorySignals)) {
        for (const r of opp.regulatorySignals) {
          insertReg.run(opp.id, r.regulationName, r.agency, r.summary, r.date);
        }
      }

      if (Array.isArray(opp.technologySignals)) {
        for (const te of opp.technologySignals) {
          insertTech.run(opp.id, te.tech, te.adoptionRate, te.description);
        }
      }

      if (Array.isArray(opp.competitionList)) {
        for (const c of opp.competitionList) {
          insertComp.run(opp.id, c.name, c.category, c.strength, c.pricing);
        }
      }
    }
  });

  if (rawOpps.length > 0) {
    seedTransaction(rawOpps);
  }

  // Seed default admin log
  db.prepare(`
    INSERT INTO admin_logs (event_type, message, details_json)
    VALUES (?, ?, ?)
  `).run('SYSTEM_INIT', 'FounderSignal production SQLite database initialized and seeded successfully.', JSON.stringify({ opportunityCount: rawOpps.length }));

  console.log(`Database seeded with ${rawOpps.length} opportunities.`);
}

export default db;
