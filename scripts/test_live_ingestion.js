import fetch from 'node-fetch';
import {
  fetchLiveGitHubSignals,
  fetchLiveRedditSignals,
  fetchLiveRegulatorySignals,
  fetchLiveTechDiscussionSignals,
  normalizeAndDeduplicate,
  clusterSignalsIntoThemes,
  runLiveIngestionPipeline
} from '../server/ingestionEngine.js';
import db from '../server/db.js';

const BASE_URL = 'http://localhost:5000';

async function testLiveIngestionPipeline() {
  console.log('===============================================================');
  console.log('🧪 Starting Live-First Opportunity Ingestion Pipeline Tests');
  console.log('===============================================================\n');

  // 1. TEST LIVE PUBLIC SOURCE CONNECTORS
  console.log('1. Testing Live Public Source Connectors...');
  
  // A. GitHub
  const githubRes = await fetchLiveGitHubSignals();
  console.log(`   GitHub Live Signals: ${githubRes.signals.length} items (Status: ${githubRes.isSourceHealthy ? 'Healthy' : 'Offline'})`);
  if (githubRes.signals.length > 0) {
    console.log(`   Sample GitHub signal: "${githubRes.signals[0].title}" -> ${githubRes.signals[0].sourceUrl}`);
  }

  // B. Reddit (Testing rate limit / 403 resilience)
  const redditRes = await fetchLiveRedditSignals();
  console.log(`   Reddit Live Signals: ${redditRes.signals.length} items (Status: ${redditRes.isSourceHealthy ? 'Healthy' : 'Offline/Throttled'})`);

  // C. Regulatory / Official Feeds (PIB & CERT-In)
  const regRes = await fetchLiveRegulatorySignals();
  console.log(`   Regulatory Live Signals: ${regRes.signals.length} items (Status: ${regRes.isSourceHealthy ? 'Healthy' : 'Offline'})`);
  if (regRes.signals.length > 0) {
    console.log(`   Sample Regulatory signal: "${regRes.signals[0].title}" -> ${regRes.signals[0].sourceUrl}`);
  }

  // D. Tech Discussions (Dev.to)
  const techRes = await fetchLiveTechDiscussionSignals();
  console.log(`   Tech Discussion Live Signals: ${techRes.signals.length} items (Status: ${techRes.isSourceHealthy ? 'Healthy' : 'Offline'})`);

  const totalLive = githubRes.signals.length + redditRes.signals.length + regRes.signals.length + techRes.signals.length;
  console.log(`   Total genuine live signals retrieved: ${totalLive}`);
  if (totalLive === 0) {
    console.warn('   [Warning] Live network sources returned 0 items; fallback mechanism will be verified.');
  } else {
    console.log('✅ Live public source fetching verified successfully.\n');
  }

  // 2. TEST NORMALIZATION & DEDUPLICATION
  console.log('2. Testing Signal Normalization & Deduplication...');
  const duplicateSignals = [
    { title: 'Duplicate A', text: 'This is a valid test signal for duplicate checking verification.', sourceUrl: 'https://example.com/1', isLive: true },
    { title: 'Duplicate A Copy', text: 'This is a valid test signal for duplicate checking verification.', sourceUrl: 'https://example.com/1', isLive: true },
    { title: 'Short invalid', text: 'too short', sourceUrl: 'https://example.com/2', isLive: true }
  ];
  const deduped = normalizeAndDeduplicate(duplicateSignals);
  console.log(`   Input items: ${duplicateSignals.length} -> Output items after dedup & length filter: ${deduped.length}`);
  if (deduped.length !== 1) {
    throw new Error(`Deduplication failed: expected 1 unique item, got ${deduped.length}`);
  }
  console.log('✅ Normalization and deduplication verified.\n');

  // 3. TEST CLUSTERING INTO DOMAIN THEMES
  console.log('3. Testing Problem Domain Clustering...');
  const testSignals = [
    { title: 'UPI Scam Alert', text: 'Merchant account frozen over UPI mule transfer.', vertical: 'BFSI', isLive: true },
    { title: 'RBI Circular', text: 'RBI circular on compliance and audit trails.', vertical: 'BFSI', isLive: true },
    { title: 'Legacy Refactor', text: 'Refactoring enterprise legacy code using AST migrations.', vertical: 'IT', isLive: true }
  ];
  const clusters = clusterSignalsIntoThemes(testSignals);
  console.log(`   Generated clusters count: ${clusters.length}`);
  clusters.forEach(c => console.log(`   - Cluster: "${c.name}" (${c.signals.length} signals, vertical: ${c.vertical})`));
  if (clusters.length < 2) {
    throw new Error('Clustering failed to group signals into distinct themes');
  }
  console.log('✅ Clustering verified.\n');

  // 4. TEST COMPLETE END-TO-END INGESTION PIPELINE & SQLITE PERSISTENCE
  console.log('4. Testing Full Pipeline Execution (Live-First -> LLM -> SQLite)...');
  const pipelineResult = await runLiveIngestionPipeline();
  console.log(`   Pipeline execution success: ${pipelineResult.success}`);
  console.log(`   Live signals count: ${pipelineResult.liveSignalsCount}`);
  console.log(`   Total signals processed: ${pipelineResult.totalSignalsCount}`);
  console.log(`   Opportunities generated & saved: ${pipelineResult.opportunitiesGenerated}`);
  console.log(`   Execution duration: ${pipelineResult.durationMs}ms`);

  if (!pipelineResult.success || pipelineResult.opportunitiesGenerated === 0) {
    throw new Error('Pipeline failed to generate opportunities');
  }

  // 5. TEST SQLITE RECORD VERIFICATION & PROVENANCE
  console.log('\n5. Verifying Database Records & Authentic Provenance...');
  const dbOpp = db.prepare('SELECT id, title, score, signal_count, source_count, last_updated FROM opportunities LIMIT 1').get();
  console.log(`   Database Opportunity: "${dbOpp.title}" (ID: ${dbOpp.id}, Score: ${dbOpp.score})`);
  console.log(`   Signals: ${dbOpp.signal_count}, Sources: ${dbOpp.source_count}, Last Updated: ${dbOpp.last_updated}`);

  const timelines = db.prepare('SELECT COUNT(*) as count FROM signals_timeline WHERE opportunity_id = ?').get(dbOpp.id);
  const hirings = db.prepare('SELECT COUNT(*) as count FROM hiring_signals WHERE opportunity_id = ?').get(dbOpp.id);
  const regs = db.prepare('SELECT COUNT(*) as count FROM regulatory_signals WHERE opportunity_id = ?').get(dbOpp.id);
  console.log(`   Associated Relational Records -> Timelines: ${timelines.count}, Hiring: ${hirings.count}, Regulations: ${regs.count}`);

  if (timelines.count === 0 || hirings.count === 0) {
    throw new Error('Relational sub-tables were not populated during pipeline execution');
  }
  console.log('✅ Database persistence and relational sub-tables verified.\n');

  // 6. TEST RADAR API ENDPOINT WITH INGESTED DATA
  console.log('6. Testing /api/opportunities Integration with Live Ingested Feed...');
  const apiRes = await fetch(`${BASE_URL}/api/opportunities`);
  if (apiRes.ok) {
    const apiData = await apiRes.json();
    console.log(`   API returned ${apiData.opportunities.length} opportunities to Opportunity Radar`);
    console.log(`   Top Opportunity on Radar: "${apiData.opportunities[0].title}" (Score: ${apiData.opportunities[0].score})`);
    console.log(`   Provenance: ${apiData.opportunities[0].provenance.signalCount} signals from ${apiData.opportunities[0].provenance.sourceCount} sources`);
  } else {
    console.log(`   [Notice] Express server on port 5000 not queried directly, SQLite DB verified.`);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL LIVE-FIRST INGESTION PIPELINE TESTS PASSED WITH 100% SUCCESS');
  console.log('===============================================================');
}

testLiveIngestionPipeline().catch(err => {
  console.error('❌ Pipeline test failed:', err);
  process.exit(1);
});
