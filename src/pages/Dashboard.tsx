import React, { useEffect } from 'react';
import { useDashboardStats } from '../store/useStore';
import StatisticsCard from '../components/StatisticsCard';
import ProgressOverview from '../components/ProgressOverview';

const Dashboard: React.FC = () => {
  const { stats, isLoading, error } = useDashboardStats();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Timestamp and Refresh */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Cập nhật lần cuối: 16:11:23 24/9/2025
          </div>
          <button className="bg-black text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800">🔄 Làm mới</button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <StatisticsCard
            title="Tổng số công việc"
            value={stats.total}
            type="total"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Hoàn thành"
            value={stats.completed}
            type="Đã xong"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Đang thực hiện"
            value={stats.inProgress}
            type="Đang thực hiện"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Chưa bắt đầu"
            value={stats.notStarted}
            type="Chưa bắt đầu"
            isLoading={isLoading}
          />
          <StatisticsCard
            title="Tạm dừng"
            value={stats.paused}
            type="Tạm dừng"
            isLoading={isLoading}
          />
        </div>

        {/* Progress Overview */}
        <div className="mt-8">
          <ProgressOverview stats={stats} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;