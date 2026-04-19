# NexaPayslips

NexaPayslips is a payroll web app built for businesses. It handles the day-to-day flow of keeping employee records, configuring statutory rates, running payroll, generating payslips.

The project is built with React 19, TanStack Router, Vite, Tailwind CSS, and Firebase. The frontend talks directly to Firebase Auth and Firestore, with an admin client available for server-side when needed.

## What the app does

- Email/password and Google sign-in with Firebase Authentication
- Employee management with salary, allowance, and deduction data
- Company payroll settings for PAYE, NAPSA, and NHIMA rates
- Payroll run screen with a live gross/deductions/net preview
- Payslip history and individual payslip viewing
- QR verification page to confirm whether a payslip is valid (Coming soon)

## Stack

- React 19
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS v4
- shadcn/ui + Radix UI
- Firebase Auth
- Firestore
- Firebase Admin SDK
- Netlify for deployment

## Project structure

```text
src/
  components/                 shared layout and UI pieces
  integrations/firebase/      Firebase client and admin setup
  routes/                     file-based routes
    index.tsx                 landing page
    login.tsx                 sign in / sign up
    verify.tsx                payslip QR verification
    _authenticated/           protected app area
      dashboard.tsx
      employees.*
      payroll.tsx
      payslips.*
      settings.tsx
```

## Running it locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root and add your Firebase values.

Client-side variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Server/admin variables:

```env
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

If you deploy on Netlify, these same values need to be added in the site environment settings.

### 3. Start the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Firebase data the app expects

The current app reads and writes from these Firestore collections:

- `employees`
- `allowances`
- `deductions`
- `payslips`
- `payroll_runs`
- `company_settings`

At minimum, the payroll flow expects:

- employee records with salary details
- a `company_settings` document with payroll rates
- Firebase Authentication enabled for email/password and optionally Google sign-in

## Notes on the current implementation

- The app is strongly oriented around small business payroll terminology and currency (`ZMW`).
- Payslip verification is handled through a signature built into the QR payload.
- There is no test suite wired up yet, so changes are currently validated by running the app and checking flows manually.

## Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
```

## Deployment

This project includes a `netlify.toml` file with:

- build command: `npm run build`
- publish directory: `dist`

Make sure the Firebase environment variables are configured in Netlify before deploying.

## Why this exists

The goal of NexaPayslips is pretty practical: reduce the monthly mess around payroll, keep employee information in one place, and make payslips easier to issue and verify.
