-- FounderSignal PostgreSQL Database Schema
-- Version 1.0 • August 2026

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Opportunities Table
CREATE TABLE IF NOT EXISTS opportunities (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    problem TEXT NOT NULL,
    target_customer VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    vertical VARCHAR(10) NOT NULL CHECK (vertical IN ('IT', 'BFSI')),
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    demand_score INT NOT NULL CHECK (demand_score BETWEEN 0 AND 100),
    hiring_score INT NOT NULL CHECK (hiring_score BETWEEN 0 AND 100),
    regulation_score INT NOT NULL CHECK (regulation_score BETWEEN 0 AND 100),
    skills_score INT NOT NULL CHECK (skills_score BETWEEN 0 AND 100),
    competition_score INT NOT NULL CHECK (competition_score BETWEEN 0 AND 100),
    timing_score INT NOT NULL CHECK (timing_score BETWEEN 0 AND 100),
    india_relevance_score INT NOT NULL CHECK (india_relevance_score BETWEEN 0 AND 100),
    momentum VARCHAR(20) DEFAULT 'steady' CHECK (momentum IN ('rising', 'steady', 'declining')),
    change_percentage INT NOT NULL DEFAULT 0,
    signal_count INT NOT NULL DEFAULT 0,
    source_count INT NOT NULL DEFAULT 0,
    why_interesting TEXT NOT NULL,
    overview TEXT NOT NULL,
    why_matters TEXT NOT NULL,
    demand_analysis TEXT NOT NULL,
    market_gap TEXT NOT NULL,
    mvp_recommendation TEXT NOT NULL,
    monetization_hypothesis TEXT NOT NULL,
    risks TEXT[] NOT NULL DEFAULT '{}',
    india_relevance_text TEXT NOT NULL,
    related_opportunities VARCHAR(100)[] NOT NULL DEFAULT '{}',
    last_updated VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Signals Timeline Table
CREATE TABLE IF NOT EXISTS signals_timeline (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    date VARCHAR(20) NOT NULL,
    value INT NOT NULL
);

-- 3. Hiring Signals Table
CREATE TABLE IF NOT EXISTS hiring_signals (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    volume VARCHAR(20) NOT NULL CHECK (volume IN ('High', 'Medium', 'Low')),
    salary_range VARCHAR(100) NOT NULL,
    count INT NOT NULL DEFAULT 0
);

-- 4. Skill Signals Table
CREATE TABLE IF NOT EXISTS skill_signals (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    scarcity VARCHAR(50) NOT NULL CHECK (scarcity IN ('Critical', 'High', 'Medium')),
    impact TEXT NOT NULL
);

-- 5. Regulatory Signals Table
CREATE TABLE IF NOT EXISTS regulatory_signals (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    regulation_name VARCHAR(255) NOT NULL,
    agency VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    date VARCHAR(50) NOT NULL
);

-- 6. Technology Signals Table
CREATE TABLE IF NOT EXISTS technology_signals (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    tech VARCHAR(255) NOT NULL,
    adoption_rate VARCHAR(50) NOT NULL,
    description TEXT NOT NULL
);

-- 7. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) REFERENCES opportunities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    strength VARCHAR(50) NOT NULL CHECK (strength IN ('Strong', 'Emerging', 'Weak', 'Medium')),
    pricing VARCHAR(100) NOT NULL
);

-- 8. Source Health Table
CREATE TABLE IF NOT EXISTS source_health (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    latency VARCHAR(50) NOT NULL,
    volume INT NOT NULL DEFAULT 0,
    last_run VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for high-performance searches
CREATE INDEX IF NOT EXISTS idx_opportunities_vertical ON opportunities(vertical);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(score);
CREATE INDEX IF NOT EXISTS idx_signals_timeline_opp ON signals_timeline(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_hiring_signals_opp ON hiring_signals(opportunity_id);
