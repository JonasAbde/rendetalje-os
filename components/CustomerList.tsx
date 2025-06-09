import React, { useState } from 'react';
import { useCustomers } from '../hooks/useSupabase';
import { Customer, ActiveView } from '../types';
import { UserCircleIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, KeyIcon, BellAlertIcon, CogIcon, TagIcon, PencilSquareIcon, UsersIcon, TrashIcon, MagnifyingGlassIcon, PlusCircleIcon } from './icons/OutlineIcons';

interface CustomerListProps {
  onNavigate: (view: ActiveView, entityId?: string) => void;
}

const CustomerCard: React.FC<{ customer: Customer; onNavigate: (view: ActiveView, entityId: string) => void; onDelete: (customerId: string) => void; }> = ({ customer, onNavigate, onDelete }) => {
  
  const handleDeleteClick = () => {
    if (window.confirm(`Er du sikker på, at du vil slette kunde "${customer.name}"? Dette kan ikke fortrydes.`)) {
      onDelete(customer.id);
    }
  };

  return (
    <div className="bg-brand-surface shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="flex items-center mb-4">
        <UserCircleIcon className="w-10 h-10 text-brand-primary mr-3" />
        <h3 className="text-xl font-semibold text-brand-primary">{customer.name}</h3>
      </div>
      
      <div className="space-y-2 text-sm text-brand-text-muted flex-grow">
        <p className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> {customer.address}</p>
        <p className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> {customer.phone}</p>
        <p className="flex items-center"><EnvelopeIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> {customer.email}</p>
        
        {(customer.keyLocation || customer.alarmCode) && <hr className="my-3 border-brand-border"/>}
        
        {customer.keyLocation && <p className="flex items-center"><KeyIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Nøgle: {customer.keyLocation}</p>}
        {customer.alarmCode && <p className="flex items-center"><BellAlertIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Alarm: {customer.alarmCode}</p>}
        
        <hr className="my-3 border-brand-border"/>
        <p className="flex items-center"><CogIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Type: {customer.cleaningType}</p>
        <p className="flex items-center"><TagIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Frekvens: {customer.frequency}</p>
        
        {customer.notes && <p className="mt-3 pt-3 border-t border-brand-border text-xs italic text-brand-text-muted">Noter: {customer.notes}</p>}
      </div>
      <div className="mt-4 pt-3 border-t border-brand-border flex justify-end space-x-2">
        <button 
          onClick={handleDeleteClick}
          className="text-sm text-brand-error hover:text-red-700 font-medium flex items-center px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
          aria-label={`Slet ${customer.name}`}
        >
          <TrashIcon className="w-4 h-4 mr-1"/>
          Slet
        </button>
        <button 
          onClick={() => onNavigate('customer_edit', customer.id)} 
          className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium flex items-center px-3 py-1 rounded-md hover:bg-brand-primary-light/20 transition-colors"
          aria-label={`Administrer ${customer.name}`}
        >
          <PencilSquareIcon className="w-4 h-4 mr-1"/>
          Administrer
        </button>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-brand-surface shadow-lg rounded-xl p-5 sm:p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-brand-primary/20 rounded-full mr-3"></div>
          <div className="h-6 bg-brand-primary/20 rounded w-32"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-1/2"></div>
        </div>
        <div className="mt-4 pt-3 border-t border-brand-border flex justify-end space-x-2">
          <div className="h-8 bg-brand-primary/20 rounded w-16"></div>
          <div className="h-8 bg-brand-primary/20 rounded w-20"></div>
        </div>
      </div>
    ))}
  </div>
);

export const CustomerList: React.FC<CustomerListProps> = ({ onNavigate }) => {
  const { customers, loading, error, refetch, deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  // Filtrering og søgning
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === '' || customer.cleaningType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await deleteCustomer(customerId);
    } catch (error) {
      console.error('Fejl ved sletning af kunde:', error);
      alert('Der opstod en fejl ved sletning af kunden: ' + (error instanceof Error ? error.message : 'Ukendt fejl'));
    }
  };

  // Få unikke cleaning types til filter
  const cleaningTypes = [...new Set(customers.map(c => c.cleaningType))];

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <UsersIcon className="w-16 h-16 mx-auto mb-2"/>
          <p className="font-medium">Fejl ved indlæsning af kunder</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={refetch}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Søge- og filter sektion */}
      <div className="bg-brand-surface p-4 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Søgefelt */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-brand-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Søg efter navn, email eller adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light bg-brand-background text-brand-text-main"
            />
          </div>
          
          {/* Filter dropdown */}
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full px-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light bg-brand-background text-brand-text-main"
            >
              <option value="">Alle typer</option>
              {cleaningTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Opret ny kunde knap */}
          <button
            onClick={() => onNavigate('booking_form')}
            className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center whitespace-nowrap"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2"/>
            Opret kunde
          </button>
        </div>
        
        {/* Resultat tæller */}
        <div className="mt-3 text-sm text-brand-text-muted">
          Viser {filteredCustomers.length} af {customers.length} kunder
        </div>
      </div>

      {/* Kunde liste */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-10">
          <UsersIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4"/>
          {customers.length === 0 ? (
            <>
          <p className="text-brand-text-muted">Ingen kunder fundet.</p>
              <p className="text-sm text-brand-text-muted mt-2">Du kan oprette en ny kundeforespørgsel via knappen ovenfor.</p>
            </>
          ) : (
            <>
              <p className="text-brand-text-muted">Ingen kunder matcher dine søgekriterier.</p>
              <p className="text-sm text-brand-text-muted mt-2">Prøv at ændre din søgning eller filter.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <CustomerCard key={customer.id} customer={customer} onNavigate={onNavigate} onDelete={handleDeleteCustomer} />
          ))}
        </div>
      )}
    </div>
  );
};