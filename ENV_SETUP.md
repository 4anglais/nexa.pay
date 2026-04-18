# Environment Variables

This project uses environment variables to configure the Firebase connection for authentication and database operations.

## Files

- `.env` - Local development environment variables (add to `.gitignore`, never commit)
- `.env.example` - Template showing required variables (safe to commit)

## Setup

1. **For Local Development:**
   - The `.env` file should be configured with your Firebase credentials
   - Ensure all required variables are set
2. **For Netlify Deployment:**
   - Open your Netlify site dashboard
   - Go to **Settings → Environment Variables**
   - Add the following variables with the exact values from your `.env` file:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_MEASUREMENT_ID`

## Naming Convention

Variables with the `VITE_` prefix are exposed to the browser during the build process. This is safe because:

- They are public authentication keys, not secrets
- Firebase is designed to work with public keys in the browser
- Never put your service account credentials here

## Common Issues

**Login fails with "Missing Firebase environment variables"**

- Ensure all `VITE_FIREBASE_*` variables are set on Netlify
- Rebuild your site after adding environment variables
- Clear browser cache and cookies
- Check that the keys are complete and not truncated
