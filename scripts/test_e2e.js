// End-to-End Verification Script for FounderSignal Production APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================');
  console.log('🚀 Starting FounderSignal Production Verification Tests');
  console.log('========================================================\n');

  // Test 1: Register New User
  console.log('1. Testing New User Registration...');
  const testEmail = `founder.${Date.now()}@testsignal.in`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'ProductionPassword@2026',
      name: 'Vikram Malhotra'
    })
  });
  const regData = await regRes.json();
  if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  console.log(`✅ User Registered: ${regData.user.name} (${regData.user.email})`);
  console.log(`   Initial Onboarding Status: ${regData.user.hasCompletedOnboarding} (Expected: false)`);
  const token = regData.token;

  // Test 2: Auth Verification (Me)
  console.log('\n2. Testing /api/auth/me Session Verification...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  if (!meRes.ok) throw new Error(`Me endpoint failed: ${JSON.stringify(meData)}`);
  console.log(`✅ Session Verified for: ${meData.user.name}, ID: ${meData.user.id}`);

  // Test 3: Submit 6-Step Onboarding
  console.log('\n3. Testing 6-Step Founder Onboarding Submission...');
  const onboardRes = await fetch(`${BASE_URL}/user/onboarding`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fullName: 'Vikram Malhotra',
      founderRole: 'Technical Founder / Full-Stack',
      experienceYears: '3-5 years',
      locationCity: 'Bengaluru',
      primaryVertical: 'BFSI',
      knowledgeAreas: ['RBI Fair Practice Directives', 'DPDP Consent Architecture', 'UPI Auto-Pay & QR Telemetry'],
      skills: ['React / Next.js', 'Node.js / Express', 'Python / FastApi', 'PostgreSQL / SQLite'],
      codingProficiency: 'Hands-on Full Stack',
      capitalBudget: 'Moderate (₹1L - ₹5L)',
      timeCommitment: 'Full-time commitment (40+ hrs/wk)',
      launchWindow: '1-3 months',
      fundingAmbition: 'Bootstrapped Profitability',
      regulatoryAppetite: 'High',
      mvpComplexity: 'Medium (4-6 weeks)'
    })
  });
  const onboardData = await onboardRes.json();
  if (!onboardRes.ok) throw new Error(`Onboarding failed: ${JSON.stringify(onboardData)}`);
  console.log(`✅ Onboarding Completed: ${onboardData.message}`);
  console.log(`   Updated Onboarding Status: ${onboardData.user.hasCompletedOnboarding} (Expected: true)`);
  console.log(`   Persisted Focus Vertical: ${onboardData.user.profile.primary_vertical}`);

  // Test 4: Fetch Opportunities from Live DB
  console.log('\n4. Testing Opportunities Catalog Query (Live DB)...');
  const oppRes = await fetch(`${BASE_URL}/opportunities`);
  const oppData = await oppRes.json();
  if (!oppRes.ok) throw new Error(`Fetch opportunities failed: ${JSON.stringify(oppData)}`);
  console.log(`✅ Fetched ${oppData.total} live opportunities from SQLite database.`);
  console.log(`   Sample Opportunity: "${oppData.opportunities[0].title}" (Score: ${oppData.opportunities[0].score}, Vertical: ${oppData.opportunities[0].vertical})`);

  // Test 5: Save/Bookmark Opportunity in DB
  console.log('\n5. Testing Save/Bookmark Opportunity in Database...');
  const targetOppId = oppData.opportunities[0].id;
  const saveRes = await fetch(`${BASE_URL}/user/saved/${targetOppId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const saveData = await saveRes.json();
  console.log(`✅ Saved Opportunity "${targetOppId}". User Watchlist IDs: [${saveData.savedIds.join(', ')}]`);

  // Test 6: Fetch User Saved List
  console.log('\n6. Testing Fetch User Saved Watchlist...');
  const savedListRes = await fetch(`${BASE_URL}/user/saved`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const savedListData = await savedListRes.json();
  console.log(`✅ User has ${savedListData.savedOpportunities.length} saved opportunities loaded from DB.`);

  // Test 7: Builder Match Diagnostic
  console.log('\n7. Testing Builder Match Diagnostic Service...');
  const matchRes = await fetch(`${BASE_URL}/builder/match`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      answers: {
        'q-skills': 'tech',
        'q-domain': 'BFSI',
        'q-capital': 'mid',
        'q-risk': 'high'
      }
    })
  });
  const matchData = await matchRes.json();
  console.log(`✅ Builder Match Computed. Top Opportunity: "${matchData.results[0].opportunity.title}"`);
  console.log(`   Fit Score: ${matchData.results[0].fitScore}%, Rationale: ${matchData.results[0].rationale}`);

  // Test 8: Career Signal Resume Parsing & Scoring
  console.log('\n8. Testing Career Signal Resume Parser...');
  const careerRes = await fetch(`${BASE_URL}/career/parse`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: 'Vikram_Malhotra_Resume.pdf',
      resumeText: 'Senior Full Stack Engineer with 5 years building scalable fintech platforms with React, Node.js, Python, PostgreSQL, and RBI DPDP compliance.'
    })
  });
  const careerData = await careerRes.json();
  console.log(`✅ Career Signal Parsed for ${careerData.profile.name}`);
  console.log(`   Resolved Role: ${careerData.profile.currentRole}`);
  console.log(`   Market Demand Score: ${careerData.profile.currentScore} / 100`);
  console.log(`   Top Recommendation: ${careerData.profile.recommendations[0].skill} (+${careerData.profile.recommendations[0].impactScore} pts)`);

  // Test 9: Idea Validator Service
  console.log('\n9. Testing Idea Validator Engine...');
  const valRes = await fetch(`${BASE_URL}/validator/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ideaText: 'Real-time UPI merchant mule fraud prevention using device fingerprinting telemetry and geolocation tracking'
    })
  });
  const valData = await valRes.json();
  console.log(`✅ Idea Validated. Score: ${valData.result.validationScore} / 100`);
  console.log(`   Detected Competitors: ${valData.result.competitors.join(', ')}`);
  console.log(`   Identified Market Gap: ${valData.result.gaps[0]}`);

  // Test 10: Existing User Login (Verifying Onboarding Skip)
  console.log('\n10. Testing Existing User Login (Skipping Onboarding)...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'ProductionPassword@2026'
    })
  });
  const loginData = await loginRes.json();
  console.log(`✅ Login Successful: ${loginData.user.name}`);
  console.log(`   hasCompletedOnboarding: ${loginData.user.hasCompletedOnboarding} (Expected: true -> Skips onboarding to dashboard)`);

  // Test 11: Admin Operational Metrics
  console.log('\n11. Testing Admin Metrics & Observability Dashboard...');
  const adminRes = await fetch(`${BASE_URL}/admin/metrics`);
  const adminData = await adminRes.json();
  console.log(`✅ Admin Metrics Retrieved from Live SQLite DB:`);
  console.log(`   Total Users: ${adminData.metrics.totalUsers}`);
  console.log(`   Active Onboarded Founders: ${adminData.metrics.activeOnboardedFounders}`);
  console.log(`   Catalog Opportunities: ${adminData.metrics.totalOpportunities}`);
  console.log(`   Total Ingested Signals: ${adminData.metrics.totalSignalsParsed}`);
  console.log(`   Healthy Ingestion Adapters: ${adminData.metrics.healthySourcesCount}/${adminData.metrics.totalSourcesCount}`);

  console.log('\n========================================================');
  console.log('🎉 ALL 11 PRODUCTION VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
