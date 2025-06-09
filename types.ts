export enum CleaningFrequency {
  WEEKLY = "Ugentlig",
  BI_WEEKLY = "Hver 14. dag",
  MONTHLY = "Månedlig",
  ONE_TIME = "Engangs",
}

export enum CleaningType {
  STANDARD = "Standard",
  DEEP_CLEAN = "Dybdegående",
  OFFICE = "Kontor",
  MOVE_OUT = "Flytterengøring",
}

export enum TaskStatus {
  PLANNED = "Planlagt",
  IN_PROGRESS = "I gang",
  COMPLETED = "Fuldført",
  CANCELLED = "Annulleret",
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  keyLocation?: string;
  alarmCode?: string;
  cleaningType: CleaningType;
  frequency: CleaningFrequency;
  hourlyRate: number; // Fixed at 349 DKK as per requirement
  notes?: string;
  createdAt: string; // ISO Date string
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string; // F.eks. "Rengøringsassistent", "Teamleder"
  hourlyRate?: number;
  createdAt: string; // ISO Date string
}

export interface Task {
  id: string;
  customerId: string;
  customerName?: string; // Denormalized for easier display
  customerAddress?: string; // Denormalized for easier display
  employeeId?: string;
  employeeName?: string; // Denormalized
  scheduledDate: string; // ISO Date string (YYYY-MM-DD)
  startTime: string; // HH:mm format
  estimatedDurationHours: number;
  actualDurationHours?: number;
  status: TaskStatus;
  notes?: string;
  checkInTime?: string; // ISO Date string
  checkOutTime?: string; // ISO Date string
  invoiceGenerated: boolean;
  invoicedAt?: string; // ISO Date string, when the invoice was generated
  createdAt: string; // ISO Date string
}

export interface BookingRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zipCity: string; // Added for combined zip and city
  sqm?: number; // Made optional as it might not always be known
  cleaningType: CleaningType;
  desiredStartDate: string; // ISO Date string
  frequencyPreference?: CleaningFrequency;
  message?: string;
  status: "pending" | "contacted" | "converted_to_customer" | "rejected";
  createdAt: string; // ISO Date string
}

export interface Invoice {
  id: string;
  taskId: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  taskDate: string;
  hours: number;
  hourlyRate: number;
  totalAmount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  invoiceNumber: string;
  issuedDate: string;
  dueDate: string;
  notes?: string;
  createdAt: string;
}

// For UI state, not a persisted entity usually
export type ActiveView =
  | "dashboard"
  | "tasks" // Planlægning (eksisterende TaskOverview)
  | "customers" // Kundeliste (eksisterende CustomerList)
  | "customer_edit" // Rediger Kunde
  | "booking_form" // Opret Kunde Forespørgsel (eksisterende BookingForm)
  | "booking_requests" // Liste over booking requests/forespørgsler
  | "employee_list"
  | "employee_create" // Vil bruge EmployeeForm
  | "employee_edit" // Vil bruge EmployeeForm
  | "invoicing" // Økonomi
  | "reports_overview"
  | "settings_general"
  | "logout";

export interface NewTaskData {
  customerId: string;
  employeeId?: string;
  scheduledDate: string;
  startTime: string;
  estimatedDurationHours: string; // String for input, parse to number later
  notes?: string;
}

export interface TaskCreationData {
  customerId: string;
  employeeId?: string;
  scheduledDate: string;
  startTime: string;
  estimatedDurationHours: number;
  notes?: string;
}

export type EmployeeFormData = Omit<Employee, "id" | "createdAt">;
export type CustomerFormData = Omit<
  Customer,
  "id" | "createdAt" | "hourlyRate"
>; // hourlyRate er fixed for customers for nu

export type RecentActivityType =
  | "new_customer"
  | "new_task"
  | "task_updated"
  | "new_employee"
  | "new_booking_request";

export interface RecentActivityItem {
  id: string;
  type: RecentActivityType;
  description: string;
  timestamp: string; // ISO Date string
  relatedId?: string; // ID of customer, task, employee etc.
  icon?: React.ReactNode; // Optional: specific icon for the activity type
}
