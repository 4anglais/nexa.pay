
-- Employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  nrc_or_id TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  basic_salary NUMERIC NOT NULL DEFAULT 0,
  allowances NUMERIC NOT NULL DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update employees" ON public.employees FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete employees" ON public.employees FOR DELETE TO authenticated USING (true);

-- Payroll runs table
CREATE TABLE public.payroll_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payroll_runs" ON public.payroll_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create payroll_runs" ON public.payroll_runs FOR INSERT TO authenticated WITH CHECK (true);

-- Payslips table
CREATE TABLE public.payslips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  gross_pay NUMERIC NOT NULL DEFAULT 0,
  total_deductions NUMERIC NOT NULL DEFAULT 0,
  net_pay NUMERIC NOT NULL DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payslips" ON public.payslips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create payslips" ON public.payslips FOR INSERT TO authenticated WITH CHECK (true);

-- Deductions table
CREATE TABLE public.deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view deductions" ON public.deductions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create deductions" ON public.deductions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update deductions" ON public.deductions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete deductions" ON public.deductions FOR DELETE TO authenticated USING (true);

-- Company settings table
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'My Company',
  logo_url TEXT,
  paye_rate NUMERIC NOT NULL DEFAULT 0,
  napsa_rate NUMERIC NOT NULL DEFAULT 5,
  nhima_rate NUMERIC NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view settings" ON public.company_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create settings" ON public.company_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update settings" ON public.company_settings FOR UPDATE TO authenticated USING (true);
