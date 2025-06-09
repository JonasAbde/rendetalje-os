import { useState, useCallback } from 'react';
import { Customer, Employee, Task, CleaningFrequency, CleaningType, TaskStatus, BookingRequest, TaskCreationData, EmployeeFormData, CustomerFormData, RecentActivityItem, RecentActivityType } from '../types';
import { HOURLY_RATE_DKK } from '../constants';
import { UserPlusIcon, UsersIcon, CalendarDaysIcon, PencilSquareIcon, DocumentPlusIcon } from '../components/icons/OutlineIcons'; // For recent activities
import React from 'react';


const MOCK_EMPLOYEES: Employee[] = [
  { 
    id: 'emp1', 
    name: 'Mette Jensen', 
    email: 'mette.jensen@example.com', 
    phone: '11223344', 
    role: 'Rengøringsassistent', 
    hourlyRate: 180, 
    createdAt: new Date(2023, 1, 10, 10, 0, 0).toISOString() 
  },
  { 
    id: 'emp2', 
    name: 'Lars Hansen', 
    email: 'lars.hansen@example.com', 
    phone: '22334455', 
    role: 'Teamleder', 
    hourlyRate: 220, 
    createdAt: new Date(2022, 11, 5, 11, 0, 0).toISOString() 
  },
  { 
    id: 'emp3', 
    name: 'Sofia Petersen', 
    email: 'sofia.petersen@example.com', 
    phone: '33445566', 
    role: 'Rengøringsassistent', 
    hourlyRate: 180, 
    createdAt: new Date(2023, 5, 20, 12, 0, 0).toISOString() 
  },
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'Familien Andersen',
    address: 'Solvej 12, 8000 Aarhus C',
    phone: '12345678',
    email: 'andersen@example.com',
    keyLocation: 'Under måtten ved bagdøren',
    alarmCode: '1234',
    cleaningType: CleaningType.STANDARD,
    frequency: CleaningFrequency.WEEKLY,
    hourlyRate: HOURLY_RATE_DKK,
    notes: 'Husk at vande planterne i stuen.',
    createdAt: new Date(2023, 0, 15, 14, 30, 0).toISOString(),
  },
  {
    id: 'cust2',
    name: 'Kontorfællesskabet Central',
    address: 'Havnegade 5, 8000 Aarhus C',
    phone: '87654321',
    email: 'kontakt@kontorcentral.dk',
    cleaningType: CleaningType.OFFICE,
    frequency: CleaningFrequency.BI_WEEKLY,
    hourlyRate: HOURLY_RATE_DKK,
    notes: 'Fokus på mødelokaler og køkkenområde.',
    createdAt: new Date(2023, 2, 10, 9, 15, 0).toISOString(),
  },
  {
    id: 'cust3',
    name: 'Peter Nielsen',
    address: 'Skovbrynet 33, 8200 Aarhus N',
    phone: '11223344',
    email: 'peter.n@email.dk',
    keyLocation: 'Nøgleboks kode 5566',
    alarmCode: undefined,
    cleaningType: CleaningType.DEEP_CLEAN,
    frequency: CleaningFrequency.ONE_TIME,
    hourlyRate: HOURLY_RATE_DKK,
    createdAt: new Date(2024, 4, 1, 16, 0, 0).toISOString(),
  },
];

const MOCK_TASKS: Task[] = [
  {
    id: 'task1',
    customerId: 'cust1',
    employeeId: 'emp1',
    scheduledDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
    startTime: '09:00',
    estimatedDurationHours: 3,
    actualDurationHours: 3,
    status: TaskStatus.COMPLETED,
    invoiceGenerated: true,
    invoicedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString(), // task created an hour before start
    notes: 'Standard rengøring, alt ok.'
  },
  {
    id: 'task2',
    customerId: 'cust2',
    employeeId: 'emp2',
    scheduledDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], // Yesterday
    startTime: '13:00',
    estimatedDurationHours: 4,
    actualDurationHours: 4.5, // Took a bit longer
    status: TaskStatus.COMPLETED,
    checkInTime: new Date(new Date(Date.now() - 1 * 86400000).setHours(13, 0, 0, 0)).toISOString(),
    checkOutTime: new Date(new Date(Date.now() - 1 * 86400000).setHours(17, 30, 0, 0)).toISOString(),
    invoiceGenerated: false, // Ready for invoicing
    createdAt: new Date(Date.now() - 1 * 86400000 - 3600000).toISOString(),
  },
  {
    id: 'task3',
    customerId: 'cust3',
    employeeId: 'emp1',
    scheduledDate: new Date().toISOString().split('T')[0], // Today
    startTime: '10:00',
    estimatedDurationHours: 5,
    status: TaskStatus.PLANNED,
    invoiceGenerated: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // created 2 hours ago
  },
   {
    id: 'task4',
    customerId: 'cust1',
    employeeId: 'emp3',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: '10:00',
    estimatedDurationHours: 2.5,
    status: TaskStatus.PLANNED,
    invoiceGenerated: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task5',
    customerId: 'cust2',
    employeeId: 'emp1',
    scheduledDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // 3 days ago
    startTime: '11:00',
    estimatedDurationHours: 3.5,
    actualDurationHours: 3.5,
    status: TaskStatus.COMPLETED,
    invoiceGenerated: false, // Ready for invoicing
    createdAt: new Date(Date.now() - 3 * 86400000 - 3600000).toISOString(),
    notes: 'Kontor rengøring, ekstra opmærksomhed på kantine.'
  },
];

const enrichTasks = (tasks: Task[], customers: Customer[], employees: Employee[]): Task[] => {
  return tasks.map(task => {
    const customer = customers.find(c => c.id === task.customerId);
    const employee = employees.find(e => e.id === task.employeeId);
    return {
      ...task,
      customerName: customer?.name,
      customerAddress: customer?.address,
      employeeName: employee?.name,
    };
  });
};


export const useMockData = () => {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [tasks, setTasks] = useState<Task[]>(() => enrichTasks(MOCK_TASKS, MOCK_CUSTOMERS, MOCK_EMPLOYEES));
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);

  const addBookingRequest = useCallback((requestData: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>) => {
    const newRequest: BookingRequest = {
      ...requestData,
      id: `br-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setBookingRequests(prev => [...prev, newRequest]);
    return newRequest; // Return for dashboard activity
  }, []);

  const addTask = useCallback((taskData: TaskCreationData) => {
    const customer = customers.find(c => c.id === taskData.customerId);
    const employee = employees.find(e => e.id === taskData.employeeId);

    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerName: customer?.name,
      customerAddress: customer?.address,
      employeeName: employee?.name,
      status: TaskStatus.PLANNED,
      invoiceGenerated: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prevTasks => enrichTasks([...prevTasks, newTask], customers, employees));
    return newTask; // Return for dashboard activity
  }, [customers, employees]);

  const addEmployee = useCallback((employeeData: EmployeeFormData) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setEmployees(prev => [...prev, newEmployee]);
    setTasks(currentTasks => enrichTasks(currentTasks, customers, [...employees, newEmployee]));
    return newEmployee; // Return for dashboard activity
  }, [customers, employees]);

  const updateEmployee = useCallback((employeeId: string, employeeData: Partial<EmployeeFormData>) => {
    let updatedEmployee: Employee | null = null;
    setEmployees(prev => 
      prev.map(emp => {
        if (emp.id === employeeId) {
          updatedEmployee = { ...emp, ...employeeData, id: emp.id, createdAt: emp.createdAt };
          return updatedEmployee;
        }
        return emp;
      })
    );
    if (updatedEmployee) {
        setTasks(currentTasks => enrichTasks(currentTasks, customers, employees.map(emp => emp.id === employeeId ? updatedEmployee! : emp) ));
    }
    // For dashboard activity, we might not need to return the employee here,
    // as the specific change (e.g. name update) is not easily captured as a single "activity" string.
  }, [customers, employees]);

  const deleteEmployee = useCallback((employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setTasks(prevTasks => enrichTasks(
      prevTasks.map(task => task.employeeId === employeeId ? { ...task, employeeId: undefined, employeeName: undefined } : task),
      customers,
      employees.filter(emp => emp.id !== employeeId)
    ));
  }, [customers, employees]);

  const updateCustomer = useCallback((customerId: string, customerData: Partial<CustomerFormData>) => {
    let updatedCustomer : Customer | null = null;
    setCustomers(prev => 
      prev.map(cust => {
        if (cust.id === customerId) {
          updatedCustomer = { ...cust, ...customerData, id: cust.id, createdAt: cust.createdAt, hourlyRate: HOURLY_RATE_DKK };
          return updatedCustomer;
        }
        return cust;
      })
    );
    if (updatedCustomer) {
      setTasks(currentTasks => enrichTasks(currentTasks, customers.map(cust => cust.id === customerId ? updatedCustomer! : cust), employees));
    }
  }, [employees, customers]);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers(prev => prev.filter(cust => cust.id !== customerId));
    setTasks(prevTasks => enrichTasks(prevTasks.filter(task => task.customerId !== customerId), customers.filter(cust => cust.id !== customerId), employees));
  }, [employees, customers]);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    let updatedTaskFields: Partial<Task> = { status: newStatus };
    if (newStatus === TaskStatus.IN_PROGRESS) {
      updatedTaskFields.checkInTime = new Date().toISOString();
    } else if (newStatus === TaskStatus.COMPLETED) {
      updatedTaskFields.checkOutTime = new Date().toISOString();
      // Ensure actualDurationHours is set, use estimated if not available before this point
      const task = tasks.find(t => t.id === taskId);
      if (task && !task.actualDurationHours) {
        updatedTaskFields.actualDurationHours = task.estimatedDurationHours;
      }
    }
    
    let activityTask: Task | undefined;
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          activityTask = { ...task, ...updatedTaskFields };
          return activityTask;
        }
        return task;
      });
      return enrichTasks(newTasks, customers, employees);
    });
    return activityTask; // Return for dashboard activity
  }, [setTasks, tasks, customers, employees]);

  const updateTaskInvoiceStatus = useCallback((taskId: string, isGenerated: boolean) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === taskId 
        ? { ...task, invoiceGenerated: isGenerated, invoicedAt: isGenerated ? new Date().toISOString() : undefined } 
        : task
      );
      return enrichTasks(newTasks, customers, employees);
    });
  }, [setTasks, customers, employees]);

  const getRecentActivities = useCallback((limit: number = 5): RecentActivityItem[] => {
    const activities: RecentActivityItem[] = [];

    // New Customers
    customers.forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        type: 'new_customer',
        description: `Ny kunde: ${customer.name}`,
        timestamp: customer.createdAt,
        relatedId: customer.id,
        icon: React.createElement(UsersIcon, {className: "w-5 h-5 text-green-500"})
      });
    });

    // New Employees
    employees.forEach(employee => {
      activities.push({
        id: `employee-${employee.id}`,
        type: 'new_employee',
        description: `Ny medarbejder: ${employee.name}`,
        timestamp: employee.createdAt,
        relatedId: employee.id,
        icon: React.createElement(UserPlusIcon, {className: "w-5 h-5 text-blue-500"})
      });
    });
    
    // New Booking Requests
    bookingRequests.forEach(br => {
        activities.push({
            id: `booking-${br.id}`,
            type: 'new_booking_request',
            description: `Ny forespørgsel: ${br.name}`,
            timestamp: br.createdAt,
            relatedId: br.id,
            icon: React.createElement(DocumentPlusIcon, {className: "w-5 h-5 text-yellow-500"})
        })
    })

    // New and Updated Tasks (simple version: just new tasks and completed tasks for now)
    tasks.forEach(task => {
      // For new tasks (could refine this if tasks have a separate "updatedAt")
      activities.push({
        id: `task-created-${task.id}`,
        type: 'new_task',
        description: `Ny opgave: ${task.customerName || 'Ukendt'} (${task.scheduledDate})`,
        timestamp: task.createdAt,
        relatedId: task.id,
        icon: React.createElement(CalendarDaysIcon, {className: "w-5 h-5 text-indigo-500"})
      });

      if (task.status === TaskStatus.COMPLETED && task.checkOutTime) {
        activities.push({
          id: `task-completed-${task.id}`,
          type: 'task_updated',
          description: `Opgave fuldført: ${task.customerName || 'Ukendt'}`,
          timestamp: task.checkOutTime,
          relatedId: task.id,
          icon: React.createElement(PencilSquareIcon, {className: "w-5 h-5 text-purple-500"})
        });
      }
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);
  }, [customers, employees, tasks, bookingRequests]);


  return {
    customers,
    setCustomers, // Keep for potential direct manipulation if ever needed
    employees,
    setEmployees, // Keep for potential direct manipulation
    tasks,
    setTasks, // Includes task status updates, handled by updateTaskStatus now
    bookingRequests,
    setBookingRequests,
    addBookingRequest,
    addTask,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateCustomer,
    deleteCustomer,
    updateTaskStatus,
    updateTaskInvoiceStatus,
    getRecentActivities,
  };
};