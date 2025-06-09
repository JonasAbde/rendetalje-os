import React, { useState } from 'react';
import { useEmployees } from '../hooks/useSupabase';
import { Employee, ActiveView } from '../types';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, IdentificationIcon, BanknotesIcon, PencilSquareIcon, TrashIcon, UserGroupIcon, PlusCircleIcon, MagnifyingGlassIcon, ArrowPathIcon } from './icons/OutlineIcons';

interface EmployeeListProps {
  onNavigate: (view: ActiveView, entityId?: string) => void;
}

const EmployeeCard: React.FC<{ employee: Employee; onNavigate: (view: ActiveView, entityId: string) => void; onDelete: (employeeId: string) => void; }> = ({ employee, onNavigate, onDelete }) => {
  
  const handleDeleteClick = () => {
    if (window.confirm(`Er du sikker på, at du vil slette medarbejder "${employee.name}"? Dette kan ikke fortrydes.`)) {
      onDelete(employee.id);
    }
  };
  
  return (
    <div className="bg-brand-surface shadow-lg rounded-xl p-5 sm:p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="flex items-center mb-4">
        <UserCircleIcon className="w-10 h-10 text-brand-primary mr-3" />
        <div>
          <h3 className="text-xl font-semibold text-brand-primary">{employee.name}</h3>
          <p className="text-sm text-brand-text-muted flex items-center"><IdentificationIcon className="w-4 h-4 mr-1.5 text-brand-primary-light" />{employee.role}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-brand-text-muted flex-grow">
        <p className="flex items-center"><EnvelopeIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> {employee.email}</p>
        <p className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> {employee.phone}</p>
        {employee.hourlyRate && (
          <p className="flex items-center"><BanknotesIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Timeløn: {employee.hourlyRate} DKK</p>
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-brand-border flex justify-end space-x-2">
         <button 
          onClick={handleDeleteClick}
          className="text-sm text-brand-error hover:text-red-700 font-medium flex items-center px-3 py-1 rounded-md hover:bg-red-100 transition-colors"
          aria-label={`Slet ${employee.name}`}
        >
          <TrashIcon className="w-4 h-4 mr-1"/>
          Slet
        </button>
        <button 
          onClick={() => onNavigate('employee_edit', employee.id)} 
          className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium flex items-center px-3 py-1 rounded-md hover:bg-brand-primary-light/20 transition-colors"
          aria-label={`Rediger ${employee.name}`}
        >
          <PencilSquareIcon className="w-4 h-4 mr-1"/>
          Rediger
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
          <div className="flex-1">
            <div className="h-6 bg-brand-primary/20 rounded w-32 mb-1"></div>
            <div className="h-4 bg-brand-text-muted/20 rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-2/3"></div>
        </div>
        <div className="border-t border-brand-border pt-3">
          <div className="flex justify-end space-x-2">
            <div className="h-8 bg-brand-primary/20 rounded w-16"></div>
            <div className="h-8 bg-brand-primary/20 rounded w-20"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const EmployeeListView: React.FC<EmployeeListProps> = ({ onNavigate }) => {
  const { employees, loading, error, refetch, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrering og søgning
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await deleteEmployee(employeeId);
    } catch (error) {
      console.error('Fejl ved sletning af medarbejder:', error);
      alert('Der opstod en fejl ved sletning af medarbejderen. Prøv igen.');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <UserGroupIcon className="w-16 h-16 mx-auto mb-2"/>
          <p className="font-medium">Fejl ved indlæsning af medarbejdere</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={refetch}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2"/>
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Søgebar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-brand-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Søg efter navn, email eller stilling..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted"
          />
        </div>

        {/* Opret knap */}
        <button
          onClick={() => onNavigate('employee_create')}
          disabled={loading}
          className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center disabled:opacity-50"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Opret Ny Medarbejder
        </button>
      </div>

      {/* Antal resultater */}
      {!loading && (
        <div className="mb-4 text-sm text-brand-text-muted">
          {searchTerm ? (
            <>Fandt {filteredEmployees.length} medarbejder{filteredEmployees.length !== 1 ? 'e' : ''} for "{searchTerm}"</>
          ) : (
            <>Total: {employees.length} medarbejder{employees.length !== 1 ? 'e' : ''}</>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-10">
          <UserGroupIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4"/>
          {searchTerm ? (
            <>
              <p className="text-brand-text-muted">Ingen medarbejdere fundet for "{searchTerm}".</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-sm text-brand-primary hover:text-brand-primary-dark mt-2"
              >
                Ryd søgning
              </button>
            </>
          ) : (
            <>
          <p className="text-brand-text-muted">Ingen medarbejdere fundet.</p>
          <p className="text-sm text-brand-text-muted mt-2">Du kan oprette en ny medarbejder ved at klikke på knappen ovenfor.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <EmployeeCard key={employee.id} employee={employee} onNavigate={onNavigate} onDelete={handleDeleteEmployee} />
          ))}
        </div>
      )}
    </div>
  );
};