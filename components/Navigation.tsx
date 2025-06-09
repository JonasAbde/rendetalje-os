import React from 'react';
import { ActiveView } from '../types';
import { 
  UsersIcon, 
  CalendarDaysIcon, 
  DocumentPlusIcon, 
  HomeIcon,
  UserGroupIcon,
  UserPlusIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from './icons/OutlineIcons'; 
import { APP_NAME } from '../constants';

interface NavigationProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ activeView, onNavigate }) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'tasks', label: 'Planlægning', icon: <CalendarDaysIcon /> },
    { id: 'customers', label: 'Kunder', icon: <UsersIcon /> },
    { id: 'booking_requests', label: 'Forespørgsler', icon: <DocumentPlusIcon /> },
    { id: 'employee_list', label: 'Medarbejdere', icon: <UserGroupIcon /> },
    { id: 'employee_create', label: 'Opret Medarbejder', icon: <UserPlusIcon /> },
    { id: 'invoicing', label: 'Økonomi', icon: <BanknotesIcon /> },
    { id: 'reports_overview', label: 'Rapporter', icon: <DocumentChartBarIcon /> },
    { id: 'settings_general', label: 'Indstillinger', icon: <Cog6ToothIcon /> },
    { id: 'logout', label: 'Log Ud', icon: <ArrowLeftOnRectangleIcon /> },
  ];

  return (
    <aside className="w-64 bg-brand-surface text-brand-text-main flex flex-col shadow-lg">
      <div className="h-16 flex items-center justify-center border-b border-brand-border">
        <h1 className="text-2xl font-bold text-brand-primary">{APP_NAME}</h1>
      </div>
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto"> {/* Reduced space-y for more items */}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 group
              ${
                activeView === item.id
                  ? 'bg-brand-primary text-brand-text-on-primary shadow-md'
                  : 'text-brand-text-muted hover:bg-brand-primary-light hover:text-brand-text-on-primary'
              }`}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { 
              className: `w-5 h-5 mr-3 transition-colors duration-150 ${activeView === item.id ? 'text-brand-text-on-primary' : 'text-brand-text-muted group-hover:text-brand-text-on-primary'}`
            })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-brand-border mt-auto">
        <p className="text-xs text-brand-text-muted text-center">&copy; {new Date().getFullYear()} {APP_NAME}</p>
      </div>
    </aside>
  );
};