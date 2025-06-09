import React, { useState, useCallback } from 'react';
import { BookingRequest, CleaningType, CleaningFrequency } from '../types';
import { CLEANING_TYPE_OPTIONS, CLEANING_FREQUENCY_OPTIONS } from '../constants';
import { UserCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, HomeModernIcon, CalendarDaysIcon, TagIcon, ChatBubbleLeftEllipsisIcon, ArrowUturnLeftIcon, CheckCircleIcon } from './icons/OutlineIcons';
import { useBookingRequests } from '../hooks/useSupabase';

interface BookingFormProps {
  onNavigateBack: () => void;
  showSuccessMessage: (message: string) => void;
}

type FormData = Omit<BookingRequest, 'id' | 'createdAt' | 'status'>;

const initialFormData: FormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  zipCity: '',
  sqm: undefined,
  cleaningType: CleaningType.STANDARD,
  desiredStartDate: '',
  frequencyPreference: undefined,
  message: '',
};

export const BookingForm: React.FC<BookingFormProps> = ({ onNavigateBack, showSuccessMessage }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessHandled, setSubmitSuccessHandled] = useState(false); // Changed from submitSuccess to manage redirection
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createBookingRequest } = useBookingRequests(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Navn er påkrævet.';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon er påkrævet.';
    else if (!/^\d{8,}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Ugyldigt telefonnummer (minimum 8 cifre).';
    if (!formData.email.trim()) newErrors.email = 'Email er påkrævet.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ugyldig email adresse.';
    if (!formData.address.trim()) newErrors.address = 'Adresse er påkrævet.';
    if (!formData.zipCity.trim()) newErrors.zipCity = 'Postnummer & By er påkrævet.';
    if (!formData.desiredStartDate) newErrors.desiredStartDate = 'Ønsket startdato er påkrævet.';
    if (formData.sqm !== undefined && formData.sqm <= 0) newErrors.sqm = 'Kvm skal være et positivt tal.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitSuccessHandled(false);
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newBooking = await createBookingRequest(formData); 
      console.log('Form data processed:', newBooking);
      showSuccessMessage(`Kundeforespørgsel for ${newBooking.name} er modtaget!`);
      setFormData(initialFormData); 
      setSubmitSuccessHandled(true);
      onNavigateBack();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Der opstod en fejl under oprettelse. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Success view is removed as feedback is now handled by global success message and navigation.
  // if (submitSuccessHandled) { ... } 

  const InputField: React.FC<{
    id: keyof FormData;
    label: string;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
    required?: boolean;
    component?: 'input' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
    className?: string;
  }> = ({ id, label, type = "text", placeholder, icon, required, component = 'input', options, className = '' }) => (
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
            value={formData[id] as string || ''}
            onChange={handleChange}
            placeholder={placeholder}
            className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${errors[id] ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted`}
            aria-invalid={!!errors[id]}
            aria-describedby={errors[id] ? `${id}-error` : undefined}
          />
        }
        {component === 'textarea' &&
            <textarea
                name={id}
                id={id}
                rows={3}
                value={formData[id] as string || ''}
                onChange={handleChange}
                placeholder={placeholder}
                className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border ${errors[id] ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted`}
                aria-invalid={!!errors[id]}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
            />
        }
        {component === 'select' && options &&
            <select
                name={id}
                id={id}
                value={formData[id] as string || ''}
                onChange={handleChange}
                className={`block w-full ${icon ? 'pl-10' : 'pl-3'} pr-10 py-2.5 border ${errors[id] ? 'border-brand-error' : 'border-brand-input-border'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main`}
                aria-invalid={!!errors[id]}
                aria-describedby={errors[id] ? `${id}-error` : undefined}
            >
                <option value="">{placeholder || `Vælg ${label.toLowerCase()}`}</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        }
      </div>
      {errors[id] && <p className="mt-1 text-xs text-brand-error" id={`${id}-error`}>{errors[id]}</p>}
    </div>
  );

  return (
    <div className="bg-brand-surface shadow-xl rounded-lg p-6 sm:p-8 max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <InputField id="name" label="Fulde Navn" placeholder="F.eks. Jens Hansen" icon={<UserCircleIcon />} required className="sm:col-span-2"/>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField id="phone" label="Telefonnummer" type="tel" placeholder="F.eks. 12345678" icon={<PhoneIcon />} required />
          <InputField id="email" label="Email Adresse" type="email" placeholder="F.eks. jens@example.com" icon={<EnvelopeIcon />} required />
        </div>
        
        <InputField id="address" label="Adresse" placeholder="F.eks. Hovedgaden 12, Lejlighed 3" icon={<MapPinIcon />} required className="sm:col-span-2"/>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField id="zipCity" label="Postnummer & By" placeholder="F.eks. 8000 Aarhus C" required />
          <InputField id="sqm" label="Antal Kvadratmeter (kvm)" type="number" placeholder="F.eks. 75" icon={<HomeModernIcon />} />
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <InputField 
            id="cleaningType" 
            label="Rengøringstype" 
            component="select"
            options={CLEANING_TYPE_OPTIONS.map(ct => ({ value: ct, label: ct }))}
            placeholder="Vælg type"
            required 
          />
          <InputField id="desiredStartDate" label="Ønsket Startdato" type="date" required icon={<CalendarDaysIcon />} />
        </div>
          
        <InputField 
          id="frequencyPreference" 
          label="Frekvensønske (valgfri)" 
          component="select"
          options={CLEANING_FREQUENCY_OPTIONS.map(cf => ({ value: cf, label: cf }))}
          placeholder="Vælg frekvens"
          icon={<TagIcon />}
          className="sm:col-span-2"
        />

        <InputField id="message" label="Besked (valgfri)" component="textarea" placeholder="Eventuelle specifikke ønsker eller noter..." icon={<ChatBubbleLeftEllipsisIcon />} className="sm:col-span-2"/>

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
                  Opretter Forespørgsel...
                </>
              ) : (
                'Opret Forespørgsel'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};