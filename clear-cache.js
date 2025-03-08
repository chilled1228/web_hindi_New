// This script can be run to manually clear the Vercel cache
// Run with: node clear-cache.js

const https = require('https');

// Replace with your actual Vercel project ID and deployment ID
const projectId = 'your-project-id'; // Get this from your Vercel dashboard
const deploymentId = 'latest'; // Use 'latest' or a specific deployment ID

// Replace with your Vercel token
const token = 'your-vercel-token'; // Get this from your Vercel account settings

const options = {
  hostname: 'api.vercel.com',
  path: `/v1/projects/${projectId}/deployments/${deploymentId}/purge-cache`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

console.log('Sending request to purge Vercel cache...');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Cache purged successfully!');
    } else {
      console.error(`Failed to purge cache. Status code: ${res.statusCode}`);
      console.error(`Response: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error('Error purging cache:', error);
});

req.end();

console.log('Note: You need to replace the projectId and token values in this script with your actual Vercel project ID and token.'); 