// This script can be run to manually revalidate the Next.js cache
// Run with: node revalidate-cache.js [slug]

const https = require('https');

// Replace with your actual deployment URL and token
const deploymentUrl = process.env.DEPLOYMENT_URL || 'https://nayabharatyojana.in'; // Update this to your actual deployed URL
const token = process.env.REVALIDATION_TOKEN || 'your-revalidation-token'; // Set this in your environment or replace with actual token

// Get the slug from command line arguments if provided
const slug = process.argv[2];

console.log('Sending request to revalidate cache...');
console.log(slug ? `Revalidating specific blog post: ${slug}` : 'Revalidating all blog pages');

// Create the URL with the token and optional slug
const url = new URL('/api/revalidate', deploymentUrl);
url.searchParams.append('token', token);
if (slug) {
  url.searchParams.append('slug', slug);
}

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
console.log('Usage: node revalidate-cache.js [slug]');
console.log('  - Without slug: Revalidates all blog pages');
console.log('  - With slug: Revalidates a specific blog post'); 