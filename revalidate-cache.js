// This script can be run to manually revalidate the Next.js cache
// Run with: node revalidate-cache.js

const https = require('https');

// Replace with your actual deployment URL and token
const deploymentUrl = 'https://web-hindi-new.vercel.app';
const token = process.env.REVALIDATION_TOKEN || 'your-revalidation-token'; // Set this in your environment or replace with actual token

console.log('Sending request to revalidate cache...');

// Create the URL with the token
const url = new URL('/api/revalidate', deploymentUrl);
url.searchParams.append('token', token);

const options = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(url, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Cache revalidated successfully!');
      console.log(data);
    } else {
      console.error(`Failed to revalidate cache. Status code: ${res.statusCode}`);
      console.error(`Response: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error('Error revalidating cache:', error);
});

req.end();

console.log('Note: You need to set the REVALIDATION_TOKEN environment variable or replace it in this script with your actual token.'); 