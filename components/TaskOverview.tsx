import React, { useState, useMemo, useCallback } from 'react';
import { useTasks, useCustomers, useEmployees } from '../hooks/useSupabase';
import { Task, TaskStatus, NewTaskData, TaskCreationData } from '../types';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, UserCircleIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, PlusCircleIcon, ArrowPathIcon } from './icons/OutlineIcons';
import { BriefcaseIconSolid, CheckCircleIconSolid, ClockIconSolid, ListBulletIconSolid, PlayCircleIconSolid } from './icons/SolidIcons';
import { CreateTaskModal } from './CreateTaskModal';
import { DENMARK_LOCALE } from '../constants';


const TaskCard: React.FC<{ task: Task; onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void }> = ({ task, onUpdateStatus }) => {
  const getStatusClasses = (status: TaskStatus): { bg: string; text: string; border: string } => {
    switch (status) {
      case TaskStatus.PLANNED: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-500'};
      case TaskStatus.IN_PROGRESS: return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-500' };
      case TaskStatus.COMPLETED: return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-500' };
      case TaskStatus.CANCELLED: return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-500' };
      default: return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-500' };
    }
  };
  
  const statusLook = getStatusClasses(task.status);

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PLANNED: return <ListBulletIconSolid className={`w-5 h-5 ${statusLook.text}`} />;
      case TaskStatus.IN_PROGRESS: return <PlayCircleIconSolid className={`w-5 h-5 ${statusLook.text}`} />;
      case TaskStatus.COMPLETED: return <CheckCircleIconSolid className={`w-5 h-5 ${statusLook.text}`} />;
      case TaskStatus.CANCELLED: return <XCircleIcon className={`w-5 h-5 ${statusLook.text}`} />; // Using outline XCircle as solid one is not defined
      default: return <ListBulletIconSolid className={`w-5 h-5 ${statusLook.text}`} />;
    }
  };

  return (
    <div className={`bg-brand-surface shadow-lg rounded-xl p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 ${statusLook.border}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">{task.customerName || 'Ukendt Kunde'}</h3>
          <p className="text-xs text-brand-text-muted flex items-center"><MapPinIcon className="w-3 h-3 mr-1 text-brand-primary-light" />{task.customerAddress || 'Adresse mangler'}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${statusLook.bg} ${statusLook.text}`}>
          {getStatusIcon(task.status)}
          <span>{task.status}</span>
        </span>
      </div>

      <div className="space-y-1 text-sm text-brand-text-muted mb-3">
        <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Tid: {task.startTime} ({task.estimatedDurationHours} timer)</p>
        {task.employeeName && <p className="flex items-center"><UserCircleIcon className="w-4 h-4 mr-2 text-brand-primary-light" /> Medarbejder: {task.employeeName}</p>}
         {task.notes && <p className="text-xs italic mt-1 text-brand-text-muted">Noter: {task.notes}</p>}
      </div>
      
      <div className="flex space-x-2 mt-4 border-t border-brand-border pt-3">
        {task.status === TaskStatus.PLANNED && (
          <button 
            onClick={() => onUpdateStatus(task.id, TaskStatus.IN_PROGRESS)}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-800 text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            Start Opgave
          </button>
        )}
        {task.status === TaskStatus.IN_PROGRESS && (
          <button 
            onClick={() => onUpdateStatus(task.id, TaskStatus.COMPLETED)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            Fuldfør Opgave
          </button>
        )}
         {(task.status === TaskStatus.PLANNED || task.status === TaskStatus.IN_PROGRESS) && (
           <button 
            onClick={() => onUpdateStatus(task.id, TaskStatus.CANCELLED)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors"
          >
            Annuller
          </button>
         )}
        {task.status === TaskStatus.COMPLETED && (
          <p className={`text-xs ${statusLook.text} font-medium flex items-center`}><CheckCircleIcon className="w-4 h-4 mr-1"/> Opgave fuldført</p>
        )}
         {task.status === TaskStatus.CANCELLED && (
          <p className={`text-xs ${statusLook.text} font-medium flex items-center`}><XCircleIcon className="w-4 h-4 mr-1"/> Opgave annulleret</p>
        )}
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-brand-surface shadow-lg rounded-xl p-5 animate-pulse">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="h-6 bg-brand-primary/20 rounded w-32 mb-1"></div>
            <div className="h-4 bg-brand-text-muted/20 rounded w-24"></div>
          </div>
          <div className="h-6 bg-brand-primary/20 rounded w-16"></div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-brand-text-muted/20 rounded w-full"></div>
          <div className="h-4 bg-brand-text-muted/20 rounded w-3/4"></div>
        </div>
        <div className="border-t border-brand-border pt-3">
          <div className="h-8 bg-brand-primary/20 rounded w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

interface TaskOverviewProps {
  showSuccessMessage: (message: string) => void;
}

export const TaskOverview: React.FC<TaskOverviewProps> = ({ showSuccessMessage }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const formattedDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Calculate date range for the selected date (to optimize queries)
  const dateFilter = useMemo(() => {
    const start = formattedDate(selectedDate);
    const end = start; // Only fetch tasks for the selected date
    return { start, end };
  }, [selectedDate]);

  const { tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks, updateTaskStatus, createTask } = useTasks(dateFilter);
  const { customers, loading: customersLoading } = useCustomers();
  const { employees, loading: employeesLoading } = useEmployees();
  
  const displayDate = (date: Date): string => {
     return date.toLocaleDateString(DENMARK_LOCALE, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  const tasksForSelectedDate = useMemo(() => {
    return tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks]);

  const handleDateChange = (daysToAdd: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + daysToAdd);
      return newDate;
    });
  };

  const handleUpdateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
    if (updatedTask) {
        showSuccessMessage(`Opgave for ${updatedTask.customerName || 'kunde'} er ${newStatus.toLowerCase()}.`);
      }
    } catch (error) {
      console.error('Fejl ved opdatering af opgave status:', error);
      showSuccessMessage('Der opstod en fejl ved opdatering af opgaven.');
    }
  }, [updateTaskStatus, showSuccessMessage]);

  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleCloseCreateModal = () => setIsCreateModalOpen(false);

  const handleAddTask = async (taskData: TaskCreationData) => {
    try {
      const newTask = await createTask({
        customerId: taskData.customerId,
        employeeId: taskData.employeeId,
        scheduledDate: taskData.scheduledDate,
        startTime: taskData.startTime,
        estimatedDurationHours: taskData.estimatedDurationHours,
        notes: taskData.notes,
      });
      
    if (newTask) {
        showSuccessMessage(`Ny opgave for ${newTask.customerName || 'kunde'} oprettet den ${newTask.scheduledDate}.`);
    }
    handleCloseCreateModal();
    } catch (error) {
      console.error('Fejl ved oprettelse af opgave:', error);
      showSuccessMessage('Der opstod en fejl ved oprettelse af opgaven.');
    }
  };

  const loading = tasksLoading || customersLoading || employeesLoading;

  if (tasksError) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600 mb-4">
          <CalendarIcon className="w-16 h-16 mx-auto mb-2"/>
          <p className="font-medium">Fejl ved indlæsning af opgaver</p>
          <p className="text-sm mt-1">{tasksError}</p>
        </div>
        <button 
          onClick={refetchTasks}
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
       <div className="flex justify-between items-center mb-6">
        <div></div> 
         <button 
            onClick={handleOpenCreateModal}
            disabled={loading}
            className="bg-brand-primary hover:bg-brand-primary-dark text-brand-text-on-primary font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex items-center disabled:opacity-50"
          >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Ny Opgave
        </button>
      </div>

      <div className="mb-6 p-4 bg-brand-surface shadow rounded-lg flex items-center justify-between">
        <button 
          onClick={() => handleDateChange(-1)} 
          className="p-2 rounded-md hover:bg-brand-background transition-colors"
          aria-label="Forrige dag"
        >
          <ChevronLeftIcon className="w-6 h-6 text-brand-primary" />
        </button>
        <h3 className="text-lg font-medium text-brand-primary text-center">
          {displayDate(selectedDate)}
        </h3>
        <button 
          onClick={() => handleDateChange(1)} 
          className="p-2 rounded-md hover:bg-brand-background transition-colors"
          aria-label="Næste dag"
        >
          <ChevronRightIcon className="w-6 h-6 text-brand-primary" />
        </button>
      </div>
       <button 
          onClick={() => setSelectedDate(new Date())} 
          className="mb-6 w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary-dark text-brand-secondary-content font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          Gå til i dag
        </button>

      {loading ? (
        <LoadingSkeleton />
      ) : tasksForSelectedDate.length === 0 ? (
        <div className="text-center py-12 bg-brand-surface rounded-lg shadow">
          <CalendarIcon className="w-16 h-16 mx-auto text-brand-text-muted mb-4" />
          <p className="text-brand-text-muted">Ingen opgaver planlagt for denne dag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasksForSelectedDate.map(task => (
            <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onAddTask={handleAddTask}
          customers={customers}
          employees={employees}
          defaultDate={formattedDate(selectedDate)}
        />
      )}
    </div>
  );
};