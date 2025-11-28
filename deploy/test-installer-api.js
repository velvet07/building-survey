#!/usr/bin/env node

/**
 * Test script for installer API
 * Tests the /install/api/test-db endpoint
 */

const http = require('http');

const testData = {
  host: 'localhost',
  port: '3306',
  name: 'test_database',
  username: 'test_user',
  password: 'test_password',
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/install/api/test-db',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

console.log('🧪 Testing installer API...\n');
console.log('Request data:', testData);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 400) {
        console.log('\n✅ API endpoint is working (status code is valid)');
      } else {
        console.log(`\n⚠️  Unexpected status code: ${res.statusCode}`);
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ Failed to parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.error('\n💡 Make sure the dev server is running: npm run dev');
  process.exit(1);
});

req.write(postData);
req.end();

