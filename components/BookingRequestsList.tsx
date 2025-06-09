import React, { useState } from 'react';
import { useBookingRequests } from '../hooks/useSupabase';
import { BookingRequest, ActiveView } from '../types';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarDaysIcon, TagIcon, ChatBubbleLeftEllipsisIcon, MagnifyingGlassIcon, ArrowPathIcon, DocumentPlusIcon, CheckCircleIcon, XCircleIcon } from './icons/OutlineIcons';

interface BookingRequestsListProps {
  onNavigate: (view: ActiveView, entityId?: string) => void;
}

const BookingRequestCard: React.FC<{ 
  request: BookingRequest; 
  onUpdateStatus: (requestId: string, status: "pending" | "contacted" | "converted_to_customer" | "rejected") => void;
  onDelete: (requestId: string) => void;
}> = ({ request, onUpdateStatus, onDelete }) => {
  
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500' };
      case 'contacted': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500' };
      case 'converted_to_customer': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500' };
      case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' };
      default: return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-500' };
    }
  };

  const statusClasses = getStatusClasses(request.status);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Afventer';
      case 'contacted': return 'Kontaktet';
      case 'converted_to_customer': return 'Konverteret';
      case 'rejected': return 'Afvist';
      default: return status;
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Er du sikker på, at du vil slette forespørgslen fra "${request.name}"? Dette kan ikke fortrydes.`)) {
      onDelete(request.id);
    }
  };

  return (
    <div className={`bg-brand-surface shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 ${statusClasses.border}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-primary">{request.name}</h3>
          <p className="text-sm text-brand-text-muted flex items-center mt-1">
            <MapPinIcon className="w-4 h-4 mr-1 text-brand-primary-light" />
            {request.address}, {request.zipCity}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses.bg} ${statusClasses.text}`}>
          {getStatusText(request.status)}
        </span>
      </div>

      <div className="space-y-1 text-sm text-brand-text-muted mb-3">
        <p className="flex items-center">
          <EnvelopeIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          {request.email}
        </p>
        <p className="flex items-center">
          <PhoneIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          {request.phone}
        </p>
        <p className="flex items-center">
          <TagIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          {request.cleaningType}
        </p>
        <p className="flex items-center">
          <CalendarDaysIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          Ønsket start: {new Date(request.desiredStartDate).toLocaleDateString('da-DK')}
        </p>
        {request.sqm && (
          <p className="text-xs">Størrelse: {request.sqm} m²</p>
        )}
        {request.frequencyPreference && (
          <p className="text-xs">Frekvens: {request.frequencyPreference}</p>
        )}
        {request.message && (
          <p className="text-xs italic mt-2 p-2 bg-brand-background rounded">
            <ChatBubbleLeftEllipsisIcon className="w-3 h-3 inline mr-1"/>
            "{request.message}"
          </p>
        )}
      </div>
      
      <div className="border-t border-brand-border pt-3">
        {request.status === 'pending' && (
          <div className="flex flex-wrap gap-2 mb-2">
            <button 
              onClick={() => onUpdateStatus(request.id, 'contacted')}
              className="flex-1 min-w-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              <CheckCircleIcon className="w-3 h-3 inline mr-1"/>
              Kontakt
            </button>
            <button 
              onClick={() => onUpdateStatus(request.id, 'converted_to_customer')}
              className="flex-1 min-w-0 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              Konverter
            </button>
            <button 
              onClick={() => onUpdateStatus(request.id, 'rejected')}
              className="flex-1 min-w-0 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              <XCircleIcon className="w-3 h-3 inline mr-1"/>
              Afvis
            </button>
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-brand-text-muted">
          <span>Oprettet: {new Date(request.createdAt).toLocaleDateString('da-DK')}</span>
          <button 
            onClick={handleDeleteClick}
            className="text-brand-error hover:text-red-700 font-medium"
          >
            Slet
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-brand-surface shadow-lg rounded-xl p-5 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="h-6 bg-brand-primary/20 rounded w-32 mb-2"></div>
            <div className="h-4 bg-brand-text-muted/20 rounded w-48"></div>
          </div>
          <div className="h-6 bg-brand-primary/20 rounded w-20"></div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-2/3"></div>
        </div>
        <div className="border-t border-brand-border pt-3">
          <div className="flex gap-2 mb-2">
            <div className="h-8 bg-brand-primary/20 rounded flex-1"></div>
            <div className="h-8 bg-brand-primary/20 rounded flex-1"></div>
            <div className="h-8 bg-brand-primary/20 rounded flex-1"></div>
          </div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export const BookingRequestsList: React.FC<BookingRequestsListProps> = ({ onNavigate }) => {
  const { bookingRequests, loading, error, refetch, updateBookingRequestStatus, deleteBookingRequest } = useBookingRequests();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Filtrering og søgning
  const filteredRequests = bookingRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (requestId: string, status: "pending" | "contacted" | "converted_to_customer" | "rejected") => {
    try {
      await updateBookingRequestStatus(requestId, status);
    } catch (error) {
      console.error('Fejl ved opdatering af forespørgsel status:', error);
      alert('Der opstod en fejl ved opdatering af forespørgslen. Prøv igen.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteBookingRequest(requestId);
    } catch (error) {
      console.error('Fejl ved sletning af forespørgsel:', error);
      alert('Der opstod en fejl ved sletning af forespørgslen. Prøv igen.');
    }
  };

  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <DocumentPlusIcon className="w-16 h-16 mx-auto mb-2"/>
          <p className="font-medium">Fejl ved indlæsning af forespørgsler</p>
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        {/* Søge- og filtersektion */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Søgebar */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-brand-text-muted" />
            </div>
            <input
              type="text"
              placeholder="Søg efter navn, email eller adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main placeholder-brand-text-muted"
            />
          </div>

          {/* Status filter */}
          <div className="min-w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2.5 border border-brand-input-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:border-brand-primary-light sm:text-sm bg-brand-surface text-brand-text-main"
            >
              <option value="">Alle status</option>
              <option value="pending">Afventer</option>
              <option value="contacted">Kontaktet</option>
              <option value="converted_to_customer">Konverteret</option>
              <option value="rejected">Afvist</option>
            </select>
          </div>
        </div>

        {/* Opret knap */}
        <button
          onClick={() => onNavigate('booking_form')}
          disabled={loading}
          className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center disabled:opacity-50"
        >
          <DocumentPlusIcon className="w-5 h-5 mr-2" />
          Ny Forespørgsel
        </button>
      </div>

      {/* Statistik */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {['pending', 'contacted', 'converted_to_customer', 'rejected'].map(status => {
            const count = bookingRequests.filter(r => r.status === status).length;
            const statusText = status === 'pending' ? 'Afventer' : 
                              status === 'contacted' ? 'Kontaktet' : 
                              status === 'converted_to_customer' ? 'Konverteret' : 'Afvist';
            return (
              <div key={status} className="bg-brand-surface p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-brand-primary">{count}</div>
                <div className="text-sm text-brand-text-muted">{statusText}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Antal resultater */}
      {!loading && (
        <div className="mb-4 text-sm text-brand-text-muted">
          {searchTerm || statusFilter ? (
            <>Fandt {filteredRequests.length} forespørgs{filteredRequests.length !== 1 ? 'ler' : 'el'}</>
          ) : (
            <>Total: {bookingRequests.length} forespørgs{bookingRequests.length !== 1 ? 'ler' : 'el'}</>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-10">
          <DocumentPlusIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4"/>
          {searchTerm || statusFilter ? (
            <>
              <p className="text-brand-text-muted">Ingen forespørgsler fundet for dine kriterier.</p>
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
                className="text-sm text-brand-primary hover:text-brand-primary-dark mt-2"
              >
                Ryd filtre
              </button>
            </>
          ) : (
            <>
              <p className="text-brand-text-muted">Ingen kundeforespørgsler endnu.</p>
              <p className="text-sm text-brand-text-muted mt-2">Klik på "Ny Forespørgsel" for at oprette den første.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map(request => (
            <BookingRequestCard 
              key={request.id} 
              request={request} 
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 