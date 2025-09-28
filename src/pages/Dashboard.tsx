import React, { useEffect, useState } from 'react';
import { useDashboardStats, useStore, useSaveTime } from '../store/useStore';
import StatisticsCard from '../components/StatisticsCard';
import { Task, STATUS_COLORS } from '../types';
import { refreshData } from '../services/api';

const Dashboard: React.FC = () => {
  const { stats, isLoading, error } = useDashboardStats();
  const { tasks, loadTasks, loadConfig } = useStore();
  const saveTime = useSaveTime();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load config and tasks when component mounts
  useEffect(() => {
    const initializeData = async () => {
      await loadConfig(); // Load config first
      await loadTasks();  // Then load tasks
    };
    
    initializeData();
  }, [loadConfig, loadTasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshData();
      if (result.success) {
        await loadTasks(); // Reload tasks after refresh
        alert('Dữ liệu đã được làm mới thành công!');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Có lỗi xảy ra khi làm mới dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Default stats when no configuration is set up
  const defaultStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    paused: 0
  };

  // Get recent tasks (limit to 10 for dashboard)
  const recentTasks = tasks.slice(0, 10);

  // Function to render status badge
  const renderStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6B7280';
    return (
      <span 
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {status}
      </span>
    );
  };

  // Function to render progress bar
  const renderProgressBar = (progress: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Timestamp and Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Cập nhật lần cuối: {saveTime || 'Chưa có dữ liệu'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRefreshing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRefreshing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang làm mới...
              </div>
            ) : (
              'Làm mới'
            )}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <StatisticsCard
            title="Tổng số công việc"
            value={stats?.total || 0}
            type="total"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Hoàn thành"
            value={stats?.completed || 0}
            type="Đã xong"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Đang thực hiện"
            value={stats?.inProgress || 0}
            type="Đang thực hiện"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Chưa bắt đầu"
            value={stats?.notStarted || 0}
            type="Chưa bắt đầu"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Tạm dừng"
            value={stats?.paused || 0}
            type="Tạm dừng"
            isLoading={isLoading}
          />
        </div>

        {/* Task List Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Danh sách công việc gần đây</h2>
              <span className="text-sm text-gray-500">
                {recentTasks.length} / {tasks.length} công việc
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {recentTasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên công việc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn vị thực hiện
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiến độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTasks.map((task) => (
                    <tr key={task.ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.ID}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {task["Tên Công việc"]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task["Đơn vị thực hiện"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            {renderProgressBar(task["Tiến độ (% hoàn thành)"])}
                          </div>
                          <span className="text-xs font-medium">
                            {task["Tiến độ (% hoàn thành)"]}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(task["Trạng thái "])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có công việc</h3>
                  <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm công việc mới.</p>
                </div>
              </div>
            )}
          </div>
          
          {recentTasks.length > 0 && tasks.length > 10 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <a 
                  href="/task-list" 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Xem tất cả {tasks.length} công việc →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;