import { useState, useEffect } from "react";
import {
  supabase,
  DbCustomer,
  DbEmployee,
  DbTask,
  DbBookingRequest,
  DbActivityLog,
  DbInventory,
  DbInvoice,
} from "../lib/supabase";
import {
  Customer,
  Employee,
  Task,
  BookingRequest,
  RecentActivityItem,
  Invoice,
} from "../types";

// Konverter database typer til app typer
const convertDbCustomerToCustomer = (dbCustomer: DbCustomer): Customer => ({
  id: dbCustomer.id.toString(),
  name: dbCustomer.name,
  address: dbCustomer.address || "",
  phone: dbCustomer.phone || "",
  email: dbCustomer.email || "",
  keyLocation: dbCustomer.key_location || undefined,
  alarmCode: dbCustomer.alarm_code || undefined,
  cleaningType: dbCustomer.cleaning_type as any,
  frequency: dbCustomer.frequency as any,
  hourlyRate: dbCustomer.hourly_rate,
  notes: dbCustomer.notes || undefined,
  createdAt: dbCustomer.created_at,
});

const convertDbEmployeeToEmployee = (dbEmployee: DbEmployee): Employee => ({
  id: dbEmployee.id.toString(),
  name: dbEmployee.name,
  email: dbEmployee.email || "",
  phone: dbEmployee.phone || "",
  role: dbEmployee.role || "Rengøringsassistent",
  hourlyRate: dbEmployee.hourly_rate || undefined,
  createdAt: dbEmployee.created_at,
});

const convertDbTaskToTask = (dbTask: DbTask): Task => ({
  id: dbTask.id.toString(),
  customerId: dbTask.customer_id?.toString() || "",
  customerName: dbTask.customer_name || undefined,
  customerAddress: dbTask.customer_address || undefined,
  employeeId: dbTask.employee_id?.toString(),
  employeeName: dbTask.employee_name || undefined,
  scheduledDate: dbTask.scheduled_date,
  startTime: dbTask.start_time || "09:00",
  estimatedDurationHours: dbTask.estimated_duration_hours,
  actualDurationHours: dbTask.actual_duration_hours || undefined,
  status: (dbTask.status as any) || "PLANNED",
  notes: dbTask.notes || undefined,
  checkInTime: dbTask.check_in_time || undefined,
  checkOutTime: dbTask.check_out_time || undefined,
  invoiceGenerated: dbTask.invoice_generated,
  invoicedAt: dbTask.invoiced_at || undefined,
  createdAt: dbTask.created_at,
});

const convertDbBookingRequestToBookingRequest = (
  dbRequest: DbBookingRequest
): BookingRequest => ({
  id: dbRequest.id,
  name: dbRequest.name,
  phone: dbRequest.phone,
  email: dbRequest.email,
  address: dbRequest.address,
  zipCity: dbRequest.zip_city,
  sqm: dbRequest.sqm || undefined,
  cleaningType: (dbRequest.cleaning_type as any) || "STANDARD",
  desiredStartDate: dbRequest.desired_start_date || new Date().toISOString(),
  frequencyPreference: dbRequest.frequency_preference as any,
  message: dbRequest.message || undefined,
  status: dbRequest.status as any,
  createdAt: dbRequest.created_at,
});

const convertDbInvoiceToInvoice = (dbInvoice: DbInvoice): Invoice => ({
  id: dbInvoice.id,
  taskId: dbInvoice.task_id,
  customerId: dbInvoice.customer_id,
  customerName: dbInvoice.customer_name || "Ukendt kunde",
  customerAddress: dbInvoice.customer_address || "Adresse mangler",
  taskDate: dbInvoice.task_date || new Date().toISOString().split("T")[0],
  hours: dbInvoice.hours || 0,
  hourlyRate: dbInvoice.hourly_rate || 349,
  totalAmount: dbInvoice.total_amount,
  status: (dbInvoice.status as any) || "draft",
  invoiceNumber: dbInvoice.invoice_number,
  issuedDate: dbInvoice.issued_date || new Date().toISOString().split("T")[0],
  dueDate: dbInvoice.due_date,
  notes: dbInvoice.notes || undefined,
  createdAt: dbInvoice.created_at,
});

// Hook til at hente kunder
export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCustomers(data.map(convertDbCustomerToCustomer));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af kunder"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) throw error;

      // Opdater lokal state
      setCustomers((prev) =>
        prev.filter((customer) => customer.id !== customerId)
      );
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved sletning af kunde";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateCustomer = async (
    customerId: string,
    updates: Partial<Customer>
  ) => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          cleaning_type: updates.cleaningType,
          frequency: updates.frequency,
          key_location: updates.keyLocation,
          alarm_code: updates.alarmCode,
          notes: updates.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId)
        .select()
        .single();

      if (error) throw error;

      // Opdater lokal state
      const updatedCustomer = convertDbCustomerToCustomer(data);
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === customerId ? updatedCustomer : customer
        )
      );

      return updatedCustomer;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved opdatering af kunde";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    customers,
    loading,
    error,
    refetch: fetchCustomers,
    deleteCustomer,
    updateCustomer,
  };
};

// Hook til at hente medarbejdere
export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEmployees(data.map(convertDbEmployeeToEmployee));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af medarbejdere"
      );
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (employeeData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    hourlyRate?: number;
  }) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert({
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          role: employeeData.role,
          hourly_rate: employeeData.hourlyRate || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newEmployee = convertDbEmployeeToEmployee(data);
      setEmployees((prev) => [newEmployee, ...prev]);
      return newEmployee;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved oprettelse af medarbejder";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEmployee = async (
    employeeId: string,
    updates: Partial<{
      name: string;
      email: string;
      phone: string;
      role: string;
      hourlyRate?: number;
    }>
  ) => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          role: updates.role,
          hourly_rate: updates.hourlyRate || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", employeeId)
        .select()
        .single();

      if (error) throw error;

      const updatedEmployee = convertDbEmployeeToEmployee(data);
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === employeeId ? updatedEmployee : employee
        )
      );

      return updatedEmployee;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved opdatering af medarbejder";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      setEmployees((prev) =>
        prev.filter((employee) => employee.id !== employeeId)
      );
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved sletning af medarbejder";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
};

// Hook til at hente opgaver
export const useTasks = (dateFilter?: { start: string; end: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [dateFilter]);

  const fetchTasks = async () => {
    try {
      let query = supabase.from("tasks").select("*");

      if (dateFilter) {
        query = query
          .gte("scheduled_date", dateFilter.start)
          .lte("scheduled_date", dateFilter.end);
      }

      const { data, error } = await query.order("scheduled_date", {
        ascending: true,
      });

      if (error) throw error;

      setTasks(data.map(convertDbTaskToTask));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af opgaver"
      );
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    customerId: string;
    employeeId?: string;
    scheduledDate: string;
    startTime: string;
    estimatedDurationHours: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          customer_id: taskData.customerId,
          employee_id: taskData.employeeId || null,
          scheduled_date: taskData.scheduledDate,
          start_time: taskData.startTime,
          estimated_duration_hours: taskData.estimatedDurationHours,
          notes: taskData.notes || null,
          status: "planned",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newTask = convertDbTaskToTask(data);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved oprettelse af opgave";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          status,
          updated_at: new Date().toISOString(),
          ...(status === "completed" && {
            actual_duration_hours: 1, // TODO: Get from UI
            completed_at: new Date().toISOString(),
          }),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = convertDbTaskToTask(data);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved opdatering af opgave";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved sletning af opgave";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const markTaskAsInvoiced = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          invoice_generated: true,
          invoiced_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = convertDbTaskToTask(data);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
      return updatedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved markering som faktureret";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
    markTaskAsInvoiced,
  };
};

// Hook til at hente booking requests
export const useBookingRequests = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setBookingRequests(data.map(convertDbBookingRequestToBookingRequest));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Fejl ved hentning af forespørgsler"
      );
    } finally {
      setLoading(false);
    }
  };

  const createBookingRequest = async (requestData: {
    name: string;
    phone: string;
    email: string;
    address: string;
    zipCity: string;
    sqm?: number;
    cleaningType: string;
    desiredStartDate: string;
    frequencyPreference?: string;
    message?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .insert({
          name: requestData.name,
          phone: requestData.phone,
          email: requestData.email,
          address: requestData.address,
          zip_city: requestData.zipCity,
          sqm: requestData.sqm || null,
          cleaning_type: requestData.cleaningType,
          desired_start_date: requestData.desiredStartDate,
          frequency_preference: requestData.frequencyPreference || null,
          message: requestData.message || null,
          status: "pending",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newRequest = convertDbBookingRequestToBookingRequest(data);
      setBookingRequests((prev) => [newRequest, ...prev]);
      return newRequest;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved oprettelse af forespørgsel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateBookingRequestStatus = async (
    requestId: string,
    status: "pending" | "contacted" | "converted_to_customer" | "rejected"
  ) => {
    try {
      const { data, error } = await supabase
        .from("booking_requests")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

      if (error) throw error;

      const updatedRequest = convertDbBookingRequestToBookingRequest(data);
      setBookingRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? updatedRequest : request
        )
      );

      return updatedRequest;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved opdatering af forespørgsel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteBookingRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("booking_requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setBookingRequests((prev) =>
        prev.filter((request) => request.id !== requestId)
      );
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Fejl ved sletning af forespørgsel";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    bookingRequests,
    loading,
    error,
    refetch: fetchBookingRequests,
    createBookingRequest,
    updateBookingRequestStatus,
    deleteBookingRequest,
  };
};

// Hook til at hente aktivitetslog
export const useActivityLog = (limit: number = 10) => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [limit]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setActivities(
        data.map((log: DbActivityLog) => ({
          id: log.id,
          type: log.type as any,
          description: log.description,
          timestamp: log.created_at,
          relatedId: log.related_id || undefined,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af aktiviteter"
      );
    } finally {
      setLoading(false);
    }
  };

  return { activities, loading, error, refetch: fetchActivities };
};

// Hook til at hente lager status
export const useInventory = () => {
  const [inventory, setInventory] = useState<DbInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;

      setInventory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af lager"
      );
    } finally {
      setLoading(false);
    }
  };

  return { inventory, loading, error, refetch: fetchInventory };
};

// Hook til fakturering
export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInvoices(data.map(convertDbInvoiceToInvoice));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af fakturaer"
      );
    } finally {
      setLoading(false);
    }
  };

  const createInvoiceFromTask = async (taskId: string) => {
    try {
      // Hent task details
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select(
          `
          *,
          customers (id, name, address, hourly_rate)
        `
        )
        .eq("id", taskId)
        .single();

      if (taskError) throw taskError;
      if (!taskData || !taskData.customers)
        throw new Error("Task eller kunde ikke fundet");

      const task = convertDbTaskToTask(taskData);
      const customer = taskData.customers;

      // Generer fakturanummer (F-YYYYMMDD-XXXX)
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      const randomNum = Math.floor(Math.random() * 9999)
        .toString()
        .padStart(4, "0");
      const invoiceNumber = `F-${dateStr}-${randomNum}`;

      // Beregn beløb
      const hours = task.actualDurationHours || task.estimatedDurationHours;
      const hourlyRate = customer.hourly_rate;
      const totalAmount = hours * hourlyRate;

      // Lav due date (14 dage frem)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          task_id: taskId,
          customer_id: customer.id,
          customer_name: customer.name,
          customer_address: customer.address,
          task_date: task.scheduledDate,
          hours: hours,
          hourly_rate: hourlyRate,
          total_amount: totalAmount,
          amount: totalAmount * 0.8, // før moms
          vat_amount: totalAmount * 0.2, // 25% moms
          status: "draft",
          invoice_number: invoiceNumber,
          issued_date: today.toISOString().split("T")[0],
          due_date: dueDate.toISOString().split("T")[0],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Opdater task som faktureret
      await supabase
        .from("tasks")
        .update({
          invoice_generated: true,
          invoiced_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      const newInvoice = convertDbInvoiceToInvoice(data);
      setInvoices((prev) => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved oprettelse af faktura";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateInvoiceStatus = async (
    invoiceId: string,
    status: "draft" | "sent" | "paid" | "overdue"
  ) => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({
          status,
          paid_date:
            status === "paid" ? new Date().toISOString().split("T")[0] : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .select()
        .single();

      if (error) throw error;

      const updatedInvoice = convertDbInvoiceToInvoice(data);
      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice.id === invoiceId ? updatedInvoice : invoice
        )
      );

      return updatedInvoice;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved opdatering af faktura";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (error) throw error;

      setInvoices((prev) => prev.filter((invoice) => invoice.id !== invoiceId));
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved sletning af faktura";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    createInvoiceFromTask,
    updateInvoiceStatus,
    deleteInvoice,
  };
};

// Hook til dashboard statistik
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeEmployees: 0,
    tasksToday: 0,
    tasksThisWeek: 0,
    pendingBookings: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Hent kunde antal
      const { count: customerCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      // Hent medarbejder antal
      const { count: employeeCount } = await supabase
        .from("employees")
        .select("*", { count: "exact", head: true });

      // Hent opgaver i dag
      const today = new Date().toISOString().split("T")[0];
      const { count: todayTaskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", today);

      // Hent opgaver denne uge
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const { count: weekTaskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_date", weekStart.toISOString().split("T")[0])
        .lte("scheduled_date", weekEnd.toISOString().split("T")[0]);

      // Hent ventende forespørgsler
      const { count: pendingCount } = await supabase
        .from("booking_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Beregn månedlig omsætning (simpel estimat baseret på opgaver)
      const monthStart = new Date();
      monthStart.setDate(1);
      const { data: monthTasks } = await supabase
        .from("tasks")
        .select("estimated_duration_hours")
        .gte("scheduled_date", monthStart.toISOString().split("T")[0])
        .eq("status", "Fuldført");

      const monthlyRevenue =
        monthTasks?.reduce(
          (sum, task) => sum + task.estimated_duration_hours * 349,
          0
        ) || 0;

      setStats({
        totalCustomers: customerCount || 0,
        activeEmployees: employeeCount || 0,
        tasksToday: todayTaskCount || 0,
        tasksThisWeek: weekTaskCount || 0,
        pendingBookings: pendingCount || 0,
        monthlyRevenue,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af statistik"
      );
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
};

export interface ReportsData {
  monthlyRevenue: { month: string; revenue: number; tasks: number }[];
  topCustomers: { name: string; revenue: number; tasks: number }[];
  employeePerformance: {
    name: string;
    hours: number;
    tasks: number;
    efficiency: number;
  }[];
  tasksByCategory: { category: string; count: number; percentage: number }[];
  inventoryAlerts: {
    item: string;
    current: number;
    minimum: number;
    status: "low" | "critical";
  }[];
  weeklyTrends: {
    week: string;
    newCustomers: number;
    completedTasks: number;
    revenue: number;
  }[];
}

export const useReportsData = () => {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Hent månedlig omsætning data
        const { data: monthlyTasks, error: monthlyError } = await supabase
          .from("tasks")
          .select(
            `
            created_at,
            estimated_hours,
            customers (
              hourly_rate
            )
          `
          )
          .gte(
            "created_at",
            new Date(new Date().getFullYear(), 0, 1).toISOString()
          );

        if (monthlyError) throw monthlyError;

        // Beregn månedlig data
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
          const month = new Date(2024, i, 1);
          const monthStr = month.toLocaleDateString("da-DK", {
            month: "short",
          });

          const monthTasks =
            monthlyTasks?.filter((task) => {
              const taskDate = new Date(task.created_at);
              return (
                taskDate.getMonth() === i && taskDate.getFullYear() === 2024
              );
            }) || [];

          const revenue = monthTasks.reduce((sum, task) => {
            const customer = task.customers as any;
            const rate = customer?.hourly_rate || 250;
            return sum + task.estimated_hours * rate;
          }, 0);

          return {
            month: monthStr,
            revenue: Math.round(revenue),
            tasks: monthTasks.length,
          };
        });

        // Hent top kunder
        const { data: customers, error: customersError } = await supabase.from(
          "customers"
        ).select(`
            name,
            hourly_rate,
            tasks (
              estimated_hours,
              status
            )
          `);

        if (customersError) throw customersError;

        const topCustomers =
          customers
            ?.map((customer) => {
              const completedTasks =
                customer.tasks?.filter((task) => task.status === "completed") ||
                [];
              const totalHours = completedTasks.reduce(
                (sum, task) => sum + task.estimated_hours,
                0
              );
              const revenue = totalHours * (customer.hourly_rate || 250);

              return {
                name: customer.name,
                revenue: Math.round(revenue),
                tasks: completedTasks.length,
              };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5) || [];

        // Hent medarbejder performance
        const { data: employees, error: employeesError } = await supabase.from(
          "employees"
        ).select(`
            first_name,
            last_name,
            tasks (
              estimated_hours,
              status,
              created_at
            )
          `);

        if (employeesError) throw employeesError;

        const employeePerformance =
          employees
            ?.map((employee) => {
              const completedTasks =
                employee.tasks?.filter((task) => task.status === "completed") ||
                [];
              const totalHours = completedTasks.reduce(
                (sum, task) => sum + task.estimated_hours,
                0
              );
              const efficiency =
                completedTasks.length > 0
                  ? Math.round((totalHours / completedTasks.length) * 100) / 100
                  : 0;

              return {
                name: `${employee.first_name} ${employee.last_name}`,
                hours: totalHours,
                tasks: completedTasks.length,
                efficiency: efficiency,
              };
            })
            .sort((a, b) => b.hours - a.hours) || [];

        // Hent opgaver kategorier
        const { data: allTasks, error: tasksError } = await supabase
          .from("tasks")
          .select("category, status");

        if (tasksError) throw tasksError;

        const categoryStats =
          allTasks?.reduce((acc, task) => {
            const category = task.category || "Andet";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

        const totalTasks = allTasks?.length || 1;
        const tasksByCategory = Object.entries(categoryStats).map(
          ([category, count]) => ({
            category,
            count,
            percentage: Math.round((count / totalTasks) * 100),
          })
        );

        // Hent lager alerts
        const { data: inventory, error: inventoryError } = await supabase
          .from("inventory")
          .select("*")
          .or("current_stock.lt.minimum_stock,current_stock.lt.10");

        if (inventoryError) throw inventoryError;

        const inventoryAlerts =
          inventory?.map((item) => ({
            item: item.item_name,
            current: item.current_stock,
            minimum: item.minimum_stock,
            status:
              item.current_stock <= item.minimum_stock
                ? ("critical" as const)
                : ("low" as const),
          })) || [];

        // Ugentlige trends (sidste 8 uger)
        const weeksAgo8 = new Date();
        weeksAgo8.setDate(weeksAgo8.getDate() - 56);

        const { data: recentTasks, error: recentTasksError } = await supabase
          .from("tasks")
          .select("created_at, estimated_hours")
          .gte("created_at", weeksAgo8.toISOString());

        const { data: recentCustomers, error: recentCustomersError } =
          await supabase
            .from("customers")
            .select("created_at")
            .gte("created_at", weeksAgo8.toISOString());

        if (recentTasksError) throw recentTasksError;
        if (recentCustomersError) throw recentCustomersError;

        const weeklyTrends = Array.from({ length: 8 }, (_, i) => {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7 * (7 - i));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);

          const weekTasks =
            recentTasks?.filter((task) => {
              const taskDate = new Date(task.created_at);
              return taskDate >= weekStart && taskDate < weekEnd;
            }) || [];

          const weekCustomers =
            recentCustomers?.filter((customer) => {
              const customerDate = new Date(customer.created_at);
              return customerDate >= weekStart && customerDate < weekEnd;
            }) || [];

          const revenue = weekTasks.reduce(
            (sum, task) => sum + task.estimated_hours * 250,
            0
          );

          return {
            week: `Uge ${i + 1}`,
            newCustomers: weekCustomers.length,
            completedTasks: weekTasks.length,
            revenue: Math.round(revenue),
          };
        });

        setReportsData({
          monthlyRevenue,
          topCustomers,
          employeePerformance,
          tasksByCategory,
          inventoryAlerts,
          weeklyTrends,
        });
      } catch (error) {
        console.error("Error fetching reports data:", error);
        setError(error instanceof Error ? error.message : "Ukendt fejl");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsData();
  }, []);

  return { reportsData, loading, error };
};

// Advanced Inventory Management Hooks
export const useInventoryManagement = () => {
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch inventory items
      const { data: itemsData, error: itemsError } = await supabase
        .from("inventory")
        .select("*")
        .order("item_name");

      if (itemsError) throw itemsError;

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("inventory_transactions")
          .select(
            `
          *,
          inventory (item_name),
          employees (first_name, last_name)
        `
          )
          .order("created_at", { ascending: false })
          .limit(50);

      // Fetch active alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("inventory_alerts")
        .select(
          `
          *,
          inventory (item_name, unit)
        `
        )
        .eq("is_resolved", false)
        .order("created_at", { ascending: false });

      setItems(itemsData || []);
      setTransactions(transactionsData || []);
      setAlerts(alertsData || []);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      setError(
        err instanceof Error ? err.message : "Fejl ved hentning af lager data"
      );
    } finally {
      setLoading(false);
    }
  };

  const restockItem = async (
    itemId: string,
    quantity: number,
    costPerUnit?: number,
    notes?: string
  ) => {
    try {
      // Update item stock
      const { data: item, error: updateError } = await supabase
        .from("inventory")
        .update({
          quantity: `quantity + ${quantity}`,
          last_restocked: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert({
          inventory_item_id: itemId,
          type: "restock",
          quantity,
          cost_total: costPerUnit ? costPerUnit * quantity : null,
          notes,
          created_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchInventoryData();
      return item;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved genopfyldning";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const recordUsage = async (
    itemId: string,
    quantity: number,
    taskId?: string,
    notes?: string
  ) => {
    try {
      // Check if enough stock
      const { data: item, error: checkError } = await supabase
        .from("inventory")
        .select("quantity, item_name")
        .eq("id", itemId)
        .single();

      if (checkError) throw checkError;
      if (item.quantity < quantity) {
        throw new Error(`Ikke nok på lager. Tilgængelig: ${item.quantity}`);
      }

      // Update stock
      const { error: updateError } = await supabase
        .from("inventory")
        .update({
          quantity: `quantity - ${quantity}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", itemId);

      if (updateError) throw updateError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from("inventory_transactions")
        .insert({
          inventory_item_id: itemId,
          type: "usage",
          quantity: -quantity, // Negative for usage
          task_id: taskId,
          notes,
          created_at: new Date().toISOString(),
        });

      if (transactionError) throw transactionError;

      // Check for low stock alert
      await checkAndCreateAlert(itemId);

      // Refresh data
      await fetchInventoryData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved registrering af forbrug";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const addInventoryItem = async (itemData: {
    item_name: string;
    category: string;
    notes?: string;
    quantity: number;
    minimum_quantity: number;
    unit: string;
    price_per_unit: number;
    supplier?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("inventory")
        .insert({
          ...itemData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await fetchInventoryData();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved tilføjelse af vare";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const checkAndCreateAlert = async (itemId: string) => {
    try {
      const { data: item, error } = await supabase
        .from("inventory")
        .select("quantity, minimum_quantity, item_name")
        .eq("id", itemId)
        .single();

      if (error) throw error;

      if (item.quantity <= item.minimum_quantity) {
        // Check if alert already exists
        const { data: existingAlert } = await supabase
          .from("inventory_alerts")
          .select("id")
          .eq("inventory_item_id", itemId)
          .eq("is_resolved", false)
          .eq("alert_type", "low_stock")
          .single();

        if (!existingAlert) {
          await supabase.from("inventory_alerts").insert({
            inventory_item_id: itemId,
            alert_type: item.quantity === 0 ? "out_of_stock" : "low_stock",
            threshold_value: item.minimum_quantity,
            current_value: item.quantity,
            is_resolved: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Error checking alerts:", err);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("inventory_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;

      await fetchInventoryData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Fejl ved løsning af alert";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    items,
    transactions,
    alerts,
    loading,
    error,
    refetch: fetchInventoryData,
    restockItem,
    recordUsage,
    addInventoryItem,
    resolveAlert,
  };
};
