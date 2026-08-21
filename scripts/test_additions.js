// Verification Script for:
// 1. Google OAuth 2.0
// 2. Gemini AI Integration
// 3. Per-User AI Free Credit Limits
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 Starting Verification Tests for New Features & Integrations');
  console.log('===============================================================\n');

  // Test 1: Google OAuth 2.0 URL Endpoint
  console.log('1. Testing Google OAuth 2.0 URL Endpoint (/api/auth/google/url)...');
  const googleUrlRes = await fetch(`${BASE_URL}/auth/google/url`);
  const googleUrlData = await googleUrlRes.json();
  console.log(`✅ Google OAuth URL endpoint response: configured = ${googleUrlData.configured}`);
  if (googleUrlData.url) {
    console.log(`   OAuth Consent URL: ${googleUrlData.url.substring(0, 70)}...`);
  }

  // Test 2: Google Sign-In & User Creation
  console.log('\n2. Testing Google Sign-In Authentication & Account Association...');
  const googleAuthRes = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `google.builder.${Date.now()}@gmail.com`,
      name: 'Priya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    })
  });
  const googleAuthData = await googleAuthRes.json();
  if (!googleAuthRes.ok) throw new Error(`Google Auth failed: ${JSON.stringify(googleAuthData)}`);
  const googleToken = googleAuthData.token;
  console.log(`✅ Google User Authenticated: ${googleAuthData.user.name} (${googleAuthData.user.email})`);
  console.log(`   Initial AI Credits: ${googleAuthData.user.aiCredits.remaining} / ${googleAuthData.user.aiCredits.limit} remaining`);

  // Test 3: Standard User Registration & Credit Allocation
  console.log('\n3. Testing Standard User Registration & Credit Quota Setup...');
  const testEmail = `ai.founder.${Date.now()}@foundersignal.in`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password@2026',
      name: 'Rohan Gupta'
    })
  });
  const regData = await regRes.json();
  const token = regData.token;
  console.log(`✅ User Registered: ${regData.user.name}`);
  console.log(`   Assigned AI Free Quota: ${regData.user.aiCredits.limit} credits, Used: ${regData.user.aiCredits.used}`);

  // Test 4: Gemini AI Idea Validation & Credit Consumption
  console.log('\n4. Testing Gemini AI Idea Validation & Live Credit Consumption...');
  const valRes1 = await fetch(`${BASE_URL}/validator/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ideaText: 'Real-time UPI merchant mule fraud prevention using device fingerprinting telemetry and geolocation tracking'
    })
  });
  const valData1 = await valRes1.json();
  if (!valRes1.ok) throw new Error(`Validation failed: ${JSON.stringify(valData1)}`);
  console.log(`✅ AI Validation Completed.`);
  console.log(`   Validation Score: ${valData1.result.validationScore}/100`);
  console.log(`   MVP Blueprint: ${valData1.result.mvpBuild.substring(0, 80)}...`);
  console.log(`   Updated Credits: ${valData1.aiCredits.remaining} / ${valData1.aiCredits.limit} remaining (Used: ${valData1.aiCredits.used})`);

  // Test 5: Verify Credit Persistence in Backend (Cannot be bypassed by refresh)
  console.log('\n5. Testing Credit Persistence on /api/auth/me & /api/user/credits...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log(`✅ Session reloaded from DB. Persisted Credits: ${meData.user.aiCredits.remaining} / ${meData.user.aiCredits.limit}`);
  if (meData.user.aiCredits.used !== 1) {
    throw new Error(`Expected used credits to be 1, got ${meData.user.aiCredits.used}`);
  }

  // Test 6: Test Exhausting AI Credits & Limit Enforcement
  console.log('\n6. Testing Exhausting AI Credits & 429 Quota Exceeded Enforcement...');
  let lastRes = null;
  // Consume the remaining credits (9 calls)
  for (let i = 2; i <= 10; i++) {
    const res = await fetch(`${BASE_URL}/validator/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ideaText: `Automated AI regulatory compliance audit test ${i}`
      })
    });
    lastRes = await res.json();
  }
  console.log(`✅ Consumed 10 total credits. Remaining: ${lastRes.aiCredits.remaining} / ${lastRes.aiCredits.limit}`);

  // 11th call: Must be blocked with HTTP 429
  console.log('\n7. Testing 11th AI Generation Request (Must be blocked)...');
  const blockedRes = await fetch(`${BASE_URL}/validator/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ideaText: 'Extra unauthorized generation attempt'
    })
  });
  const blockedData = await blockedRes.json();
  console.log(`   Response Status: ${blockedRes.status} (Expected: 429)`);
  console.log(`   Error Code: ${blockedData.error}`);
  console.log(`   Blocked Message: "${blockedData.message}"`);

  if (blockedRes.status !== 429 || blockedData.error !== 'AI_LIMIT_EXCEEDED') {
    throw new Error('AI Usage limit was not properly enforced!');
  }
  console.log('✅ AI Usage limit successfully prevented unauthorized generation!');

  console.log('\n===============================================================');
  console.log('🎉 ALL INTEGRATION & VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('===============================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
