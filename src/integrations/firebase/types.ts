export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Allowance {
  id: string;
  employee_id: string;
  type: string;
  amount: number;
  created_at: string;
}

export interface CompanySetting {
  id: string;
  company_name: string;
  paye_rate: number;
  napsa_rate: number;
  nhima_rate: number;
  logo_url: string | null;
  created_at: string;
}

export interface Deduction {
  id: string;
  employee_id: string;
  type: string;
  amount: number;
  created_at: string;
}

export interface Employee {
  id: string;
  full_name: string;
  nrc_or_id: string;
  position: string;
  department: string;
  basic_salary: number;
  allowances: number;
  bank_name: string | null;
  account_number: string | null;
  email: string | null;
  account_active: boolean;
  created_at: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  created_at: string;
}

export interface Payslip {
  id: string;
  employee_id: string;
  payroll_run_id: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  pdf_url: string | null;
  created_at: string;
}

export interface Database {
  allowances: Allowance;
  company_settings: CompanySetting;
  deductions: Deduction;
  employees: Employee;
  payroll_runs: PayrollRun;
  payslips: Payslip;
}
