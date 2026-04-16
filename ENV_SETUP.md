# Environment Variables

This project uses environment variables to configure the Supabase connection for authentication and database operations.

## Files

- `.env` - Local development environment variables (add to `.gitignore`, never commit)
- `.env.example` - Template showing required variables (safe to commit)

## Setup

1. **For Local Development:**
   - The `.env` file is already configured with your Supabase credentials
   - No action needed for local development

2. **For Netlify Deployment:**
   - Open your Netlify site dashboard
   - Go to **Settings → Environment Variables**
   - Add two variables with the exact values from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`

## Naming Convention

Variables with the `VITE_` prefix are exposed to the browser during the build process. This is safe because:
- They are public authentication keys, not secrets
- Supabase is designed to work with public anon keys in the browser
- Never put your service role key or admin secrets here

## Common Issues

**Login fails with "Missing Supabase environment variables"**
- Ensure both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set on Netlify
- Rebuild your site after adding environment variables
- Clear browser cache and cookies
- Check that the keys are complete and not truncated
