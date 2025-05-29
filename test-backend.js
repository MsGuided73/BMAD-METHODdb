#!/usr/bin/env node

/**
 * BMAD Backend Test Script
 * Tests all backend API endpoints to verify functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    const config = { method, url: `${BASE_URL}${url}` };
    if (data) config.data = data;

    const response = await axios(config);
    console.log(`✅ ${name}: ${response.status} - ${response.statusText}`);

    if (response.data) {
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log(`   📊 Returned ${response.data.data.length} items`);
      } else if (response.data.success) {
        console.log(`   ✨ Success: ${response.data.success}`);
      }
    }

    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.response?.status || 'ERROR'} - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 BMAD Backend API Test Suite');
  console.log('================================');

  const tests = [
    ['Health Check', '/api/health'],
    ['Get Templates', '/api/templates'],
    ['Get Checklists', '/api/checklists'],
    ['Get Agents', '/api/agents'],
    ['Get Template Schema', '/api/templates/project-brief-project-name.md/schema'],
    ['Get Checklist by Phase', '/api/checklists/by-phase/analyst'],
    ['Create Session', '/api/sessions', 'POST', { projectName: 'Test Project' }],
  ];

  let passed = 0;
  let total = tests.length;

  for (const [name, url, method, data] of tests) {
    const success = await testEndpoint(name, url, method, data);
    if (success) passed++;
  }

  console.log('\n📊 Test Results');
  console.log('================');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Backend is fully functional.');
    console.log('\n📋 Next Steps:');
    console.log('1. Start the frontend: cd frontend && npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Create a new project and test the full workflow');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend server.');
  }
}

// Run the tests
runTests().catch(console.error);
