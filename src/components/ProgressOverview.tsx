import React from 'react';
import { DashboardStats, STATUS_COLORS } from '../types';

interface ProgressOverviewProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({ 
  stats, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">
          Tiến độ tổng thể
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const { total, completed, inProgress, notStarted, paused, overallProgress } = stats;
  
  // Calculate percentages for progress bar
  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const notStartedPercent = total > 0 ? (notStarted / total) * 100 : 0;
  const pausedPercent = total > 0 ? (paused / total) * 100 : 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tiến độ tổng thể
          </h3>
          <div className="text-2xl font-bold text-gray-900">
            {overallProgress}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-gray-300 h-2 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Hoàn thành: 0%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Đang thực hiện: 0%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Chưa bắt đầu: 0%
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">
              Tạm dừng: 0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressOverview;