import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://timeghcvjpcqejmvjtqo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbWVnaGN2anBjcWVqbXZqdHFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxOTA0ODcsImV4cCI6MjA2NDc2NjQ4N30.M6XNcYxVHb_Gec9lmT8-kOLMAIpaeNYLSR3XPatEmeU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DbCustomer {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  key_location: string | null;
  alarm_code: string | null;
  notes: string | null;
  created_at: string;
  cleaning_type: string;
  frequency: string;
  hourly_rate: number;
}

export interface DbEmployee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  hourly_rate: number | null;
  created_at: string;
}

export interface DbTask {
  id: number;
  scheduled_date: string;
  start_time: string | null;
  estimated_duration_hours: number;
  status: string | null;
  task_type: string | null;
  customer_id: number | null;
  employee_id: number | null;
  customer_name: string | null;
  customer_address: string | null;
  employee_name: string | null;
  actual_duration_hours: number | null;
  notes: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  invoice_generated: boolean;
  invoiced_at: string | null;
  created_at: string;
}

export interface DbBookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zip_city: string;
  sqm: number | null;
  cleaning_type: string | null;
  desired_start_date: string | null;
  frequency_preference: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export interface DbActivityLog {
  id: string;
  type: string;
  description: string;
  related_id: string | null;
  related_type: string | null;
  user_id: string | null;
  metadata: any;
  created_at: string;
}

export interface DbInventory {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_quantity: number;
  supplier: string | null;
  price_per_unit: number | null;
  last_restocked: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInvoice {
  id: string;
  task_id: string;
  customer_id: string;
  customer_name: string;
  customer_address: string;
  task_date: string;
  hours: number;
  hourly_rate: number;
  total_amount: number;
  status: string;
  invoice_number: string;
  issued_date: string;
  due_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
