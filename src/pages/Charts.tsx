import React, { useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useTasks, useStore } from '../store/useStore';
import { STATUS_COLORS, TaskStatus } from '../types';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Charts: React.FC = () => {
  const { tasks, isLoading, error } = useTasks();
  const { loadTasks } = useStore();

  // Load tasks when component mounts
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Status Distribution Data
  const statusDistributionData = useMemo(() => {
    const statusCounts = {
      'Đã xong': 0,
      'Đang thực hiện': 0,
      'Chưa bắt đầu': 0,
      'Tạm dừng': 0,
    };

    tasks.forEach(task => {
      statusCounts[task["Trạng thái "]]++;
    });

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: Object.keys(statusCounts).map(status => STATUS_COLORS[status as TaskStatus]),
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [tasks]);

  // Progress by Unit Data
  const progressByUnitData = useMemo(() => {
    const unitProgress: Record<string, { total: number; completed: number }> = {};

    tasks.forEach(task => {
      const unit = task["Đơn vị thực hiện"];
      if (!unitProgress[unit]) {
        unitProgress[unit] = { total: 0, completed: 0 };
      }
      unitProgress[unit].total += task["Tiến độ (% hoàn thành)"];
      unitProgress[unit].completed++;
    });

    const units = Object.keys(unitProgress);
    const avgProgress = units.map(unit => 
      unitProgress[unit].completed > 0 
        ? Math.round(unitProgress[unit].total / unitProgress[unit].completed)
        : 0
    );

    return {
      labels: units,
      datasets: [
        {
          label: 'Tiến độ trung bình (%)',
          data: avgProgress,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [tasks]);

  // Timeline Progress Data
  const timelineData = useMemo(() => {
    // Group tasks by month
    const monthlyData: Record<string, { completed: number; total: number }> = {};

    tasks.forEach(task => {
      try {
        // Parse Vietnamese date format (dd/mm/yyyy)
        const [day, month, year] = task["Ngày kết thúc"].split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const monthKey = format(date, 'MM/yyyy');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { completed: 0, total: 0 };
        }
        
        monthlyData[monthKey].total++;
        if (task["Trạng thái "] === 'Đã xong') {
          monthlyData[monthKey].completed++;
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      return new Date(parseInt(yearA), parseInt(monthA) - 1).getTime() - 
             new Date(parseInt(yearB), parseInt(monthB) - 1).getTime();
    });

    const completedData = sortedMonths.map(month => monthlyData[month].completed);
    const totalData = sortedMonths.map(month => monthlyData[month].total);

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Tổng số công việc',
          data: totalData,
          borderColor: 'rgba(107, 114, 128, 1)',
          backgroundColor: 'rgba(107, 114, 128, 0.2)',
          tension: 0.1,
        },
        {
          label: 'Công việc hoàn thành',
          data: completedData,
          borderColor: 'rgba(16, 185, 129, 1)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.1,
        },
      ],
    };
  }, [tasks]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: function(value: any) {
            // Only show even tens: 0, 10, 20, 30, ..., 100
            if (value % 10 === 0) {
              return value;
            }
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // Calculate max tasks for y-axis
  const maxTasksInMonth = useMemo(() => {
    const monthlyData: Record<string, number> = {};
    
    tasks.forEach(task => {
      try {
        const [day, month, year] = task["Ngày kết thúc"].split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const monthKey = format(date, 'MM/yyyy');
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey]++;
      } catch (error) {
        // Skip invalid dates
      }
    });
    
    const maxTasks = Math.max(...Object.values(monthlyData), 0);
    return Math.ceil(maxTasks * 1.1); // Add 10% padding
  }, [tasks]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxTasksInMonth,
        ticks: {
          stepSize: 1,
          callback: function(value: any) {
            // Only show integer values
            if (Number.isInteger(value)) {
              return value;
            }
          }
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded lg:col-span-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Biểu đồ phân tích</h1>
          <p className="mt-2 text-sm text-gray-600">
            Phân tích chi tiết tiến độ và xu hướng công việc
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Distribution Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Phân bố theo trạng thái
            </h3>
            <div className="h-80">
              <Pie data={statusDistributionData} options={pieOptions} />
            </div>
          </div>

          {/* Progress by Unit Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tiến độ theo đơn vị
            </h3>
            <div className="h-80">
              <Bar data={progressByUnitData} options={chartOptions} />
            </div>
          </div>

          {/* Timeline Progress Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng tiến độ theo thời gian</h3>
            <div className="h-80">
              <Line data={timelineData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-600">
              {tasks.length}
            </div>
            <div className="text-sm text-gray-600">Tổng công việc</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t["Trạng thái "] === 'Đã xong').length}
            </div>
            <div className="text-sm text-gray-600">Đã hoàn thành</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter(t => t["Trạng thái "] === 'Đang thực hiện').length}
            </div>
            <div className="text-sm text-gray-600">Đang thực hiện</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tasks.length > 0 
                ? Math.round(tasks.reduce((sum, task) => sum + task["Tiến độ (% hoàn thành)"], 0) / tasks.length)
                : 0
              }%
            </div>
            <div className="text-sm text-gray-600">Tiến độ trung bình</div>
          </div>
        </div>

        {/* Chart Insights */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thông tin chi tiết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Phân tích trạng thái:</h4>
              <ul className="space-y-1">
                <li>• Công việc hoàn thành: {tasks.filter(t => t["Trạng thái "] === 'Đã xong').length} ({tasks.length > 0 ? Math.round((tasks.filter(t => t["Trạng thái "] === 'Đã xong').length / tasks.length) * 100) : 0}%)</li>
                <li>• Công việc đang thực hiện: {tasks.filter(t => t["Trạng thái "] === 'Đang thực hiện').length} ({tasks.length > 0 ? Math.round((tasks.filter(t => t["Trạng thái "] === 'Đang thực hiện').length / tasks.length) * 100) : 0}%)</li>
                <li>• Công việc chưa bắt đầu: {tasks.filter(t => t["Trạng thái "] === 'Chưa bắt đầu').length} ({tasks.length > 0 ? Math.round((tasks.filter(t => t["Trạng thái "] === 'Chưa bắt đầu').length / tasks.length) * 100) : 0}%)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Đơn vị thực hiện:</h4>
              <ul className="space-y-1">
                {Array.from(new Set(tasks.map(t => t["Đơn vị thực hiện"]))).map(unit => (
                  <li key={unit}>• {unit}: {tasks.filter(t => t["Đơn vị thực hiện"] === unit).length} công việc</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;