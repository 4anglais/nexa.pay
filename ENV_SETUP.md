# Environment Variables

This project uses environment variables for Firebase client auth, server auth, Firestore, and Storage access.

## Files

- `.env` - local environment values for development; never commit this file
- `.env.example` - safe template showing the required variable names only

## Setup

1. For local development:
   Copy `.env.example` to `.env` and fill in your Firebase project values.
2. For Netlify deployment:
   Open the site dashboard and add the same variables under `Settings -> Environment variables`.

## Required Variables

Client-exposed values:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

Server-only values:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_MEASUREMENT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## What Should Not Be Published

- Do not commit `.env`
- Do not place real env values in `netlify.toml`, docs, or source files
- Do not expose `FIREBASE_CLIENT_EMAIL` or `FIREBASE_PRIVATE_KEY` in browser code

## Notes

- `VITE_` variables are intentionally exposed to the browser by Vite. These are configuration values, not secrets.
- Non-`VITE_` variables are server-only and must stay out of client bundles.
- Firebase project identifiers were previously hardcoded in source and deployment comments; those values should now live only in `.env` and your hosting provider's secret settings.

## Common Issues

If login or server auth fails:

- confirm every required `VITE_FIREBASE_*` variable is present
- confirm every required `FIREBASE_*` variable is present
- rebuild after changing environment variables
- for `FIREBASE_PRIVATE_KEY`, preserve newlines or use escaped `\n` line breaks
