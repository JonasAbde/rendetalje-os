import React, { useState, useMemo } from 'react';
import { useTasks, useInvoices } from '../hooks/useSupabase';
import { Task, Invoice, TaskStatus } from '../types';
import { DocumentTextIcon, CheckBadgeIcon, CurrencyDanishKroneIcon, UserCircleIcon, CalendarDaysIcon, ClockIcon, InformationCircleIcon, PlusCircleIcon, ArrowPathIcon, TrashIcon } from './icons/OutlineIcons';
import { DENMARK_LOCALE } from '../constants';
import { generateInvoicePDF } from '../lib/pdfGenerator';

interface InvoiceTaskCardProps {
  task: Task;
  onCreateInvoice: (taskId: string) => void;
  isCreatingInvoice: boolean;
}

const InvoiceTaskCard: React.FC<InvoiceTaskCardProps> = ({ task, onCreateInvoice, isCreatingInvoice }) => {
  const duration = task.actualDurationHours || task.estimatedDurationHours;
  const hourlyRate = 349; // Standard hourly rate
  const amount = duration * hourlyRate;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(DENMARK_LOCALE, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(DENMARK_LOCALE, {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-brand-surface shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col space-y-3 border-l-4 border-brand-primary">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">{task.customerName || 'Ukendt Kunde'}</h3>
          <p className="text-xs text-brand-text-muted">{task.customerAddress || 'Adresse mangler'}</p>
        </div>
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
          Afventer Faktura
        </span>
      </div>

      <div className="text-sm text-brand-text-muted space-y-1">
        <p className="flex items-center"><CalendarDaysIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Opgavedato: {formatDate(task.scheduledDate)}</p>
        <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Varighed: {duration.toFixed(1)} timer</p>
        <p className="flex items-center"><UserCircleIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Medarbejder: {task.employeeName || 'Ikke specificeret'}</p>
         {task.notes && <p className="text-xs italic mt-1 text-brand-text-muted">Noter: {task.notes}</p>}
      </div>
      
      <div className="border-t border-brand-border mt-3 pt-3 flex justify-between items-center">
        <p className="text-lg font-semibold text-brand-text-main flex items-center">
          <CurrencyDanishKroneIcon className="w-5 h-5 mr-1 text-brand-primary"/> {formatCurrency(amount)}
        </p>
          <button
          onClick={() => onCreateInvoice(task.id)}
          disabled={isCreatingInvoice}
          className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-medium py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all text-sm flex items-center disabled:opacity-50"
          >
          {isCreatingInvoice ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Opretter...
            </>
          ) : (
            <>
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              Opret Faktura
            </>
          )}
          </button>
      </div>
       {!task.actualDurationHours && task.estimatedDurationHours && (
          <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-md flex items-center">
            <InformationCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0"/>
            Beløb er beregnet ud fra estimeret varighed. Faktisk varighed mangler.
          </p>
        )}
    </div>
  );
};

interface InvoiceCardProps {
  invoice: Invoice;
  onUpdateStatus: (invoiceId: string, status: "draft" | "sent" | "paid" | "overdue") => void;
  onDelete: (invoiceId: string) => void;
  onDownloadPDF: (invoice: Invoice) => void;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, onUpdateStatus, onDelete, onDownloadPDF }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(DENMARK_LOCALE, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(DENMARK_LOCALE, {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'draft': return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
      case 'sent': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-500' };
      case 'paid': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-500' };
      case 'overdue': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-500' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Kladde';
      case 'sent': return 'Sendt';
      case 'paid': return 'Betalt';
      case 'overdue': return 'Forfalden';
      default: return status;
    }
  };

  const statusClasses = getStatusClasses(invoice.status);

  const handleDeleteClick = () => {
    if (window.confirm(`Er du sikker på, at du vil slette faktura ${invoice.invoiceNumber}? Dette kan ikke fortrydes.`)) {
      onDelete(invoice.id);
    }
  };

  return (
    <div className={`bg-brand-surface shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 ${statusClasses.border}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-primary">{invoice.invoiceNumber}</h3>
          <p className="text-sm font-medium text-brand-text-main">{invoice.customerName}</p>
          <p className="text-xs text-brand-text-muted">{invoice.customerAddress}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses.bg} ${statusClasses.text}`}>
          {getStatusText(invoice.status)}
        </span>
      </div>

      <div className="space-y-1 text-sm text-brand-text-muted mb-3">
        <p className="flex items-center">
          <CalendarDaysIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          Opgave: {formatDate(invoice.taskDate)}
        </p>
        <p className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          {invoice.hours} timer × {formatCurrency(invoice.hourlyRate)}/time
        </p>
                 <p className="flex items-center">
           <DocumentTextIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
           Udstedt: {formatDate(invoice.issuedDate)}
         </p>
        <p className="flex items-center">
          <ClockIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> 
          Forfald: {formatDate(invoice.dueDate)}
        </p>
      </div>
      
      <div className="border-t border-brand-border pt-3">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xl font-bold text-brand-primary">
            {formatCurrency(invoice.totalAmount)}
          </p>
        </div>
        
        {invoice.status === 'draft' && (
          <div className="flex flex-wrap gap-2 mb-2">
            <button 
              onClick={() => onUpdateStatus(invoice.id, 'sent')}
              className="flex-1 min-w-0 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
                             <CheckBadgeIcon className="w-3 h-3 inline mr-1"/>
               Send
            </button>
            <button 
              onClick={() => onUpdateStatus(invoice.id, 'paid')}
              className="flex-1 min-w-0 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              <CheckBadgeIcon className="w-3 h-3 inline mr-1"/>
              Marker Betalt
            </button>
          </div>
        )}

        {invoice.status === 'sent' && (
          <div className="flex flex-wrap gap-2 mb-2">
            <button 
              onClick={() => onUpdateStatus(invoice.id, 'paid')}
              className="flex-1 min-w-0 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              <CheckBadgeIcon className="w-3 h-3 inline mr-1"/>
              Marker Betalt
            </button>
            <button 
              onClick={() => onUpdateStatus(invoice.id, 'overdue')}
              className="flex-1 min-w-0 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
            >
              Marker Forfalden
            </button>
          </div>
        )}
        
                 <div className="flex justify-between items-center text-xs text-brand-text-muted">
           <span>Oprettet: {formatDate(invoice.createdAt)}</span>
           <div className="flex gap-2">
             <button 
               onClick={() => onDownloadPDF(invoice)}
               className="text-brand-primary hover:text-brand-primary-dark font-medium"
             >
               Download PDF
             </button>
             <button 
               onClick={handleDeleteClick}
               className="text-brand-error hover:text-red-700 font-medium"
             >
               Slet
             </button>
           </div>
         </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(4)].map((_, i) => (
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
          <div className="h-8 bg-brand-primary/20 rounded w-32 mb-2"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

interface InvoicingViewProps {
  showSuccessMessage: (message: string) => void;
}

export const InvoicingView: React.FC<InvoicingViewProps> = ({ showSuccessMessage }) => {
  const { tasks, loading: tasksLoading } = useTasks();
  const { invoices, loading: invoicesLoading, createInvoiceFromTask, updateInvoiceStatus, deleteInvoice } = useInvoices();
  const [activeTab, setActiveTab] = useState<'pending' | 'invoices'>('pending');
  const [creatingInvoiceTaskId, setCreatingInvoiceTaskId] = useState<string | null>(null);

  // Tasks der er færdige men ikke faktureret
  const tasksToInvoice = useMemo(() => {
    return tasks.filter(task => 
      task.status === TaskStatus.COMPLETED && 
      !task.invoiceGenerated
    ).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  }, [tasks]);

  const handleCreateInvoice = async (taskId: string) => {
    setCreatingInvoiceTaskId(taskId);
    try {
      const invoice = await createInvoiceFromTask(taskId);
      showSuccessMessage(`Faktura ${invoice.invoiceNumber} oprettet!`);
    } catch (error) {
      console.error('Fejl ved oprettelse af faktura:', error);
      alert('Der opstod en fejl ved oprettelse af fakturaen. Prøv igen.');
    } finally {
      setCreatingInvoiceTaskId(null);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: "draft" | "sent" | "paid" | "overdue") => {
    try {
      await updateInvoiceStatus(invoiceId, status);
      const statusText = status === 'sent' ? 'sendt' : status === 'paid' ? 'markeret som betalt' : 'opdateret';
      showSuccessMessage(`Faktura ${statusText}!`);
    } catch (error) {
      console.error('Fejl ved opdatering af faktura:', error);
      alert('Der opstod en fejl ved opdatering af fakturaen. Prøv igen.');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteInvoice(invoiceId);
      showSuccessMessage('Faktura slettet!');
    } catch (error) {
      console.error('Fejl ved sletning af faktura:', error);
      alert('Der opstod en fejl ved sletning af fakturaen. Prøv igen.');
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice);
      showSuccessMessage('PDF download startet!');
    } catch (error) {
      console.error('Fejl ved PDF generering:', error);
      alert('Der opstod en fejl ved generering af PDF. Prøv igen.');
    }
  };

  const renderTaskList = () => {
    if (tasksLoading) return <LoadingSkeleton />;
    
    if (tasksToInvoice.length === 0) {
      return (
        <div className="text-center py-12 bg-brand-surface rounded-lg shadow">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4" />
          <p className="text-brand-text-muted">Ingen opgaver klar til fakturering.</p>
          <p className="text-sm text-brand-text-muted mt-2">Opgaver skal være fuldført for at kunne faktureres.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasksToInvoice.map(task => (
          <InvoiceTaskCard
            key={task.id}
            task={task}
            onCreateInvoice={handleCreateInvoice}
            isCreatingInvoice={creatingInvoiceTaskId === task.id}
          />
        ))}
      </div>
    );
  };

  const renderInvoiceList = () => {
    if (invoicesLoading) return <LoadingSkeleton />;
    
    if (invoices.length === 0) {
      return (
        <div className="text-center py-12 bg-brand-surface rounded-lg shadow">
          <DocumentTextIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4" />
          <p className="text-brand-text-muted">Ingen fakturaer endnu.</p>
          <p className="text-sm text-brand-text-muted mt-2">Opret din første faktura fra en færdig opgave.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {invoices.map(invoice => (
           <InvoiceCard
             key={invoice.id}
             invoice={invoice}
             onUpdateStatus={handleUpdateInvoiceStatus}
             onDelete={handleDeleteInvoice}
             onDownloadPDF={handleDownloadPDF}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6 flex border-b border-brand-border">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-5 font-medium text-sm transition-colors
            ${activeTab === 'pending' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface'}`}
        >
          Til Fakturering ({tasksToInvoice.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-3 px-5 font-medium text-sm transition-colors
            ${activeTab === 'invoices' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-brand-text-muted hover:text-brand-text-main hover:bg-brand-surface'}`}
        >
          Fakturaer ({invoices.length})
        </button>
      </div>

      {activeTab === 'pending' && renderTaskList()}
      {activeTab === 'invoices' && renderInvoiceList()}
    </div>
  );
};