import React, { useState, useEffect, useCallback } from 'react';
import { Employee, EmployeeFormData } from '../types';
import { useEmployees } from '../hooks/useSupabase';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, BanknotesIcon, ArrowUturnLeftIcon, CheckCircleIcon, XMarkIcon } from './icons/OutlineIcons';

interface EmployeeFormProps {
  employeeId?: string; 
  onNavigateBack: () => void;
  showSuccessMessage: (message: string) => void;
}

const initialFormData: EmployeeFormData = {
  name: '',
  email: '',
  phone: '',
  role: 'Rengøringsassistent', 
  hourlyRate: undefined,
};

const InputField: React.FC<{
    id: keyof EmployeeFormData;
    label: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    error?: string;
    min?: string | number;
    step?: string | number;
  }> = ({ id, label, type = "text", placeholder, icon, required, value, onChange, error, min, step }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-main mb-1">
        {label} {required && <span className="text-brand-error">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-brand-text-muted' })}</div>}
        <input
          type={type}
          name={id}
          id={id}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${error ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand-error" id={`${id}-error`}>{error}</p>}
    </div>
  );


export const EmployeeForm: React.FC<EmployeeFormProps> = ({ employeeId, onNavigateBack, showSuccessMessage }) => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { employees, loading, createEmployee, updateEmployee } = useEmployees();
  const isEditMode = Boolean(employeeId);

  useEffect(() => {
    if (isEditMode && employeeId && !loading) {
      const employeeToEdit = employees.find(emp => emp.id === employeeId);
      if (employeeToEdit) {
        const { id, createdAt, ...editableData } = employeeToEdit;
        setFormData(editableData);
      } else {
        setSubmitError(`Medarbejder med ID ${employeeId} blev ikke fundet.`);
      }
    } else if (!isEditMode) {
      setFormData(initialFormData); 
    }
    setSubmitError(null);
    setErrors({});
  }, [employeeId, employees, isEditMode, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
    if (errors[name as keyof EmployeeFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Navn er påkrævet.';
    if (!formData.email.trim()) newErrors.email = 'Email er påkrævet.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ugyldig email adresse.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon er påkrævet.';
    else if (!/^\d{8,}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Ugyldigt telefonnummer (minimum 8 cifre).';
    if (!formData.role.trim()) newErrors.role = 'Stilling er påkrævet.';
    if (formData.hourlyRate !== undefined && formData.hourlyRate < 0) newErrors.hourlyRate = 'Timeløn kan ikke være negativ.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isEditMode && employeeId) {
        await updateEmployee(employeeId, formData);
        showSuccessMessage(`Medarbejder "${formData.name}" er blevet opdateret.`);
      } else {
        const newEmployee = await createEmployee(formData);
        showSuccessMessage(`Medarbejder "${newEmployee.name}" er blevet oprettet.`);
      }
      onNavigateBack();
    } catch (error) {
      console.error("Error submitting employee form:", error);
      setSubmitError(`Der opstod en fejl ved ${isEditMode ? 'opdatering' : 'oprettelse'} af medarbejderen. Prøv igen.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading && isEditMode) {
    return (
      <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-brand-primary/20 rounded w-48"></div>
          <div className="space-y-4">
            <div className="h-12 bg-brand-primary/20 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-brand-primary/20 rounded"></div>
              <div className="h-12 bg-brand-primary/20 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-brand-primary/20 rounded"></div>
              <div className="h-12 bg-brand-primary/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-8 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <InputField 
          id="name" 
          label="Fulde Navn" 
          placeholder="F.eks. Lise Nielsen" 
          icon={<UserCircleIcon />} 
          required 
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField 
            id="email" 
            label="Email Adresse" 
            type="email" 
            placeholder="F.eks. lise@example.com" 
            icon={<EnvelopeIcon />} 
            required 
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <InputField 
            id="phone" 
            label="Telefonnummer" 
            type="tel" 
            placeholder="F.eks. 87654321" 
            icon={<PhoneIcon />} 
            required 
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
           <InputField 
            id="role" 
            label="Stilling" 
            placeholder="F.eks. Rengøringsassistent" 
            icon={<IdentificationIcon />} 
            required 
            value={formData.role}
            onChange={handleChange}
            error={errors.role}
          />
          <InputField 
            id="hourlyRate" 
            label="Timeløn (DKK, valgfri)" 
            type="number" 
            placeholder="F.eks. 180" 
            icon={<BanknotesIcon />} 
            min="0"
            step="1"
            value={formData.hourlyRate}
            onChange={handleChange}
            error={errors.hourlyRate}
          />
        </div>

        {submitError && (
          <div className="mt-6 p-3 bg-red-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-700 text-center">{submitError}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onNavigateBack}
              disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-brand-input-border text-base font-medium rounded-md text-brand-text-main bg-brand-background hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-light transition-colors disabled:opacity-50"
            >
            <ArrowUturnLeftIcon className="w-5 h-5 mr-2"/>
              Annuller
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-brand-text-on-primary bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditMode ? 'Opdaterer...' : 'Opretter...'}
                </>
              ) : (
              <>
                <CheckCircleIcon className="w-5 h-5 mr-2"/>
                {isEditMode ? 'Opdater Medarbejder' : 'Opret Medarbejder'}
              </>
              )}
            </button>
        </div>
      </form>
    </div>
  );
};