-- Add employee email and account tracking fields
ALTER TABLE public.employees
  ADD COLUMN email TEXT,
  ADD COLUMN account_active BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS employees_email_unique ON public.employees(email) WHERE email IS NOT NULL;
