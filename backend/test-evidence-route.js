/**
 * Quick test script to verify evidence routes are working
 * Run: node test-evidence-route.js
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/evidence';

console.log('Testing Evidence API...');
console.log(`URL: ${API_URL}\n`);

try {
  const response = await fetch(API_URL);
  const data = await response.json();
  
  console.log(`Status: ${response.status}`);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (response.ok) {
    console.log('\n✅ Evidence API is working!');
  } else {
    console.log('\n❌ Evidence API returned an error');
  }
} catch (error) {
  console.error('\n❌ Failed to connect to Evidence API:');
  console.error('Error:', error.message);
  console.error('\nPossible issues:');
  console.error('1. Backend server is not running');
  console.error('2. Backend server is running on a different port');
  console.error('3. Routes are not registered');
}



