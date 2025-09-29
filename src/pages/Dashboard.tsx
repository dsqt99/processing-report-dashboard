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

  // Function to render status badge with enhanced visual effects
  const renderStatusBadge = (status: string) => {
    const getStatusStyle = (status: string) => {
      switch (status.trim()) {
        case 'Đã xong':
          return {
            gradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
            shadow: 'shadow-emerald-200/50',
            border: 'border-emerald-300/50',
            glow: 'hover:shadow-emerald-300/70'
          };
        case 'Đang thực hiện':
          return {
            gradient: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            shadow: 'shadow-blue-200/50',
            border: 'border-blue-300/50',
            glow: 'hover:shadow-blue-300/70'
          };
        case 'Chưa bắt đầu':
          return {
            gradient: 'bg-gradient-to-r from-amber-500 to-yellow-600',
            shadow: 'shadow-amber-200/50',
            border: 'border-amber-300/50',
            glow: 'hover:shadow-amber-300/70'
          };
        case 'Tạm dừng':
          return {
            gradient: 'bg-gradient-to-r from-rose-500 to-red-600',
            shadow: 'shadow-rose-200/50',
            border: 'border-rose-300/50',
            glow: 'hover:shadow-rose-300/70'
          };
        default:
          return {
            gradient: 'bg-gradient-to-r from-gray-500 to-slate-600',
            shadow: 'shadow-gray-200/50',
            border: 'border-gray-300/50',
            glow: 'hover:shadow-gray-300/70'
          };
      }
    };

    const style = getStatusStyle(status);
    
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white ${style.gradient} ${style.shadow} border-2 ${style.border} shadow-lg transition-all duration-300 transform hover:scale-110 ${style.glow} hover:shadow-xl group`}>
        <div className="w-2 h-2 bg-white/80 rounded-full mr-2 animate-pulse group-hover:animate-bounce"></div>
        {status}
      </span>
    );
  };

  // Function to render progress bar with enhanced visual effects
  const renderProgressBar = (progress: number) => {
    const getProgressColor = (progress: number) => {
      if (progress >= 80) return 'from-emerald-500 to-green-600';
      if (progress >= 60) return 'from-blue-500 to-indigo-600';
      if (progress >= 40) return 'from-amber-500 to-yellow-600';
      if (progress >= 20) return 'from-orange-500 to-red-500';
      return 'from-rose-500 to-red-600';
    };

    const getShadowColor = (progress: number) => {
      if (progress >= 80) return 'shadow-emerald-300/50';
      if (progress >= 60) return 'shadow-blue-300/50';
      if (progress >= 40) return 'shadow-amber-300/50';
      if (progress >= 20) return 'shadow-orange-300/50';
      return 'shadow-rose-300/50';
    };

    return (
      <div className="relative w-full">
        <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner overflow-hidden">
          <div
            className={`bg-gradient-to-r ${getProgressColor(progress)} h-3 rounded-full transition-all duration-1000 ease-out shadow-lg ${getShadowColor(progress)} relative overflow-hidden`}
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
            
            {/* Progress indicator dot */}
            {progress > 0 && (
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* Progress percentage overlay */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className={`text-xs font-bold px-2 py-1 rounded-md ${progress >= 50 ? 'bg-white/90 text-gray-800' : 'bg-gray-800/90 text-white'} shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100`}>
            {progress}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Timestamp and Refresh Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-700 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 shadow-sm">
            <span className="font-medium text-gray-900">Cập nhật lần cuối:</span> {saveTime || 'Chưa có dữ liệu'}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
              isRefreshing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed scale-95'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isRefreshing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang làm mới...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </div>
            )}
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-6 mb-10">
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
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl border-2 border-gray-200/60 shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-8 py-8 border-b-2 border-gradient-to-r from-blue-200/50 to-indigo-200/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-2">
                  Danh sách công việc gần đây
                </h2>
                <p className="text-sm text-gray-600 font-medium">Theo dõi tiến độ và trạng thái công việc</p>
              </div>
              <div className="bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-blue-200/50 shadow-lg">
                <span className="text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  {recentTasks.length} / {tasks.length} công việc
                </span>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {recentTasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-100 via-blue-100/70 to-indigo-100/70">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-blue-200/30">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        <span>ID</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-blue-200/30">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                        <span>Tên công việc</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-blue-200/30">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"></div>
                        <span>Đơn vị thực hiện</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-blue-200/30">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <span>Tiến độ</span>
                      </div>
                    </th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-800 uppercase tracking-wider border-b-2 border-blue-200/30">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full"></div>
                        <span>Trạng thái</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/60 backdrop-blur-sm divide-y-2 divide-gray-100/80">
                  {recentTasks.map((task, index) => (
                    <tr key={task.ID} className={`group hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-indigo-50/60 hover:to-purple-50/40 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-lg ${
                      index % 2 === 0 
                        ? 'bg-gradient-to-r from-white/80 to-gray-50/40' 
                        : 'bg-gradient-to-r from-gray-50/60 to-blue-50/30'
                    }`}>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg group-hover:scale-125 transition-transform duration-300"></div>
                          <span className="text-sm font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            #{task.ID}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors duration-300 text-sm leading-relaxed">
                            {task["Tên Công việc"]}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 border border-amber-200/50 shadow-sm group-hover:shadow-md transition-all duration-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full mr-2"></div>
                          {task["Đơn vị thực hiện"]}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1 min-w-0">
                            {renderProgressBar(task["Tiến độ (% hoàn thành)"])}
                          </div>
                          <span className="text-xs font-bold bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-xl border border-purple-200/50 shadow-sm">
                            {task["Tiến độ (% hoàn thành)"]}%
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {renderStatusBadge(task["Trạng thái "])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-8 py-20 text-center">
                <div className="text-gray-500">
                  <div className="mx-auto h-20 w-20 text-gray-400 mb-6 bg-gradient-to-br from-gray-100 via-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-3">
                    Chưa có công việc
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">Bắt đầu bằng cách thêm công việc mới vào hệ thống.</p>
                </div>
              </div>
            )}
          </div>
          
          {recentTasks.length > 0 && tasks.length > 10 && (
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-t-2 border-gradient-to-r from-blue-200/50 to-indigo-200/50">
              <div className="text-center">
                <a 
                  href="/task-list" 
                  className="inline-flex items-center text-sm font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent transition-all duration-300 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-blue-200/50 hover:border-blue-300/70 hover:bg-white/90 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <span>Xem tất cả {tasks.length} công việc</span>
                  <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
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