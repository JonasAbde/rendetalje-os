import React, { useMemo } from 'react';
import { useDashboardStats, useActivityLog } from '../hooks/useSupabase';
import { ActiveView, RecentActivityItem } from '../types';
import { UsersIcon, CalendarDaysIcon, DocumentPlusIcon, UserGroupIcon, ClockIcon, BoltIcon, UserPlusIcon, ArrowPathIcon, CurrencyDollarIcon } from './icons/OutlineIcons';
import { DENMARK_LOCALE } from '../constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>; 
  bgColorClass?: string;
  textColorClass?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColorClass = 'bg-brand-primary-light', textColorClass = 'text-brand-primary-dark', onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={!onClick || isLoading}
      className={`p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 flex items-center space-x-4
        ${bgColorClass} ${onClick ? 'cursor-pointer' : 'cursor-default'} w-full`}
    >
      <div className={`p-3 rounded-lg bg-white/30`}>
        {React.cloneElement(icon, { className: `w-7 h-7 ${textColorClass}` })}
      </div>
      <div className="text-left">
        <p className={`text-sm font-medium ${textColorClass === 'text-brand-primary-dark' ? 'text-brand-text-muted' : textColorClass } opacity-80`}>{title}</p>
        {isLoading ? (
          <div className="h-7 w-20 bg-gray-300 animate-pulse rounded-md mt-1"></div>
        ) : (
          <p className={`text-2xl sm:text-3xl font-bold ${textColorClass}`}>{value}</p>
        )}
      </div>
    </button>
  );
};

const ActivityItem: React.FC<{ activity: RecentActivityItem }> = ({ activity }) => {
  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return `${seconds} sek siden`;
    if (minutes < 60) return `${minutes} min siden`;
    if (hours < 24) return `${hours} timer siden`;
    if (days === 1) return `i går`;
    if (days < 7) return `${days} dage siden`;
    return date.toLocaleDateString(DENMARK_LOCALE, { day: 'numeric', month: 'short' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_customer':
        return <UserPlusIcon className="w-5 h-5 text-green-600" />;
      case 'new_task':
        return <CalendarDaysIcon className="w-5 h-5 text-blue-600" />;
      case 'task_updated':
        return <ArrowPathIcon className="w-5 h-5 text-orange-600" />;
      case 'new_employee':
        return <UserGroupIcon className="w-5 h-5 text-purple-600" />;
      case 'new_booking_request':
        return <DocumentPlusIcon className="w-5 h-5 text-indigo-600" />;
      default:
        return <ArrowPathIcon className="w-5 h-5 text-brand-text-muted" />;
    }
  };

  return (
    <li className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-md hover:bg-neutral-100 transition-colors">
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-brand-text-main">{activity.description}</p>
        <p className="text-xs text-brand-text-muted">{timeAgo(activity.timestamp)}</p>
      </div>
    </li>
  );
};


interface DashboardViewProps {
  onNavigate: (view: ActiveView, entityId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { activities, loading: activitiesLoading } = useActivityLog(10);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(DENMARK_LOCALE, {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards Section */}
      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Statistik Oversigt</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard 
            title="Aktive Kunder" 
            value={stats.totalCustomers} 
            icon={<UsersIcon />} 
            bgColorClass="bg-brand-primary"
            textColorClass="text-brand-text-on-primary"
            onClick={() => onNavigate('customers')}
            isLoading={statsLoading}
          />
          <StatCard 
            title="Opgaver i Dag" 
            value={stats.tasksToday} 
            icon={<CalendarDaysIcon />} 
            bgColorClass="bg-blue-500"
            textColorClass="text-white"
            onClick={() => onNavigate('tasks')}
            isLoading={statsLoading}
          />
          <StatCard 
            title="Ventende Bookinger" 
            value={stats.pendingBookings} 
            icon={<DocumentPlusIcon />} 
            bgColorClass="bg-green-500"
            textColorClass="text-white"
            onClick={() => onNavigate('booking_requests')} 
            isLoading={statsLoading}
          />
          <StatCard 
            title="Medarbejdere" 
            value={stats.activeEmployees} 
            icon={<UserGroupIcon />} 
            bgColorClass="bg-brand-secondary"
            textColorClass="text-brand-secondary-content"
            onClick={() => onNavigate('employee_list')}
            isLoading={statsLoading}
          />
        </div>
      </section>

      {/* Ekstra stats række */}
      <section aria-labelledby="extra-stats-title">
        <h2 id="extra-stats-title" className="sr-only">Økonomi Oversigt</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <StatCard 
            title="Opgaver Denne Uge" 
            value={stats.tasksThisWeek} 
            icon={<CalendarDaysIcon />} 
            bgColorClass="bg-purple-500"
            textColorClass="text-white"
            onClick={() => onNavigate('tasks')}
            isLoading={statsLoading}
          />
          <StatCard 
            title="Månedlig Omsætning (estimat)" 
            value={formatCurrency(stats.monthlyRevenue)} 
            icon={<CurrencyDollarIcon />} 
            bgColorClass="bg-gradient-to-r from-green-500 to-emerald-600"
            textColorClass="text-white"
            onClick={() => onNavigate('reports_overview')}
            isLoading={statsLoading}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-surface shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-text-main mb-4 flex items-center">
            <ClockIcon className="w-6 h-6 mr-2 text-brand-primary"/>
            Nylige Aktiviteter
          </h3>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-md">
                    <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-brand-text-muted">Ingen nylige aktiviteter at vise.</p>
            </div>
          )}
        </div>

        <div className="bg-brand-surface shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-brand-text-main mb-4 flex items-center">
            <BoltIcon className="w-6 h-6 mr-2 text-brand-primary"/>
            Hurtige Handlinger
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('booking_requests')}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-brand-text-on-primary bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-dark transition-colors"
            >
              <DocumentPlusIcon className="w-5 h-5 mr-2" /> Se Kundeforespørgsler
            </button>
             <button 
              onClick={() => onNavigate('tasks')} 
              className="w-full flex items-center justify-center px-4 py-2.5 border border-brand-input-border text-sm font-medium rounded-md text-brand-text-main bg-brand-background hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-light transition-colors"
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" /> Opret/Se Opgaver
            </button>
             <button 
              onClick={() => onNavigate('employee_create')}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-brand-input-border text-sm font-medium rounded-md text-brand-text-main bg-brand-background hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-light transition-colors"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" /> Opret Medarbejder
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};