# NexaPayslip Deployment Guide

## Environment Variables Setup

### Local Development
Your `.env` file already contains the necessary Supabase credentials. These environment variables use the `VITE_` prefix to ensure they're available in the browser during build time.

```env
VITE_SUPABASE_URL=https://vqvobiisdwidviiqcqio.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Netlify Deployment

When deploying to Netlify, you **must** add these environment variables in the Netlify UI:

1. Go to your Netlify site Dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Add the following variables with their exact values:

| Variable Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://vqvobiisdwidviiqcqio.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Copy from `.env` file |

**Important:** The `VITE_` prefix is required because:
- Vite uses this prefix to identify which variables should be embedded in the build
- These variables are safe to expose in the browser (they're public keys)
- Without this prefix, the Supabase client cannot access them during login

### Troubleshooting Login Errors

If you see "Missing Supabase environment variables" error:
1. Ensure `VITE_SUPABASE_URL` is set in Netlify environment variables
2. Ensure `VITE_SUPABASE_PUBLISHABLE_KEY` is set in Netlify environment variables
3. Wait 5 minutes after adding variables - Netlify needs to redeploy
4. Clear browser cache and try again
5. Rebuild the site from Netlify UI if needed

## Build Command
```bash
npm run build
```

## Preview Locally
```bash
npm run preview
```
