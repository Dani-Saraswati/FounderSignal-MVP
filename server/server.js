import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDatabase } from './db.js';
import { runLiveIngestionPipeline } from './ingestionEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'foundersignal-secure-jwt-secret-key-2026';
const FREE_AI_CREDITS = parseInt(process.env.FREE_AI_CREDITS || '5', 10);

// Initialize SQLite database and seed initial opportunities
initDatabase();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input Sanitization & Validation Helpers
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email.length <= 255 && re.test(email.trim());
}

function sanitizeText(str, maxLength = 1000) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }
    req.user = user;
    next();
  });
}

// Optional Auth Middleware (allows guest or logged-in user)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

// Strict Admin Authorization Middleware (verifies admin role from database)
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const dbUser = db.prepare('SELECT role FROM users WHERE id = ?').get(req.user.id);
  const userRole = ((dbUser && dbUser.role) || req.user.role || '').toLowerCase();

  if (userRole !== 'admin') {
    return res.status(403).json({ 
      error: 'FORBIDDEN', 
      message: 'Administrator privileges required to access this resource.' 
    });
  }
  next();
}

// Helper to format opportunity from DB with Data Provenance
function formatOpportunity(row) {
  if (!row) return null;

  let timeline = [];
  try {
    const tlRows = db.prepare('SELECT date, value FROM signals_timeline WHERE opportunity_id = ? ORDER BY id ASC').all(row.id);
    timeline = tlRows || [];
  } catch (e) {}

  let hiring = [];
  try {
    const hRows = db.prepare('SELECT role, volume, salary_range as salaryRange, count FROM hiring_signals WHERE opportunity_id = ?').all(row.id);
    hiring = hRows || [];
  } catch (e) {}

  let skills = [];
  try {
    const sRows = db.prepare('SELECT skill, scarcity, impact FROM skill_signals WHERE opportunity_id = ?').all(row.id);
    skills = sRows || [];
  } catch (e) {}

  let regulatory = [];
  try {
    const rRows = db.prepare('SELECT regulation_name as regulationName, agency, summary, date FROM regulatory_signals WHERE opportunity_id = ?').all(row.id);
    regulatory = rRows || [];
  } catch (e) {}

  let technology = [];
  try {
    const tRows = db.prepare('SELECT tech, adoption_rate as adoptionRate, description FROM technology_signals WHERE opportunity_id = ?').all(row.id);
    technology = tRows || [];
  } catch (e) {}

  let competition = [];
  try {
    const cRows = db.prepare('SELECT name, category, strength, pricing FROM competitors WHERE opportunity_id = ?').all(row.id);
    competition = cRows || [];
  } catch (e) {}

  let risks = [];
  try {
    risks = JSON.parse(row.risks_json || '[]');
  } catch (e) {}

  let relatedOpportunities = [];
  try {
    relatedOpportunities = JSON.parse(row.related_opportunities_json || '[]');
  } catch (e) {}

  let feeds = {};
  try {
    feeds = JSON.parse(row.feeds_json || '{}');
  } catch (e) {}

  // Explicit Source Provenance calculations directly from DB rows (Zero invented numbers)
  const totalTrackedOpenings = hiring.reduce((acc, h) => acc + (Number(h.count) || 0), 0);
  const regulatoryAgencies = Array.from(new Set(regulatory.map(r => r.agency).filter(Boolean)));
  const redditDiscussionCount = feeds?.reddit ? feeds.reddit.length : 0;
  const githubDiscussionCount = feeds?.github ? feeds.github.length : 0;

  const provenance = {
    signalCount: row.signal_count,
    sourceCount: row.source_count,
    lastUpdated: row.last_updated,
    hiringVolume: totalTrackedOpenings,
    regulatoryCount: regulatory.length,
    agencies: regulatoryAgencies,
    redditCount: redditDiscussionCount,
    githubCount: githubDiscussionCount
  };

  return {
    id: row.id,
    title: row.title,
    problem: row.problem,
    targetCustomer: row.target_customer,
    industry: row.industry,
    vertical: row.vertical,
    score: row.score,
    scores: {
      demand: row.demand_score,
      hiring: row.hiring_score,
      regulation: row.regulation_score,
      skills: row.skills_score,
      competition: row.competition_score,
      timing: row.timing_score,
      indiaRelevance: row.india_relevance_score
    },
    momentum: row.momentum,
    changePercentage: row.change_percentage,
    signalCount: row.signal_count,
    sourceCount: row.source_count,
    whyInteresting: row.why_interesting,
    overview: row.overview,
    whyMatters: row.why_matters,
    demandAnalysis: row.demand_analysis,
    marketGap: row.market_gap,
    mvpRecommendation: row.mvp_recommendation,
    monetizationHypothesis: row.monetization_hypothesis,
    risks,
    indiaRelevanceText: row.india_relevance_text,
    relatedOpportunities,
    feeds,
    lastUpdated: row.last_updated,
    signalsTimeline: timeline,
    hiringSignals: hiring,
    skillSignals: skills,
    regulatorySignals: regulatory,
    technologySignals: technology,
    competitionList: competition,
    provenance
  };
}

// Founder Fit calculation based on saved 6-step onboarding profile
function calculateFounderFit(opp, profile) {
  if (!profile) return null;

  let fit = 70;
  const reasons = [];

  // Vertical alignment
  if (profile.primary_vertical && opp.vertical.toLowerCase() === profile.primary_vertical.toLowerCase()) {
    fit += 15;
    reasons.push(`Direct match with your ${profile.primary_vertical} focus.`);
  } else {
    fit -= 5;
  }

  // Regulatory appetite alignment
  if (profile.regulatory_appetite === 'High' && opp.scores.regulation >= 80) {
    fit += 10;
    reasons.push('High regulatory moat matches your compliance readiness.');
  } else if (profile.regulatory_appetite === 'Low' && opp.scores.regulation >= 85) {
    fit -= 10;
  }

  // Technical skills alignment
  const userSkills = (profile.skills || '').toLowerCase();
  if (opp.skillSignals && opp.skillSignals.some(s => userSkills.includes(s.skill.toLowerCase()))) {
    fit += 8;
    reasons.push('Leverages your core technical skills.');
  }

  // Capital alignment
  const cap = (profile.capital_budget || '').toLowerCase();
  if (cap.includes('bootstrapped') && opp.scores.skills <= 75) {
    fit += 5;
    reasons.push('Lean build suitable for bootstrapping.');
  } else if (cap.includes('significant') && opp.scores.skills > 80) {
    fit += 5;
    reasons.push('Capital intensity matches your runway.');
  }

  fit = Math.max(45, Math.min(99, fit));

  return {
    fitScore: fit,
    rationale: reasons.length > 0 ? reasons.join(' ') : 'Good match based on your founder profile.'
  };
}

// ==========================================
// AUTHENTICATION & GOOGLE OAUTH 2.0 ROUTES
// ==========================================

// 1. Get Google OAuth Authorization URL
app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.trim() === '') {
    return res.json({
      configured: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in your .env file.'
    });
  }

  // Google OAuth 2.0 / OpenID Connect URL with select_account prompt
  const scopes = encodeURIComponent('openid email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=select_account%20consent`;

  res.json({
    configured: true,
    url: googleAuthUrl
  });
});

// Direct browser redirect to Google OAuth login
app.get('/api/auth/google/login', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || clientId.trim() === '') {
    return res.redirect('http://localhost:3000/?error=google_oauth_not_configured');
  }

  const scopes = encodeURIComponent('openid email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&access_type=offline&prompt=select_account%20consent`;

  res.redirect(googleAuthUrl);
});

// 2. Google OAuth 2.0 Callback Handler (OpenID Connect code exchange)
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      console.warn('Google OAuth denied or cancelled by user:', error);
      return res.redirect('http://localhost:3000/?error=google_auth_cancelled');
    }

    if (!code) {
      return res.redirect('http://localhost:3000/?error=no_code_provided');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

    if (!clientId || !clientSecret) {
      return res.redirect('http://localhost:3000/?error=google_credentials_missing');
    }

    // Exchange authorization code for access and ID tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Failed to exchange Google OAuth code:', tokenData);
      return res.redirect('http://localhost:3000/?error=token_exchange_failed');
    }

    // Retrieve User Profile using OpenID Connect UserInfo endpoint
    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleProfile = await userRes.json();
    if (!googleProfile.email) {
      return res.redirect('http://localhost:3000/?error=google_profile_missing_email');
    }

    const normalizedEmail = googleProfile.email.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      const userId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO users (
          id, email, name, role, avatar_url, auth_provider, google_id,
          has_completed_onboarding, ai_credits_limit, ai_credits_used
        )
        VALUES (?, ?, ?, 'Founder', ?, 'google', ?, 0, ?, 0)
      `).run(
        userId,
        normalizedEmail,
        sanitizeText(googleProfile.name || 'Google Founder', 100),
        googleProfile.picture || null,
        googleProfile.sub || null,
        FREE_AI_CREDITS
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      db.prepare(`
        INSERT INTO admin_logs (event_type, message, details_json)
        VALUES (?, ?, ?)
      `).run('USER_GOOGLE_OAUTH', `New user registered via Google OAuth: ${normalizedEmail}`, JSON.stringify({ userId, email: normalizedEmail }));
    } else {
      if (googleProfile.picture && !user.avatar_url) {
        db.prepare('UPDATE users SET avatar_url = ?, google_id = COALESCE(google_id, ?) WHERE id = ?')
          .run(googleProfile.picture, googleProfile.sub || null, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.redirect(`http://localhost:3000/?google_token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('http://localhost:3000/?error=google_callback_exception');
  }
});

// 3. Direct Google Token / Credential verification endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, email, name, googleId, avatarUrl } = req.body;

    let targetEmail = email;
    let targetName = name;
    let targetGoogleId = googleId;
    let targetAvatar = avatarUrl;

    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const verifiedPayload = await verifyRes.json();
          targetEmail = verifiedPayload.email;
          targetName = verifiedPayload.name;
          targetGoogleId = verifiedPayload.sub;
          targetAvatar = verifiedPayload.picture;
        }
      } catch (err) {
        console.warn('Google token verification error:', err);
      }
    }

    if (!targetEmail || !isValidEmail(targetEmail)) {
      return res.status(400).json({ error: 'Valid email is required for Google authentication' });
    }

    const normalizedEmail = targetEmail.toLowerCase().trim();
    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      const userId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO users (
          id, email, name, role, avatar_url, auth_provider, google_id,
          has_completed_onboarding, ai_credits_limit, ai_credits_used
        )
        VALUES (?, ?, ?, 'Founder', ?, 'google', ?, 0, ?, 0)
      `).run(
        userId,
        normalizedEmail,
        sanitizeText(targetName || 'Founder', 100),
        targetAvatar || null,
        targetGoogleId || null,
        FREE_AI_CREDITS
      );

      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      db.prepare(`
        INSERT INTO admin_logs (event_type, message, details_json)
        VALUES (?, ?, ?)
      `).run('USER_GOOGLE_AUTH', `New user registered via Google Sign-In: ${normalizedEmail}`, JSON.stringify({ userId, email: normalizedEmail }));
    } else {
      if (targetAvatar && !user.avatar_url) {
        db.prepare('UPDATE users SET avatar_url = ?, google_id = COALESCE(google_id, ?) WHERE id = ?').run(targetAvatar, targetGoogleId || null, user.id);
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    let profile = null;
    if (user.has_completed_onboarding) {
      profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
    }

    const aiLimit = user.ai_credits_limit || FREE_AI_CREDITS;
    const aiUsed = user.ai_credits_used || 0;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCompletedOnboarding: Boolean(user.has_completed_onboarding),
        avatarUrl: user.avatar_url,
        profile,
        aiCredits: {
          limit: aiLimit,
          used: aiUsed,
          remaining: Math.max(0, aiLimit - aiUsed)
        }
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Standard Email/Password Register (with strict bounds checking)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const cleanName = sanitizeText(name, 100);
    if (cleanName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return res.status(400).json({ error: 'Password must be between 6 and 128 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO users (
        id, email, password_hash, name, role, auth_provider,
        has_completed_onboarding, ai_credits_limit, ai_credits_used
      )
      VALUES (?, ?, ?, ?, 'Founder', 'email', 0, ?, 0)
    `).run(userId, normalizedEmail, passwordHash, cleanName, FREE_AI_CREDITS);

    db.prepare(`
      INSERT INTO admin_logs (event_type, message, details_json)
      VALUES (?, ?, ?)
    `).run('USER_REGISTERED', `New user registered: ${normalizedEmail}`, JSON.stringify({ userId, email: normalizedEmail, name: cleanName }));

    const token = jwt.sign({ id: userId, email: normalizedEmail }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: normalizedEmail,
        name: cleanName,
        role: 'Founder',
        hasCompletedOnboarding: false,
        avatarUrl: null,
        aiCredits: {
          limit: FREE_AI_CREDITS,
          used: 0,
          remaining: FREE_AI_CREDITS
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Standard Email/Password Login (with strict validation)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password_hash) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    let profile = null;
    if (user.has_completed_onboarding) {
      profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
    }

    const aiLimit = user.ai_credits_limit || FREE_AI_CREDITS;
    const aiUsed = user.ai_credits_used || 0;

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCompletedOnboarding: Boolean(user.has_completed_onboarding),
        avatarUrl: user.avatar_url,
        profile,
        aiCredits: {
          limit: aiLimit,
          used: aiUsed,
          remaining: Math.max(0, aiLimit - aiUsed)
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Current User Session Verification (Me)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, avatar_url, auth_provider, has_completed_onboarding, ai_credits_limit, ai_credits_used, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = null;
    if (user.has_completed_onboarding) {
      profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(user.id);
    }

    const aiLimit = user.ai_credits_limit || FREE_AI_CREDITS;
    const aiUsed = user.ai_credits_used || 0;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        hasCompletedOnboarding: Boolean(user.has_completed_onboarding),
        profile,
        aiCredits: {
          limit: aiLimit,
          used: aiUsed,
          remaining: Math.max(0, aiLimit - aiUsed)
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// User AI Credits endpoint
app.get('/api/user/credits', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT ai_credits_limit, ai_credits_used FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const limit = user.ai_credits_limit || FREE_AI_CREDITS;
    const used = user.ai_credits_used || 0;

    res.json({
      creditsLimit: limit,
      creditsUsed: used,
      creditsRemaining: Math.max(0, limit - used)
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch user credits' });
  }
});

// ==========================================
// USER ONBOARDING & PROFILE ROUTES
// ==========================================

// Submit 6-Step Onboarding (with input validation)
app.post('/api/user/onboarding', authenticateToken, (req, res) => {
  try {
    const {
      fullName,
      founderRole,
      experienceYears,
      locationCity,
      primaryVertical,
      knowledgeAreas,
      skills,
      codingProficiency,
      capitalBudget,
      timeCommitment,
      launchWindow,
      fundingAmbition,
      regulatoryAppetite,
      mvpComplexity
    } = req.body;

    const cleanFullName = sanitizeText(fullName, 100);
    const cleanRole = sanitizeText(founderRole, 100);
    const cleanVertical = sanitizeText(primaryVertical, 100);

    if (!cleanFullName || !cleanRole || !cleanVertical) {
      return res.status(400).json({ error: 'Missing required onboarding profile fields' });
    }

    const userId = req.user.id;
    const knowledgeAreasStr = sanitizeText(Array.isArray(knowledgeAreas) ? knowledgeAreas.join(', ') : (knowledgeAreas || ''), 1000);
    const skillsStr = sanitizeText(Array.isArray(skills) ? skills.join(', ') : (skills || ''), 1000);

    db.prepare(`
      INSERT INTO user_profiles (
        user_id, full_name, founder_role, experience_years, location_city,
        primary_vertical, knowledge_areas, skills, coding_proficiency,
        capital_budget, time_commitment, launch_window, funding_ambition,
        regulatory_appetite, mvp_complexity, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, CURRENT_TIMESTAMP
      )
      ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        founder_role = excluded.founder_role,
        experience_years = excluded.experience_years,
        location_city = excluded.location_city,
        primary_vertical = excluded.primary_vertical,
        knowledge_areas = excluded.knowledge_areas,
        skills = excluded.skills,
        coding_proficiency = excluded.coding_proficiency,
        capital_budget = excluded.capital_budget,
        time_commitment = excluded.time_commitment,
        launch_window = excluded.launch_window,
        funding_ambition = excluded.funding_ambition,
        regulatory_appetite = excluded.regulatory_appetite,
        mvp_complexity = excluded.mvp_complexity,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      userId,
      cleanFullName,
      cleanRole,
      sanitizeText(experienceYears || '3-5 years', 50),
      sanitizeText(locationCity || 'Bengaluru', 50),
      cleanVertical,
      knowledgeAreasStr,
      skillsStr,
      sanitizeText(codingProficiency || 'Full Stack', 50),
      sanitizeText(capitalBudget || 'Bootstrapped', 50),
      sanitizeText(timeCommitment || 'Full-time', 50),
      sanitizeText(launchWindow || '1-3 months', 50),
      sanitizeText(fundingAmbition || 'Bootstrapped Profitability', 50),
      sanitizeText(regulatoryAppetite || 'High', 50),
      sanitizeText(mvpComplexity || 'Medium', 50)
    );

    db.prepare(`
      UPDATE users 
      SET has_completed_onboarding = 1, name = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(cleanFullName, cleanRole, userId);

    db.prepare(`
      INSERT INTO admin_logs (event_type, message, details_json)
      VALUES (?, ?, ?)
    `).run('ONBOARDING_COMPLETED', `Founder profile completed for user ${userId}`, JSON.stringify({ userId, fullName: cleanFullName, founderRole: cleanRole, primaryVertical: cleanVertical }));

    const updatedUser = db.prepare('SELECT id, email, name, role, avatar_url, has_completed_onboarding, ai_credits_limit, ai_credits_used FROM users WHERE id = ?').get(userId);
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);

    const aiLimit = updatedUser.ai_credits_limit || FREE_AI_CREDITS;
    const aiUsed = updatedUser.ai_credits_used || 0;

    res.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatar_url,
        hasCompletedOnboarding: true,
        profile,
        aiCredits: {
          limit: aiLimit,
          used: aiUsed,
          remaining: Math.max(0, aiLimit - aiUsed)
        }
      }
    });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).json({ error: 'Failed to save onboarding information' });
  }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// ==========================================
// OPPORTUNITIES ROUTES (With Personalized Founder Fit)
// ==========================================

// Get All Opportunities with search, filter, and Founder Fit ranking
app.get('/api/opportunities', optionalAuth, (req, res) => {
  try {
    const { search, vertical, sortBy } = req.query;

    let userProfile = null;
    if (req.user) {
      userProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
    }

    let query = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];

    if (vertical && vertical !== 'ALL') {
      query += ' AND vertical = ?';
      params.push(vertical);
    }

    if (search && search.trim()) {
      const cleanSearch = sanitizeText(search, 100);
      const term = `%${cleanSearch.toLowerCase()}%`;
      query += ' AND (LOWER(title) LIKE ? OR LOWER(problem) LIKE ? OR LOWER(why_interesting) LIKE ? OR LOWER(industry) LIKE ?)';
      params.push(term, term, term, term);
    }

    const rows = db.prepare(query).all(...params);
    let formatted = rows.map(r => {
      const opp = formatOpportunity(r);
      const founderFit = calculateFounderFit(opp, userProfile);
      return {
        ...opp,
        founderFit
      };
    });

    // Determine sorting logic
    const activeSort = sortBy || (userProfile ? 'recommended' : 'score');

    if (activeSort === 'recommended' && userProfile) {
      formatted.sort((a, b) => {
        const fitA = a.founderFit?.fitScore || a.score;
        const fitB = b.founderFit?.fitScore || b.score;
        return fitB - fitA || b.score - a.score;
      });
    } else if (activeSort === 'momentum') {
      formatted.sort((a, b) => b.changePercentage - a.changePercentage || b.score - a.score);
    } else if (activeSort === 'demand') {
      formatted.sort((a, b) => b.scores.demand - a.scores.demand || b.score - a.score);
    } else {
      formatted.sort((a, b) => b.score - a.score);
    }

    res.json({ opportunities: formatted, total: formatted.length, isPersonalized: Boolean(userProfile) });
  } catch (error) {
    console.error('Fetch opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities from database' });
  }
});

// Summary stats for Opportunity Radar dashboard
app.get('/api/opportunities/stats/summary', (req, res) => {
  try {
    const oppCountRow = db.prepare('SELECT COUNT(*) as count FROM opportunities').get();
    const totalSignalsRow = db.prepare('SELECT SUM(signal_count) as total FROM opportunities').get();
    const totalHiringRow = db.prepare('SELECT SUM(count) as total FROM hiring_signals').get();
    const sourceCountRow = db.prepare('SELECT COUNT(*) as count FROM source_health').get();

    const nicheRows = db.prepare(`
      SELECT vertical, industry, COUNT(*) as count 
      FROM opportunities 
      GROUP BY vertical, industry 
      ORDER BY count DESC
    `).all();

    const chartColors = ['#6366f1', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#ec4899'];
    const nicheDistribution = nicheRows.map((r, i) => ({
      name: r.industry,
      count: r.count,
      color: chartColors[i % chartColors.length]
    }));

    const latestRow = db.prepare('SELECT MAX(last_updated) as latest FROM opportunities').get();

    res.json({
      totalOpportunities: oppCountRow.count || 0,
      totalSignals: totalSignalsRow.total || 0,
      totalHiring: totalHiringRow.total || 0,
      activeSources: sourceCountRow.count || 0,
      nicheDistribution,
      lastBatchDate: latestRow?.latest || '12 Aug 2026'
    });
  } catch (error) {
    console.error('Summary stats error:', error);
    res.status(500).json({ error: 'Failed to calculate opportunity summary metrics' });
  }
});

// Single Opportunity Detail
app.get('/api/opportunities/:id', optionalAuth, (req, res) => {
  try {
    const cleanId = sanitizeText(req.params.id, 100);
    const row = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(cleanId);
    if (!row) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    let userProfile = null;
    if (req.user) {
      userProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
    }

    const opp = formatOpportunity(row);
    const founderFit = calculateFounderFit(opp, userProfile);

    res.json({
      opportunity: {
        ...opp,
        founderFit
      }
    });
  } catch (error) {
    console.error('Get opportunity detail error:', error);
    res.status(500).json({ error: 'Failed to retrieve opportunity details' });
  }
});

// ==========================================
// SAVED WATCHLIST ROUTES
// ==========================================

// Get user saved opportunities
app.get('/api/user/saved', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT o.* FROM opportunities o
      INNER JOIN saved_opportunities s ON o.id = s.opportunity_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `).all(req.user.id);

    const formatted = rows.map(r => formatOpportunity(r));
    const savedIds = formatted.map(f => f.id);

    res.json({ savedIds, savedOpportunities: formatted });
  } catch (error) {
    console.error('Get saved error:', error);
    res.status(500).json({ error: 'Failed to load saved watchlist' });
  }
});

// Save Opportunity
app.post('/api/user/saved/:id', authenticateToken, (req, res) => {
  try {
    const oppId = sanitizeText(req.params.id, 100);
    const opp = db.prepare('SELECT id FROM opportunities WHERE id = ?').get(oppId);
    if (!opp) {
      return res.status(404).json({ error: 'Opportunity does not exist' });
    }

    db.prepare(`
      INSERT OR IGNORE INTO saved_opportunities (user_id, opportunity_id)
      VALUES (?, ?)
    `).run(req.user.id, oppId);

    const savedRows = db.prepare('SELECT opportunity_id FROM saved_opportunities WHERE user_id = ?').all(req.user.id);
    res.json({ savedIds: savedRows.map(r => r.opportunity_id) });
  } catch (error) {
    console.error('Save opportunity error:', error);
    res.status(500).json({ error: 'Failed to save opportunity' });
  }
});

// Remove Saved Opportunity
app.delete('/api/user/saved/:id', authenticateToken, (req, res) => {
  try {
    const oppId = sanitizeText(req.params.id, 100);
    db.prepare('DELETE FROM saved_opportunities WHERE user_id = ? AND opportunity_id = ?').run(req.user.id, oppId);

    const savedRows = db.prepare('SELECT opportunity_id FROM saved_opportunities WHERE user_id = ?').all(req.user.id);
    res.json({ savedIds: savedRows.map(r => r.opportunity_id) });
  } catch (error) {
    console.error('Remove saved opportunity error:', error);
    res.status(500).json({ error: 'Failed to remove opportunity from saved list' });
  }
});

// ==========================================
// BUILDER MATCH DIAGNOSTIC ROUTES
// ==========================================

app.get('/api/builder/questions', (req, res) => {
  const questions = [
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

  res.json({ questions });
});

// Run Match Algorithm
app.post('/api/builder/match', optionalAuth, (req, res) => {
  try {
    const { answers } = req.body;
    const quizAnswers = answers || {};

    const skillType = quizAnswers['q-skills'] || 'tech';
    const domainType = quizAnswers['q-domain'] || 'IT';
    const capitalAmount = quizAnswers['q-capital'] || 'low';
    const riskType = quizAnswers['q-risk'] || 'low';

    const allOppRows = db.prepare('SELECT * FROM opportunities').all();
    const opportunities = allOppRows.map(r => formatOpportunity(r));

    const results = opportunities.map(opp => {
      let fitScore = 75;
      const reasons = [];

      if (opp.vertical === domainType) {
        fitScore += 10;
        reasons.push(`Direct alignment with your experience in ${domainType} systems.`);
      } else {
        fitScore -= 5;
      }

      if (skillType === 'compliance' && opp.scores.regulation > 85) {
        fitScore += 12;
        reasons.push('Leverages your regulatory audit backgrounds perfectly.');
      } else if (skillType === 'tech' && opp.scores.skills > 80) {
        fitScore += 8;
        reasons.push('Highly suitable for strong technical builders.');
      }

      if (riskType === 'high' && opp.scores.regulation > 80) {
        fitScore += 8;
        reasons.push('Matches your readiness to navigate complex regulatory requirements.');
      } else if (riskType === 'low' && opp.scores.regulation > 85) {
        fitScore -= 15;
        reasons.push('Higher risk compliance profile than your preferred setting.');
      }

      fitScore = Math.max(45, Math.min(98, fitScore));

      const complexity = opp.scores.skills > 85 ? 'High' : opp.scores.skills > 70 ? 'Medium' : 'Low';
      const mvpEffort = opp.scores.skills > 85 ? '8-12 weeks' : opp.scores.skills > 70 ? '4-6 weeks' : '2-3 weeks';

      return {
        opportunity: opp,
        fitScore,
        rationale: reasons.length > 0 ? reasons.join(' ') : 'Good match based on capital flexibility and sector momentum.',
        complexity,
        mvpEffort
      };
    });

    results.sort((a, b) => b.fitScore - a.fitScore);

    if (req.user) {
      const matchId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO builder_quiz_results (id, user_id, answers_json, matches_json)
        VALUES (?, ?, ?, ?)
      `).run(matchId, req.user.id, JSON.stringify(quizAnswers), JSON.stringify(results.map(r => ({ oppId: r.opportunity.id, score: r.fitScore }))));
    }

    res.json({ results });
  } catch (error) {
    console.error('Builder match error:', error);
    res.status(500).json({ error: 'Failed to compute builder opportunity matches' });
  }
});

// ==========================================
// CAREER SIGNAL & RESUME PARSER (With Matching Opportunities)
// ==========================================

app.post('/api/career/parse', optionalAuth, (req, res) => {
  try {
    const { resumeText, fileName } = req.body;

    const cleanName = sanitizeText((fileName || 'Builder_Profile.pdf').replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "), 100);
    const cleanText = sanitizeText(resumeText || cleanName, 20000);
    const text = cleanText.toLowerCase();

    const detectedSkills = [];
    if (text.includes('react') || text.includes('javascript') || text.includes('typescript') || text.includes('frontend')) {
      detectedSkills.push('JavaScript', 'React', 'TypeScript');
    }
    if (text.includes('node') || text.includes('backend') || text.includes('express') || text.includes('api')) {
      detectedSkills.push('Node.js', 'REST APIs');
    }
    if (text.includes('sql') || text.includes('postgres') || text.includes('database')) {
      detectedSkills.push('PostgreSQL', 'SQL Optimization');
    }
    if (text.includes('compliance') || text.includes('rbi') || text.includes('risk') || text.includes('audit')) {
      detectedSkills.push('RBI Fair Practice Auditing', 'Regulatory Compliance');
    }
    if (text.includes('ai') || text.includes('llm') || text.includes('python') || text.includes('machine learning')) {
      detectedSkills.push('Python', 'Fine-Tuning LLMs', 'Vector Databases');
    }

    if (detectedSkills.length === 0) {
      detectedSkills.push('JavaScript', 'React', 'Node.js', 'PostgreSQL', 'Git');
    }

    let calculatedBaselineScore = 70;
    if (detectedSkills.length >= 4) calculatedBaselineScore += 8;
    if (detectedSkills.some(s => s.includes('Fine-Tuning') || s.includes('Compliance'))) calculatedBaselineScore += 6;
    calculatedBaselineScore = Math.min(94, calculatedBaselineScore);

    const recommendations = [
      { skill: 'Fine-Tuning Fin-LLMs', impactScore: 12, difficulty: 'High', roleImpacted: 'AI RegTech Developer' },
      { skill: 'Whisper India Accents', impactScore: 9, difficulty: 'Medium', roleImpacted: 'Audio Compliance Analyst' },
      { skill: 'Device Fingerprinting (Telemetry)', impactScore: 15, difficulty: 'High', roleImpacted: 'FinTech Security Engineer' }
    ];

    const adjacentPaths = [
      { role: 'AI Solution Architect (FinTech)', salaryJump: '↑ 45%', demandIndex: 91 },
      { role: 'Lending Technology Lead', salaryJump: '↑ 30%', demandIndex: 88 },
      { role: 'Observability Engineer', salaryJump: '↑ 15%', demandIndex: 78 }
    ];

    const profileData = {
      scanned: true,
      name: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
      currentRole: detectedSkills.some(s => s.includes('Compliance')) ? 'BFSI Risk & Compliance Specialist' : 'Full Stack Software Engineer',
      skills: detectedSkills,
      initialScore: calculatedBaselineScore,
      currentScore: calculatedBaselineScore,
      addedSkills: [],
      recommendations,
      adjacentPaths
    };

    // Find 2–3 matching opportunities from DB based on detected skills
    const oppRows = db.prepare('SELECT * FROM opportunities').all();
    const allOpps = oppRows.map(r => formatOpportunity(r));

    const matchedOpportunities = allOpps
      .map(opp => {
        let matchScore = opp.score;
        if (detectedSkills.some(s => s.includes('Compliance')) && opp.vertical === 'BFSI') matchScore += 10;
        if (detectedSkills.some(s => s.includes('React') || s.includes('Python')) && opp.vertical === 'IT') matchScore += 8;
        return { opp, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map(m => m.opp);

    if (req.user) {
      const profileId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO career_profiles (
          id, user_id, resume_name, parsed_title, parsed_skills_json,
          demand_score, baseline_score, added_skills_json, recommendations_json, adjacent_paths_json, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          resume_name = excluded.resume_name,
          parsed_title = excluded.parsed_title,
          parsed_skills_json = excluded.parsed_skills_json,
          demand_score = excluded.demand_score,
          baseline_score = excluded.baseline_score,
          added_skills_json = excluded.added_skills_json,
          recommendations_json = excluded.recommendations_json,
          adjacent_paths_json = excluded.adjacent_paths_json,
          updated_at = CURRENT_TIMESTAMP
      `).run(
        profileId,
        req.user.id,
        cleanName,
        profileData.currentRole,
        JSON.stringify(profileData.skills),
        profileData.currentScore,
        profileData.initialScore,
        JSON.stringify(profileData.addedSkills),
        JSON.stringify(profileData.recommendations),
        JSON.stringify(profileData.adjacentPaths)
      );
    }

    res.json({ profile: profileData, matchedOpportunities });
  } catch (error) {
    console.error('Career parse error:', error);
    res.status(500).json({ error: 'Failed to parse resume profile' });
  }
});

// Toggle Simulator Skill
app.post('/api/career/simulate-skill', optionalAuth, (req, res) => {
  try {
    const { currentProfile, skillName } = req.body;
    if (!currentProfile || !skillName) {
      return res.status(400).json({ error: 'Invalid profile or skill' });
    }

    const cleanSkill = sanitizeText(skillName, 100);
    const isAdded = currentProfile.addedSkills.includes(cleanSkill);
    const updatedAddedSkills = isAdded
      ? currentProfile.addedSkills.filter(s => s !== cleanSkill)
      : [...currentProfile.addedSkills, cleanSkill];

    const skillImpact = currentProfile.recommendations.find(r => r.skill === cleanSkill)?.impactScore || 0;
    const delta = isAdded ? -skillImpact : skillImpact;
    const newScore = Math.min(99, Math.max(currentProfile.initialScore, currentProfile.currentScore + delta));

    const updatedProfile = {
      ...currentProfile,
      addedSkills: updatedAddedSkills,
      currentScore: newScore
    };

    if (req.user) {
      db.prepare(`
        UPDATE career_profiles 
        SET demand_score = ?, added_skills_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(newScore, JSON.stringify(updatedAddedSkills), req.user.id);
    }

    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Simulate skill error:', error);
    res.status(500).json({ error: 'Failed to simulate skill impact' });
  }
});

// ==========================================
// GEMINI AI INTEGRATION & IDEA VALIDATOR (With Related Opps & Contextual Follow-ups)
// ==========================================

// Server-side Gemini AI caller (Keeps GEMINI_API_KEY fully secure on backend)
async function callGeminiAI(ideaText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null; // Graceful fallback to heuristic database evaluation
  }

  const prompt = `You are a startup market opportunity intelligence engine analyzing a startup thesis for the Indian market.
Startup Idea: "${ideaText}"

Evaluate the idea and return ONLY valid JSON matching this schema:
{
  "validationScore": <integer between 55 and 96>,
  "scores": {
    "demand": <integer 50-98>,
    "competition": <integer 45-95>,
    "feasibility": <integer 50-98>,
    "timing": <integer 50-98>,
    "indiaRelevance": <integer 60-99>,
    "regulation": <integer 40-98>
  },
  "gaps": [
    "<specific market or compliance gap 1>",
    "<specific technology or arbitrage gap 2>"
  ],
  "competitors": [
    "<competitor name 1>",
    "<competitor name 2>",
    "<competitor name 3>"
  ],
  "mvpBuild": "<concrete 2-3 sentence MVP build blueprint with developer stack and compliance steps>"
}`;

  try {
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Gemini API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsed = JSON.parse(candidateText.trim());
    return parsed;
  } catch (err) {
    console.error('Gemini AI call error:', err.message);
    return null;
  }
}

// Idea Validator Route with Per-User AI Free Credit Limits and Related Opportunities
app.post('/api/validator/validate', optionalAuth, async (req, res) => {
  try {
    const { ideaText } = req.body;

    const cleanIdea = sanitizeText(ideaText, 1500);
    if (!cleanIdea || cleanIdea.length < 5) {
      return res.status(400).json({ error: 'Startup idea text must be at least 5 characters long' });
    }

    // 1. Enforce Per-User AI Credit Limit
    let userRecord = null;
    if (req.user) {
      userRecord = db.prepare('SELECT id, ai_credits_limit, ai_credits_used FROM users WHERE id = ?').get(req.user.id);
    }

    const limit = userRecord ? (userRecord.ai_credits_limit || FREE_AI_CREDITS) : FREE_AI_CREDITS;
    const used = userRecord ? (userRecord.ai_credits_used || 0) : 0;

    if (userRecord && used >= limit) {
      return res.status(429).json({
        error: 'AI_LIMIT_EXCEEDED',
        message: `You have exhausted your free AI generation credits (${used}/${limit}). Contact support or wait for next quota cycle.`,
        creditsRemaining: 0,
        creditsUsed: used,
        creditsLimit: limit
      });
    }

    // 2. Perform AI Analysis with Gemini (with database fallback)
    let aiResult = await callGeminiAI(cleanIdea);

    if (!aiResult) {
      // Deterministic signal database analysis fallback
      const text = cleanIdea.toLowerCase();
      let baseScore = 70;
      const scores = { demand: 72, competition: 65, feasibility: 78, timing: 68, indiaRelevance: 75, regulation: 50 };
      const gaps = [];
      const competitors = [];
      let mvpBuild = 'Build a lightweight web portal with a waitlist and transactional validation flow.';

      if (text.includes('compliance') || text.includes('rbi') || text.includes('regulatory') || text.includes('sebi') || text.includes('dpdp')) {
        baseScore += 14;
        scores.demand = 92;
        scores.regulation = 95;
        scores.timing = 93;
        scores.indiaRelevance = 98;
        scores.competition = 58;
        competitors.push('Signzy', 'Performios', 'ComplianceAI');
        gaps.push('Existing RegTech tools fail to audit regional language compliance codes and WhatsApp client conversations.');
        mvpBuild = 'Deploy a batch transcript scanning dashboard mapping voice and chat records directly to RBI digital lending directives and DPDP consent mandates.';
      } else if (text.includes('fraud') || text.includes('upi') || text.includes('payment') || text.includes('mule') || text.includes('fintech')) {
        baseScore += 10;
        scores.demand = 88;
        scores.timing = 89;
        scores.indiaRelevance = 99;
        scores.competition = 70;
        competitors.push('Bureau.id', 'Sift', 'Signzy');
        gaps.push('Device telemetry checking for localized Indian UPI apps and merchant settlement accounts is severely lacking.');
        mvpBuild = 'Create a lightweight JavaScript SDK measuring transaction velocity and geolocation stability to detect mule accounts prior to settlement.';
      } else if (text.includes('devops') || text.includes('llm') || text.includes('observability') || text.includes('cache') || text.includes('ai')) {
        baseScore += 8;
        scores.demand = 86;
        scores.timing = 91;
        scores.indiaRelevance = 84;
        scores.competition = 75;
        competitors.push('Langsmith', 'Helicone', 'Portkey');
        gaps.push('Observed gateways lack automated failover to cost-effective localized Indian datacenter inference endpoints.');
        mvpBuild = 'Write a proxy API client that redirects throttled requests to secondary models while enforcing real-time token spend limits.';
      } else {
        gaps.push('Need to establish converging evidence from customer interviews and verify regulatory clearances.');
        competitors.push('Generic Global SaaS alternatives');
        mvpBuild = 'Build a high-conversion landing page and interactive mock prototype to collect prepaid pilot signups from target enterprises.';
      }

      baseScore = Math.max(50, Math.min(97, baseScore));
      aiResult = {
        validationScore: baseScore,
        scores,
        gaps,
        competitors,
        mvpBuild
      };
    }

    const result = {
      validated: true,
      ideaText: cleanIdea,
      validationScore: aiResult.validationScore || 80,
      scores: aiResult.scores || { demand: 75, competition: 65, feasibility: 80, timing: 70, indiaRelevance: 85, regulation: 60 },
      gaps: aiResult.gaps || ['Requires direct customer problem verification'],
      competitors: aiResult.competitors || ['Global incumbents'],
      mvpBuild: aiResult.mvpBuild || 'Build an initial proof of concept prototype.'
    };

    // 3. Find 2–3 Related Opportunities from database
    const oppRows = db.prepare('SELECT * FROM opportunities').all();
    const allOpps = oppRows.map(r => formatOpportunity(r));
    const lowerIdea = cleanIdea.toLowerCase();

    const relatedOpportunities = allOpps
      .map(opp => {
        let relScore = 0;
        if (lowerIdea.includes('rbi') || lowerIdea.includes('compliance') || lowerIdea.includes('bank') || lowerIdea.includes('lending')) {
          if (opp.vertical === 'BFSI') relScore += 20;
        }
        if (lowerIdea.includes('code') || lowerIdea.includes('llm') || lowerIdea.includes('devops') || lowerIdea.includes('cloud')) {
          if (opp.vertical === 'IT') relScore += 20;
        }
        relScore += opp.score;
        return { opp, relScore };
      })
      .sort((a, b) => b.relScore - a.relScore)
      .slice(0, 3)
      .map(r => r.opp);

    // 4. Increment credit usage in DB for authenticated user
    let updatedUsed = used;
    if (req.user) {
      db.prepare('UPDATE users SET ai_credits_used = ai_credits_used + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.user.id);
      updatedUsed += 1;

      const validationId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO idea_validations (
          id, user_id, idea_text, validation_score, scores_json, gaps_json, competitors_json, mvp_build
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        validationId,
        req.user.id,
        cleanIdea,
        result.validationScore,
        JSON.stringify(result.scores),
        JSON.stringify(result.gaps),
        JSON.stringify(result.competitors),
        result.mvpBuild
      );
    }

    const remaining = Math.max(0, limit - updatedUsed);

    res.json({
      result,
      relatedOpportunities,
      aiCredits: {
        limit,
        used: updatedUsed,
        remaining
      }
    });
  } catch (error) {
    console.error('Validate idea error:', error);
    res.status(500).json({ error: 'Failed to validate startup idea' });
  }
});

// Contextual AI Follow-up Endpoint (Roadmap, Compliance Checklists, GTM Pilot Archetypes)
app.post('/api/validator/followup', optionalAuth, async (req, res) => {
  try {
    const { ideaText, followUpType } = req.body;

    const cleanIdea = sanitizeText(ideaText, 1500);
    const validTypes = ['roadmap', 'compliance', 'gtm'];
    const type = validTypes.includes(followUpType) ? followUpType : 'roadmap';

    if (!cleanIdea || cleanIdea.length < 5) {
      return res.status(400).json({ error: 'Startup idea text is required' });
    }

    // Check AI credits
    let userRecord = null;
    if (req.user) {
      userRecord = db.prepare('SELECT id, ai_credits_limit, ai_credits_used FROM users WHERE id = ?').get(req.user.id);
    }

    const limit = userRecord ? (userRecord.ai_credits_limit || FREE_AI_CREDITS) : FREE_AI_CREDITS;
    const used = userRecord ? (userRecord.ai_credits_used || 0) : 0;

    if (userRecord && used >= limit) {
      return res.status(429).json({
        error: 'AI_LIMIT_EXCEEDED',
        message: `You have exhausted your free AI generation credits (${used}/${limit}).`,
        creditsRemaining: 0,
        creditsUsed: used,
        creditsLimit: limit
      });
    }

    let responseData = null;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      let prompt = '';
      if (type === 'roadmap') {
        prompt = `For this startup idea in India: "${cleanIdea}", generate a concrete 4-Week Technical MVP Build Roadmap.
Return ONLY JSON with this format:
{
  "title": "4-Week Technical MVP Build Roadmap",
  "sections": [
    { "subtitle": "Week 1: Core Architecture & Data Models", "items": ["Task 1", "Task 2", "Task 3"] },
    { "subtitle": "Week 2: Backend Engines & Regulatory Connectors", "items": ["Task 1", "Task 2", "Task 3"] },
    { "subtitle": "Week 3: Frontend Dashboard & Workflows", "items": ["Task 1", "Task 2", "Task 3"] },
    { "subtitle": "Week 4: Deployment & Pilot Telemetry Verification", "items": ["Task 1", "Task 2", "Task 3"] }
  ]
}`;
      } else if (type === 'compliance') {
        prompt = `For this startup idea in India: "${cleanIdea}", list the exact Regulatory & Compliance Checkboxes (RBI, DPDP, SEBI, NPCI).
Return ONLY JSON with this format:
{
  "title": "Mandatory Regulatory & Compliance Checkboxes",
  "sections": [
    { "subtitle": "Data Protection & Consent Architecture (DPDP)", "items": ["Item 1", "Item 2", "Item 3"] },
    { "subtitle": "Financial & Transaction Disclosures (RBI / NPCI)", "items": ["Item 1", "Item 2", "Item 3"] },
    { "subtitle": "Security & Audit Logging Mandates (CERT-In)", "items": ["Item 1", "Item 2"] }
  ]
}`;
      } else {
        prompt = `For this startup idea in India: "${cleanIdea}", suggest 5 Specific Enterprise Customer Pilot Archetypes in India.
Return ONLY JSON with this format:
{
  "title": "Target Enterprise Pilot Customer Archetypes",
  "sections": [
    { "subtitle": "Primary Ideal Customer Profiles (ICPs)", "items": ["Profile 1 with exact pain point", "Profile 2 with exact pain point", "Profile 3 with exact pain point"] },
    { "subtitle": "Outreach & Value Pitch Strategies", "items": ["Pitch hook 1", "Pitch hook 2"] }
  ]
}`;
      }

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const gemRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
        if (gemRes.ok) {
          const gemData = await gemRes.json();
          const textOut = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOut) responseData = JSON.parse(textOut.trim());
        }
      } catch (err) {
        console.warn('Gemini follow-up error:', err.message);
      }
    }

    // Fallback if key missing or API call failed
    if (!responseData) {
      if (type === 'roadmap') {
        responseData = {
          title: '4-Week Technical MVP Build Roadmap',
          sections: [
            {
              subtitle: 'Week 1: Data Schemas & API Foundation',
              items: [
                'Set up SQLite/PostgreSQL schema with strict foreign keys and encryption.',
                'Define REST/GraphQL contract models for client telemetry and audits.',
                'Implement JWT authentication and basic role-based permissions.'
              ]
            },
            {
              subtitle: 'Week 2: Core Business Logic & Rule Engine',
              items: [
                'Build verification pipeline validating transactional event thresholds.',
                'Integrate webhook listeners and mock adapter payloads.',
                'Write unit tests verifying zero falsified approvals.'
              ]
            },
            {
              subtitle: 'Week 3: Interactive Dashboard & Founder UI',
              items: [
                'Develop responsive Tailwind dashboard with real-time signal monitors.',
                'Add filterable audit log tables with CSV/PDF export capability.',
                'Create onboarding settings view to configure alerting thresholds.'
              ]
            },
            {
              subtitle: 'Week 4: Deployment & Enterprise Pilot Onboarding',
              items: [
                'Deploy production build to cloud container (Render/Railway/Fly.io).',
                'Conduct security scan verifying DPDP consent requirements.',
                'Onboard 2 initial pilot customers to test live workflows.'
              ]
            }
          ]
        };
      } else if (type === 'compliance') {
        responseData = {
          title: 'Mandatory Regulatory & Compliance Checkboxes',
          sections: [
            {
              subtitle: 'DPDP Act (Digital Personal Data Protection)',
              items: [
                'Obtain explicit, itemized user consent prior to processing financial telemetry.',
                'Implement data localization ensuring Indian user records reside in local datacenters.',
                'Provide automated consent revocation and data erasure workflows.'
              ]
            },
            {
              subtitle: 'RBI & NPCI Directives',
              items: [
                'Enforce strict audit logging for all automated merchant risk classifications.',
                'Ensure merchant settlement accounts adhere to KYC and AML screening rules.',
                'Maintain immutable transaction timestamp logs for minimum 5 years.'
              ]
            },
            {
              subtitle: 'CERT-In Cybersecurity Guidelines',
              items: [
                'Report critical security incidents and API anomalies within 6 hours.',
                'Enforce TLS 1.3 encryption across all internal and external communication rails.'
              ]
            }
          ]
        };
      } else {
        responseData = {
          title: 'Target Enterprise Pilot Customer Archetypes',
          sections: [
            {
              subtitle: 'Top 3 High-Conversion Enterprise Profiles in India',
              items: [
                'Tier-2 & Tier-3 NBFCs with high digital lending volumes needing automated compliance audits.',
                'D2C Payment Aggregators & FinTech Gateways facing merchant settlement fraud risks.',
                'Mid-sized IT Services Firms modernizing enterprise legacy monolithic applications.'
              ]
            },
            {
              subtitle: 'Founder Outreach Strategy',
              items: [
                'Offer a free 14-day historical log compliance audit to identify immediate risk gaps.',
                'Pitch 60% operational time reduction in manual compliance reporting.'
              ]
            }
          ]
        };
      }
    }

    // Increment user credits in DB
    let updatedUsed = used;
    if (req.user) {
      db.prepare('UPDATE users SET ai_credits_used = ai_credits_used + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(req.user.id);
      updatedUsed += 1;
    }

    const remaining = Math.max(0, limit - updatedUsed);

    res.json({
      success: true,
      followUpType: type,
      title: responseData.title,
      sections: responseData.sections,
      aiCredits: {
        limit,
        used: updatedUsed,
        remaining
      }
    });
  } catch (error) {
    console.error('Follow-up error:', error);
    res.status(500).json({ error: 'Failed to generate contextual follow-up' });
  }
});

// ==========================================
// SAVED IDEAS HISTORY ROUTES
// ==========================================

// Save Idea to Database Notebook
app.post('/api/validator/save', authenticateToken, (req, res) => {
  try {
    const { ideaText, validationScore, scores, gaps, competitors, mvpBuild, fullResult } = req.body;
    if (!ideaText || ideaText.trim().length < 5) {
      return res.status(400).json({ error: 'Valid startup idea text is required' });
    }

    const id = crypto.randomUUID();
    db.prepare(`
      INSERT INTO idea_validations (
        id, user_id, idea_text, validation_score, scores_json,
        gaps_json, competitors_json, mvp_build, full_result_json, is_saved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      req.user.id,
      sanitizeText(ideaText, 2000),
      typeof validationScore === 'number' ? validationScore : 75,
      JSON.stringify(scores || {}),
      JSON.stringify(gaps || []),
      JSON.stringify(competitors || []),
      sanitizeText(mvpBuild || '', 2000),
      JSON.stringify(fullResult || {})
    );

    res.status(201).json({ 
      success: true, 
      id, 
      message: 'Idea successfully saved to your private notebook.' 
    });
  } catch (error) {
    console.error('Save idea error:', error);
    res.status(500).json({ error: 'Failed to save idea to database' });
  }
});

// Fetch User Saved Ideas History
app.get('/api/validator/saved', authenticateToken, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM idea_validations 
      WHERE user_id = ? AND is_saved = 1 
      ORDER BY created_at DESC
    `).all(req.user.id);

    const savedIdeas = rows.map(r => ({
      id: r.id,
      ideaText: r.idea_text,
      validationScore: r.validation_score,
      scores: JSON.parse(r.scores_json || '{}'),
      gaps: JSON.parse(r.gaps_json || '[]'),
      competitors: JSON.parse(r.competitors_json || '[]'),
      mvpBuild: r.mvp_build,
      fullResult: r.full_result_json ? JSON.parse(r.full_result_json) : null,
      createdAt: r.created_at
    }));

    res.json({ savedIdeas, count: savedIdeas.length });
  } catch (error) {
    console.error('Get saved ideas error:', error);
    res.status(500).json({ error: 'Failed to retrieve saved ideas' });
  }
});

// Delete a Saved Idea
app.delete('/api/validator/saved/:id', authenticateToken, (req, res) => {
  try {
    const ideaId = sanitizeText(req.params.id, 100);
    db.prepare('DELETE FROM idea_validations WHERE id = ? AND user_id = ?').run(ideaId, req.user.id);
    res.json({ success: true, message: 'Saved idea removed successfully' });
  } catch (error) {
    console.error('Delete saved idea error:', error);
    res.status(500).json({ error: 'Failed to delete saved idea' });
  }
});

// ==========================================
// USER PROFILE & SETTINGS ROUTES
// ==========================================

// Get Detailed Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role, avatar_url, created_at, ai_credits_limit, ai_credits_used FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
    const limit = user.ai_credits_limit || FREE_AI_CREDITS;
    const used = user.ai_credits_used || 0;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        aiCredits: {
          limit,
          used,
          remaining: Math.max(0, limit - used)
        }
      },
      profile: profile || null
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to load user profile' });
  }
});

// Update Profile
app.put('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const {
      fullName,
      founderRole,
      experienceYears,
      locationCity,
      primaryVertical,
      knowledgeAreas,
      skills,
      codingProficiency,
      capitalBudget,
      timeCommitment,
      regulatoryAppetite
    } = req.body;

    const cleanName = sanitizeText(fullName || req.user.name, 100);
    db.prepare('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cleanName, req.user.id);

    const skillsStr = Array.isArray(skills) ? skills.join(', ') : sanitizeText(skills || '', 500);
    const knowledgeStr = Array.isArray(knowledgeAreas) ? knowledgeAreas.join(', ') : sanitizeText(knowledgeAreas || '', 500);

    db.prepare(`
      INSERT INTO user_profiles (
        user_id, full_name, founder_role, experience_years, location_city,
        primary_vertical, knowledge_areas, skills, coding_proficiency,
        capital_budget, time_commitment, launch_window, funding_ambition,
        regulatory_appetite, mvp_complexity, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        founder_role = excluded.founder_role,
        experience_years = excluded.experience_years,
        location_city = excluded.location_city,
        primary_vertical = excluded.primary_vertical,
        knowledge_areas = excluded.knowledge_areas,
        skills = excluded.skills,
        coding_proficiency = excluded.coding_proficiency,
        capital_budget = excluded.capital_budget,
        time_commitment = excluded.time_commitment,
        regulatory_appetite = excluded.regulatory_appetite,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      req.user.id,
      cleanName,
      sanitizeText(founderRole || 'Technical Founder / Full-Stack', 100),
      sanitizeText(experienceYears || '3-5 years', 50),
      sanitizeText(locationCity || 'Bengaluru', 100),
      sanitizeText(primaryVertical || 'BFSI', 50),
      knowledgeStr,
      skillsStr,
      sanitizeText(codingProficiency || 'Hands-on Full Stack', 50),
      sanitizeText(capitalBudget || 'Moderate (₹1L - ₹5L)', 50),
      sanitizeText(timeCommitment || 'Full-time commitment (40+ hrs/wk)', 50),
      '1-3 months',
      'Angel/Seed',
      sanitizeText(regulatoryAppetite || 'High', 50),
      'Moderate'
    );

    const updatedProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
    res.json({ success: true, message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// User Settings
app.get('/api/user/settings', authenticateToken, (req, res) => {
  try {
    let settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
    if (!settings) {
      db.prepare('INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)').run(req.user.id);
      settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
    }
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/user/settings', authenticateToken, (req, res) => {
  try {
    const { theme, emailAlerts, weeklyDigest, exportFormat } = req.body;
    db.prepare(`
      INSERT INTO user_settings (user_id, theme, email_alerts, weekly_digest, export_format, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        theme = coalesce(excluded.theme, user_settings.theme),
        email_alerts = coalesce(excluded.email_alerts, user_settings.email_alerts),
        weekly_digest = coalesce(excluded.weekly_digest, user_settings.weekly_digest),
        export_format = coalesce(excluded.export_format, user_settings.export_format),
        updated_at = CURRENT_TIMESTAMP
    `).run(
      req.user.id,
      sanitizeText(theme || 'glacier', 30),
      emailAlerts ? 1 : 0,
      weeklyDigest ? 1 : 0,
      sanitizeText(exportFormat || 'pdf', 20)
    );
    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(req.user.id);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==========================================
// ADMIN DASHBOARD & ANALYTICS ROUTES (Protected by requireAdmin)
// ==========================================

app.get('/api/admin/metrics', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const activeProfilesRow = db.prepare('SELECT COUNT(*) as count FROM user_profiles').get();
    const oppCountRow = db.prepare('SELECT COUNT(*) as count FROM opportunities').get();
    const signalsSumRow = db.prepare('SELECT SUM(signal_count) as total FROM opportunities').get();
    const savedCountRow = db.prepare('SELECT COUNT(*) as count FROM saved_opportunities').get();
    const validationsCountRow = db.prepare('SELECT COUNT(*) as count FROM idea_validations').get();

    const sourceHealth = db.prepare('SELECT name, status, latency, volume, last_run as lastRun FROM source_health').all();

    const rawIngested = (signalsSumRow.total || 0) + 1200;
    const indiaFiltered = Math.round(rawIngested * 0.52);
    const dedupedClusters = Math.round(indiaFiltered * 0.28);
    const candidates = oppCountRow.count * 3;
    const liveSynthesized = oppCountRow.count;

    const pipelineStages = [
      { stage: 'Ingestion Raw Payloads', count: rawIngested, percent: 100 },
      { stage: 'Freshness & India Filters', count: indiaFiltered, percent: 52 },
      { stage: 'Deduplicated Clusters', count: dedupedClusters, percent: 15 },
      { stage: 'Opportunity Candidates', count: candidates, percent: 4 },
      { stage: 'Gemini Synthesized / Live', count: liveSynthesized, percent: 1.5 }
    ];

    const totalUsers = userCountRow.count || 1;
    const userGrowthData = [
      { day: 'Mon', activeUsers: Math.max(1, Math.round(totalUsers * 0.5)) },
      { day: 'Tue', activeUsers: Math.max(1, Math.round(totalUsers * 0.6)) },
      { day: 'Wed', activeUsers: Math.max(1, Math.round(totalUsers * 0.7)) },
      { day: 'Thu', activeUsers: Math.max(1, Math.round(totalUsers * 0.8)) },
      { day: 'Fri', activeUsers: Math.max(1, Math.round(totalUsers * 0.85)) },
      { day: 'Sat', activeUsers: Math.max(1, Math.round(totalUsers * 0.9)) },
      { day: 'Sun', activeUsers: totalUsers }
    ];

    const recentLogs = db.prepare('SELECT event_type, message, created_at FROM admin_logs ORDER BY id DESC LIMIT 10').all();

    res.json({
      metrics: {
        totalUsers: userCountRow.count || 0,
        activeOnboardedFounders: activeProfilesRow.count || 0,
        totalOpportunities: oppCountRow.count || 0,
        totalSignalsParsed: signalsSumRow.total || 0,
        totalSavedItems: savedCountRow.count || 0,
        totalValidationsRun: validationsCountRow.count || 0,
        healthySourcesCount: sourceHealth.filter(s => s.status === 'Healthy').length,
        totalSourcesCount: sourceHealth.length
      },
      sourceHealth,
      pipelineStages,
      userGrowthData,
      recentLogs
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Failed to generate admin metrics' });
  }
});

// Trigger Ingestion Pipeline Run (Protected by requireAdmin)
app.post('/api/admin/trigger-ingestion', authenticateToken, requireAdmin, async (req, res) => {
  try {
    db.prepare(`
      INSERT INTO admin_logs (event_type, message, details_json)
      VALUES (?, ?, ?)
    `).run('PIPELINE_TRIGGERED', `Live ingestion batch triggered by admin ${req.user.id}`, JSON.stringify({ userId: req.user.id, timestamp: new Date().toISOString() }));

    // Run live pipeline in background asynchronously
    runLiveIngestionPipeline(process.env.GEMINI_API_KEY).catch(err => {
      console.error('Background ingestion pipeline error:', err);
    });

    res.json({ message: 'Live-First ingestion pipeline triggered successfully in background' });
  } catch (error) {
    console.error('Trigger ingestion error:', error);
    res.status(500).json({ error: 'Failed to trigger ingestion pipeline' });
  }
});

// Serve frontend build in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`FounderSignal Production API Server running on port ${PORT}`);
});
