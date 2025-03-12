# Deploying to Cloudflare Pages

This guide explains how to deploy the Next.js application to Cloudflare Pages.

## Prerequisites

- A Cloudflare account
- Access to the GitHub repository

## Deployment Steps

### 1. Connect to Cloudflare Pages

1. Log in to your Cloudflare dashboard
2. Navigate to **Pages**
3. Click **Create a project**
4. Choose **Connect to Git**
5. Select your GitHub repository
6. Click **Begin setup**

### 2. Configure Build Settings

Use these settings for your deployment:

- **Project name**: `nayabharatyojana`
- **Production branch**: `main`
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave as default)

### 3. Environment Variables

Add the following environment variables:

```
# Firebase Admin SDK
FIREBASE_PROJECT_ID=hinidiblog
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@hinidiblog.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCZ1ANouWH3dvVXlqo4bSjtLMbaJigSEJE
NEXT_PUBLIC_FIREBASE_PROJECT_ID=hinidiblog
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hinidiblog.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hinidiblog.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=773076236040
NEXT_PUBLIC_FIREBASE_APP_ID=1:773076236040:web:9c33e47fc6349e2a245ebd
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-PXG47XZWF1

# Next.js Public Config
NEXT_PUBLIC_BASE_URL=https://nayabharatyojana.in

# Revalidation token for clearing cache
REVALIDATION_TOKEN=revalidate_token_a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_REVALIDATION_TOKEN=revalidate_token_a1b2c3d4e5f6g7h8i9j0
```

**Important**: Make sure to mark sensitive variables as "encrypted".

### 4. Custom Domain Setup

1. After deployment, go to your project settings
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain: `nayabharatyojana.in`
5. Follow the DNS configuration instructions

### 5. Recommended Settings

For optimal performance, enable these features in your Cloudflare dashboard:

- Auto Minify (HTML, CSS, and JavaScript)
- Brotli Compression
- Always Use HTTPS
- Early Hints
- HTTP/3 (QUIC)

### 6. Firebase Configuration

1. Add your Cloudflare Pages domain to Firebase Authentication authorized domains
2. Update CORS settings in Firebase Storage to allow your Cloudflare domain
3. Verify Firebase Security Rules for production use

## Troubleshooting

If you encounter issues with the deployment:

1. Check the build logs for errors
2. Verify that all environment variables are correctly set
3. Ensure your Firebase configuration is properly set up
4. Check that your custom domain is properly configured

## Manual Deployment

If you prefer to deploy manually:

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Maintenance

To update your deployment:

1. Push changes to your GitHub repository
2. Cloudflare Pages will automatically deploy the changes
3. Monitor the deployment in the Cloudflare Pages dashboard 