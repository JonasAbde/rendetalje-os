import React, { useState } from 'react';
import { useReportsData } from '../hooks/useSupabase';
import { DENMARK_LOCALE } from '../constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  DocumentChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  UserGroupIcon,
  CircleStackIcon,
  ArrowPathIcon,
  XCircleIcon
} from './icons/OutlineIcons';

interface ReportsOverviewViewProps {}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export const ReportsOverviewView: React.FC<ReportsOverviewViewProps> = () => {
  const { reportsData, loading, error } = useReportsData();
  const [activeChart, setActiveChart] = useState<'revenue' | 'tasks' | 'employees' | 'trends'>('revenue');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(DENMARK_LOCALE, {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value}%`;

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Fejl ved indlæsning af rapporter</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  if (!reportsData) return null;

  const quickStats = [
    {
      title: 'Total Omsætning (År)',
      value: formatCurrency(reportsData.monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)),
      icon: CurrencyDollarIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Opgaver (År)',
      value: reportsData.monthlyRevenue.reduce((sum, month) => sum + month.tasks, 0).toString(),
      icon: DocumentChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Aktive Kunder',
      value: reportsData.topCustomers.length.toString(),
      icon: UsersIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Lager Alerts',
      value: reportsData.inventoryAlerts.length.toString(),
      icon: CircleStackIcon,
      color: reportsData.inventoryAlerts.length > 0 ? 'bg-red-500' : 'bg-gray-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hurtig Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className={`${stat.color} rounded-lg p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart Navigation */}
      <div className="flex flex-wrap gap-2 border-b">
        {[
          { key: 'revenue', label: 'Månedlig Omsætning', icon: CurrencyDollarIcon },
          { key: 'tasks', label: 'Opgave Kategorier', icon: DocumentChartBarIcon },
          { key: 'employees', label: 'Medarbejder Performance', icon: UserGroupIcon },
          { key: 'trends', label: 'Ugentlige Trends', icon: ArrowPathIcon }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeChart === key
                ? 'bg-brand-primary text-white'
                : 'text-brand-text-muted hover:text-brand-primary hover:bg-gray-50'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeChart === 'revenue' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Månedlig Omsætning & Opgaver</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportsData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Omsætning' : 'Opgaver'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Omsætning" />
                <Bar yAxisId="right" dataKey="tasks" fill="#10B981" name="Opgaver" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'tasks' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Opgaver Fordelt på Kategorier</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportsData.tasksByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportsData.tasksByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {reportsData.tasksByCategory.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      ></div>
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold">{category.count}</span>
                      <span className="text-sm text-gray-500 ml-2">({category.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeChart === 'employees' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Medarbejder Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={reportsData.employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hours" fill="#8B5CF6" name="Timer" />
                <Bar yAxisId="right" dataKey="tasks" fill="#F59E0B" name="Opgaver" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Ugentlige Trends (Sidste 8 Uger)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={reportsData.weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : value,
                    name === 'revenue' ? 'Omsætning' : 
                    name === 'newCustomers' ? 'Nye Kunder' : 'Opgaver'
                  ]}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" name="Omsætning" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="newCustomers" stroke="#3B82F6" name="Nye Kunder" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="completedTasks" stroke="#F59E0B" name="Opgaver" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Kunder & Lager Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Kunder */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-brand-primary" />
            Top Kunder (Omsætning)
          </h3>
          <div className="space-y-3">
            {reportsData.topCustomers.map((customer, index) => (
              <div key={customer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-brand-primary text-white text-xs rounded-full flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span className="font-medium">{customer.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(customer.revenue)}</div>
                  <div className="text-sm text-gray-500">{customer.tasks} opgaver</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lager Alerts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CircleStackIcon className="h-5 w-5 mr-2 text-orange-500" />
            Lager Alerts
          </h3>
          {reportsData.inventoryAlerts.length > 0 ? (
            <div className="space-y-3">
              {reportsData.inventoryAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  alert.status === 'critical' ? 'bg-red-50 border-red-400' : 'bg-yellow-50 border-yellow-400'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{alert.item}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      alert.status === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {alert.status === 'critical' ? 'Kritisk' : 'Lav'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Beholdning: {alert.current} / Min: {alert.minimum}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CircleStackIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Ingen lager alerts</p>
              <p className="text-sm">Alt ser godt ud! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Eksporter Rapporter</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => exportToCSV(reportsData.monthlyRevenue, 'månedlig_omsætning')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Månedlig Data
          </button>
          <button
            onClick={() => exportToCSV(reportsData.topCustomers, 'top_kunder')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          >
            Top Kunder
          </button>
          <button
            onClick={() => exportToCSV(reportsData.employeePerformance, 'medarbejder_performance')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
          >
            Medarbejdere
          </button>
          <button
            onClick={() => exportToCSV(reportsData.weeklyTrends, 'ugentlige_trends')}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm"
          >
            Trends
          </button>
        </div>
      </div>
    </div>
  );
}; 