
-- Create allowances table for per-employee named allowances
CREATE TABLE public.allowances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view allowances"
  ON public.allowances FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create allowances"
  ON public.allowances FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update allowances"
  ON public.allowances FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete allowances"
  ON public.allowances FOR DELETE TO authenticated USING (true);
