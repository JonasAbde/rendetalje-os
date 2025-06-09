import React, { useState, useEffect } from 'react';
import { Customer, CustomerFormData, CleaningType, CleaningFrequency } from '../types';
import { CLEANING_TYPE_OPTIONS, CLEANING_FREQUENCY_OPTIONS, HOURLY_RATE_DKK } from '../constants';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, HomeModernIcon, CalendarDaysIcon, TagIcon, ChatBubbleLeftEllipsisIcon, ArrowUturnLeftIcon, KeyIcon, BellAlertIcon, CogIcon, CheckCircleIcon, XMarkIcon } from './icons/OutlineIcons';
import { useCustomers } from '../hooks/useSupabase';

interface CustomerEditFormProps {
  customerId: string;
  onNavigateBack: () => void;
}

// Initial data for the form, derived from Customer but omits id, createdAt, and fixed hourlyRate
const getInitialFormData = (customer?: Customer): CustomerFormData => {
  if (!customer) {
    return {
      name: '',
      phone: '',
      email: '',
      address: '',
      // zipCity is not part of Customer type, but BookingRequest. Let's assume address covers it for Customer.
      keyLocation: '',
      alarmCode: '',
      cleaningType: CleaningType.STANDARD,
      frequency: CleaningFrequency.WEEKLY,
      notes: '',
    };
  }
  const { id, createdAt, hourlyRate, ...editableData } = customer;
  return {
    ...editableData, // Spread all properties from customer
    keyLocation: customer.keyLocation || '', // Ensure empty string if undefined
    alarmCode: customer.alarmCode || '',
    notes: customer.notes || '',
  };
};


const InputField: React.FC<{
    id: keyof CustomerFormData | 'zipCity'; // zipCity is not directly in CustomerFormData, handle as special case or update type
    label: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
    component?: 'input' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
    value: string | number | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    error?: string;
    className?: string;
    disabled?: boolean;
  }> = ({ id, label, type = "text", placeholder, icon, required, component = 'input', options, value, onChange, error, className = '', disabled = false }) => (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-brand-text-main mb-1">
        {label} {required && <span className="text-brand-error">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5 text-brand-text-muted' })}</div>}
        {component === 'input' && 
          <input
            type={type}
            name={id}
            id={id}
            value={String(value || '')}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${error ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted disabled:bg-neutral-100`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        }
        {component === 'textarea' &&
            <textarea
                name={id}
                id={id}
                rows={3}
                value={String(value || '')}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${error ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted disabled:bg-neutral-100`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            />
        }
        {component === 'select' && options &&
            <select
                name={id}
                id={id}
                value={String(value || '')}
                onChange={onChange}
                disabled={disabled}
                className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border ${error ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main disabled:bg-neutral-100`}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
            >
                <option value="">{placeholder || `Vælg ${label.toLowerCase()}`}</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        }
      </div>
      {error && <p className="mt-1 text-xs text-brand-error" id={`${id}-error`}>{error}</p>}
    </div>
  );


export const CustomerEditForm: React.FC<CustomerEditFormProps> = ({ customerId, onNavigateBack }) => {
  const [formData, setFormData] = useState<CustomerFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { customers, updateCustomer, loading } = useCustomers();

  useEffect(() => {
    if (!loading) {
      const customerToEdit = customers.find((cust: Customer) => cust.id === customerId);
    if (customerToEdit) {
      setFormData(getInitialFormData(customerToEdit));
    } else {
      setSubmitError(`Kunde med ID ${customerId} blev ikke fundet.`);
      }
    }
    setSubmitSuccess(false);
    setSubmitError(null);
    setErrors({});
  }, [customerId, customers, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof CustomerFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Navn er påkrævet.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon er påkrævet.';
    else if (!/^\d{8,}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Ugyldigt telefonnummer (minimum 8 cifre).';
    if (!formData.email.trim()) newErrors.email = 'Email er påkrævet.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ugyldig email adresse.';
    if (!formData.address.trim()) newErrors.address = 'Adresse er påkrævet.';
    // No zipCity or sqm validation as they are not part of CustomerFormData for edit currently

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateCustomer(customerId, formData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error updating customer:", error);
      setSubmitError("Der opstod en fejl under opdatering af kunden. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitSuccess) {
    return (
      <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-10 text-center max-w-lg mx-auto">
        <CheckCircleIcon className="w-20 h-20 text-brand-success mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-brand-text-main mb-3">Kundeoplysninger Opdateret!</h2>
        <p className="text-brand-text-muted mb-8">Kundens oplysninger er blevet gemt i systemet.</p>
        <button
          onClick={onNavigateBack}
          className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center mx-auto text-base"
        >
          <ArrowUturnLeftIcon className="w-5 h-5 mr-2"/>
          Tilbage til Kundeoversigt
        </button>
      </div>
    );
  }
  if (submitError && !customers.find((cust: Customer) => cust.id === customerId)) { // If customer not found initially
     return (
      <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-10 text-center max-w-lg mx-auto">
        <XMarkIcon className="w-20 h-20 text-brand-error mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-brand-text-main mb-3">Fejl</h2>
        <p className="text-brand-text-muted mb-8">{submitError}</p>
        <button
          onClick={onNavigateBack}
          className="bg-brand-secondary hover:bg-brand-secondary-dark text-brand-secondary-content font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center mx-auto text-base"
        >
          Tilbage til Kundeoversigt
        </button>
      </div>
    );
  }


  return (
    <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <InputField id="name" label="Fulde Navn" placeholder="F.eks. Jens Hansen" icon={<UserCircleIcon />} required value={formData.name} onChange={handleChange} error={errors.name} />
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField id="phone" label="Telefonnummer" type="tel" placeholder="F.eks. 12345678" icon={<PhoneIcon />} required value={formData.phone} onChange={handleChange} error={errors.phone} />
          <InputField id="email" label="Email Adresse" type="email" placeholder="F.eks. jens@example.com" icon={<EnvelopeIcon />} required value={formData.email} onChange={handleChange} error={errors.email}/>
        </div>
        
        <InputField id="address" label="Adresse" placeholder="F.eks. Hovedgaden 12, Lejlighed 3, 8000 Aarhus C" icon={<MapPinIcon />} required value={formData.address} onChange={handleChange} error={errors.address} />
        
         <hr className="my-2 border-brand-border"/>
         <h3 className="text-md font-semibold text-brand-text-main mb-0">Rengøringsdetaljer</h3>


        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
           <InputField 
            id="cleaningType" 
            label="Rengøringstype" 
            component="select"
            options={CLEANING_TYPE_OPTIONS.map(ct => ({ value: ct, label: ct }))}
            placeholder="Vælg type"
            required 
            icon={<CogIcon />}
            value={formData.cleaningType}
            onChange={handleChange}
            error={errors.cleaningType}
          />
          <InputField 
            id="frequency" 
            label="Frekvens" 
            component="select"
            options={CLEANING_FREQUENCY_OPTIONS.map(cf => ({ value: cf, label: cf }))}
            placeholder="Vælg frekvens"
            required
            icon={<TagIcon />}
            value={formData.frequency}
            onChange={handleChange}
            error={errors.frequency}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField id="keyLocation" label="Nøgleplacering (valgfri)" placeholder="F.eks. Under den røde krukke" icon={<KeyIcon />} value={formData.keyLocation} onChange={handleChange} error={errors.keyLocation} />
          <InputField id="alarmCode" label="Alarmkode (valgfri)" placeholder="F.eks. 1234#" icon={<BellAlertIcon />} value={formData.alarmCode} onChange={handleChange} error={errors.alarmCode} />
        </div>
          
        <InputField id="notes" label="Noter (valgfri)" component="textarea" placeholder="Særlige instrukser, allergier, kæledyr etc." icon={<ChatBubbleLeftEllipsisIcon />} value={formData.notes} onChange={handleChange} error={errors.notes}/>

        {submitError && (
          <div className="mt-6 p-3 bg-red-50 border border-red-300 rounded-md">
            <p className="text-sm text-red-700 text-center">{submitError}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-brand-border">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onNavigateBack}
              disabled={isSubmitting}
              className="bg-brand-surface hover:bg-brand-border text-brand-text-main font-medium py-2.5 px-5 border border-brand-input-border rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              Annuller
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gemmer...
                </>
              ) : (
                'Gem Ændringer'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};