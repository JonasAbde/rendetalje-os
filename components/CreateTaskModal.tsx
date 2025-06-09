import React, { useState, useEffect } from 'react';
import { Customer, Employee, NewTaskData, TaskCreationData } from '../types';
import { UserCircleIcon, CalendarDaysIcon, ClockIcon, HashtagIcon, DocumentTextIcon, XMarkIcon } from './icons/OutlineIcons';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: TaskCreationData) => void;
  customers: Customer[];
  employees: Employee[];
  defaultDate: string; // YYYY-MM-DD
}

const initialFormData: NewTaskData = {
  customerId: '',
  employeeId: '',
  scheduledDate: '',
  startTime: '09:00',
  estimatedDurationHours: '2',
  notes: '',
};

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  customers,
  employees,
  defaultDate,
}) => {
  const [formData, setFormData] = useState<NewTaskData>({...initialFormData, scheduledDate: defaultDate});
  const [errors, setErrors] = useState<Partial<Record<keyof NewTaskData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({...initialFormData, scheduledDate: defaultDate });
      setErrors({});
    }
  }, [isOpen, defaultDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof NewTaskData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewTaskData, string>> = {};
    if (!formData.customerId) newErrors.customerId = 'Kunde er påkrævet.';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Dato er påkrævet.';
    if (!formData.startTime) newErrors.startTime = 'Starttid er påkrævet.';
    else if (!/^\d{2}:\d{2}$/.test(formData.startTime)) newErrors.startTime = 'Ugyldigt tidsformat (HH:mm).';
    
    const duration = parseFloat(formData.estimatedDurationHours);
    if (formData.estimatedDurationHours === '' || isNaN(duration) || duration <= 0) {
      newErrors.estimatedDurationHours = 'Varighed skal være et positivt tal.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const taskDataToSubmit: TaskCreationData = {
        ...formData,
        estimatedDurationHours: parseFloat(formData.estimatedDurationHours),
        employeeId: formData.employeeId || undefined, // Send undefined if empty string
        notes: formData.notes || undefined,
      };
      onAddTask(taskDataToSubmit);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-brand-secondary bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-brand-surface rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-brand-primary">Opret Ny Opgave</h2>
          <button onClick={onClose} className="text-brand-text-muted hover:text-brand-error transition-colors p-1 rounded-full hover:bg-brand-error/10">
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-brand-text-main mb-1">Kunde <span className="text-brand-error">*</span></label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <UserCircleIcon className="h-5 w-5 text-brand-text-muted" />
              </div>
              <select
                id="customerId"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2.5 border ${errors.customerId ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main`}
              >
                <option value="">Vælg kunde</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {errors.customerId && <p className="mt-1 text-xs text-brand-error">{errors.customerId}</p>}
          </div>

          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-brand-text-main mb-1">Medarbejder (valgfri)</label>
             <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <UserCircleIcon className="h-5 w-5 text-brand-text-muted" />
              </div>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main"
              >
                <option value="">Vælg medarbejder</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-brand-text-main mb-1">Dato <span className="text-brand-error">*</span></label>
              <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <CalendarDaysIcon className="h-5 w-5 text-brand-text-muted" />
                </div>
                <input
                    type="date"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.scheduledDate ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main`}
                />
              </div>
              {errors.scheduledDate && <p className="mt-1 text-xs text-brand-error">{errors.scheduledDate}</p>}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-brand-text-main mb-1">Starttid <span className="text-brand-error">*</span></label>
               <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <ClockIcon className="h-5 w-5 text-brand-text-muted" />
                </div>
                <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.startTime ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main`}
                />
              </div>
              {errors.startTime && <p className="mt-1 text-xs text-brand-error">{errors.startTime}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="estimatedDurationHours" className="block text-sm font-medium text-brand-text-main mb-1">Forventet Varighed (timer) <span className="text-brand-error">*</span></label>
             <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                    <HashtagIcon className="h-5 w-5 text-brand-text-muted" />
                </div>
                <input
                    type="number"
                    id="estimatedDurationHours"
                    name="estimatedDurationHours"
                    value={formData.estimatedDurationHours}
                    onChange={handleChange}
                    min="0.5"
                    step="0.5"
                    placeholder="F.eks. 2.5"
                    className={`block w-full pl-10 pr-3 py-2.5 border ${errors.estimatedDurationHours ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main`}
                />
            </div>
            {errors.estimatedDurationHours && <p className="mt-1 text-xs text-brand-error">{errors.estimatedDurationHours}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-brand-text-main mb-1">Noter (valgfri)</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start">
                    <DocumentTextIcon className="h-5 w-5 text-brand-text-muted" />
                </div>
                <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Særlige instruktioner eller detaljer..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main"
                />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border">
            <button
              type="button"
              onClick={onClose}
              className="bg-brand-surface hover:bg-brand-border text-brand-text-main font-medium py-2.5 px-5 border border-brand-input-border rounded-lg shadow-sm transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              Opret Opgave
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
