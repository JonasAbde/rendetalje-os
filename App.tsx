import React, { useState, useCallback, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { CustomerList } from './components/CustomerList';
import { TaskOverview } from './components/TaskOverview';
import { BookingForm } from './components/BookingForm';
import { DashboardView } from './components/DashboardView';
import { EmployeeListView } from './components/EmployeeListView';
import { EmployeeForm } from './components/EmployeeForm';
import { CustomerEditForm } from './components/CustomerEditForm';
import { BookingRequestsList } from './components/BookingRequestsList';
import { InvoicingView } from './components/InvoicingView';
import { InventoryManagementView } from './components/InventoryManagementView';
import { ReportsOverviewView } from '@/components/ReportsOverviewView';
import { SettingsGeneralView } from './components/SettingsGeneralView';
import { ActiveView } from './types';
import { APP_NAME } from './constants';
import { CheckCircleIcon, XCircleIcon } from './components/icons/OutlineIcons';


const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center p-8 bg-brand-surface rounded-lg shadow-md">
    <h2 className="text-2xl font-semibold text-brand-primary mb-2">{title}</h2>
    <p className="text-brand-text-muted">Denne visning er under udvikling.</p>
    <p className="text-sm text-brand-text-muted mt-1">Kommer snart!</p>
  </div>
);

// const InvoicingView = () => <PlaceholderView title="Økonomi & Fakturering" />; // Replaced by actual component
// const ReportsOverviewView = () => <PlaceholderView title="Rapporter" />; // Replaced by actual component
// const SettingsGeneralView = () => <PlaceholderView title="Indstillinger" />; // Replaced by actual component

const LogoutView = () => {
  // Real logout logic would go here (e.g., clearing auth tokens)
  alert("Du er nu logget ud (simuleret).");
  return <PlaceholderView title="Logget Ud" />;
};


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000); // Hide after 3 seconds
  };
  
  // Clear success message on view change
  useEffect(() => {
    setSuccessMessage(null);
  }, [activeView]);


  const handleNavigationView = useCallback((view: ActiveView, entityId?: string) => {
    if (view === 'logout') {
      // Perform actual logout logic if any
      console.log("Log ud valgt");
      // Potentially setActiveView to a login screen if one existed
    }
    setActiveView(view);
    setSelectedEntityId(entityId || null);
  }, []);

  const getViewTitle = (view: ActiveView): string => {
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'customers': return 'Kundeoversigt';
      case 'customer_edit': return 'Rediger Kunde';
      case 'tasks': return 'Planlægning & Opgaver';
      case 'booking_form': return 'Ny Kundeforespørgsel';
      case 'employee_list': return 'Medarbejdere';
      case 'employee_create': return 'Opret Ny Medarbejder';
      case 'employee_edit': return 'Rediger Medarbejder';
      case 'invoicing': return 'Økonomi & Fakturering';
      case 'inventory_management': return 'Lager';
      case 'reports_overview': return 'Rapporter';
      case 'settings_general': return 'Indstillinger';
      case 'logout': return 'Log Ud';
      default: return APP_NAME;
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView onNavigate={handleNavigationView} />;
      case 'customers': return <CustomerList onNavigate={handleNavigationView} />;
      case 'customer_edit': 
        return selectedEntityId ? 
               <CustomerEditForm customerId={selectedEntityId} onNavigateBack={() => handleNavigationView('customers')} /> : 
               <PlaceholderView title="Fejl: Kunde ID mangler" />;
      case 'tasks': return <TaskOverview showSuccessMessage={showSuccessMessage} />;
      case 'booking_form': return <BookingForm onNavigateBack={() => handleNavigationView('booking_requests')} showSuccessMessage={showSuccessMessage} />;
      case 'booking_requests': return <BookingRequestsList onNavigate={handleNavigationView} />;
      
      case 'employee_list': return <EmployeeListView onNavigate={handleNavigationView} />;
      case 'employee_create': return <EmployeeForm onNavigateBack={() => handleNavigationView('employee_list')} showSuccessMessage={showSuccessMessage} />;
      case 'employee_edit': 
        return selectedEntityId ? 
               <EmployeeForm employeeId={selectedEntityId} onNavigateBack={() => handleNavigationView('employee_list')} showSuccessMessage={showSuccessMessage} /> :
               <PlaceholderView title="Fejl: Medarbejder ID mangler" />;

      case 'invoicing': return <InvoicingView showSuccessMessage={showSuccessMessage} />;
      case 'inventory_management': return <InventoryManagementView showSuccessMessage={showSuccessMessage} />;
      case 'reports_overview': return <ReportsOverviewView />;
      case 'settings_general': return <SettingsGeneralView />;
      case 'logout': return <LogoutView />;
      default:
        return <DashboardView onNavigate={handleNavigationView} />;
    }
  };

  return (
    <div className="flex h-screen bg-brand-background text-brand-text-main">
      <Navigation activeView={activeView} onNavigate={handleNavigationView} />

      <div className="flex-1 flex flex-col overflow-hidden relative"> {/* Added relative for positioning success message */}
        <header className="bg-brand-surface shadow-sm p-4 sticky top-0 z-20"> {/* Increased z-index for header */}
           <h1 className="text-xl font-semibold text-brand-text-main">{getViewTitle(activeView)}</h1>
        </header>
        
        {successMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 mt-4 z-50 w-auto max-w-md">
            <div className="bg-green-500 text-white font-medium p-3 rounded-lg shadow-xl flex items-center space-x-2">
              <CheckCircleIcon className="w-6 h-6" />
              <span>{successMessage}</span>
               <button onClick={() => setSuccessMessage(null)} className="ml-auto p-1 rounded-full hover:bg-green-600 transition-colors">
                <XCircleIcon className="w-5 h-5 opacity-70 hover:opacity-100" />
              </button>
            </div>
          </div>
        )}
        
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto">
          {renderView()}
        </main>

        <footer className="bg-brand-secondary text-brand-secondary-content text-center py-3 text-sm mt-auto z-10">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. Alle rettigheder forbeholdes.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;