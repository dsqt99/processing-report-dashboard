import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useTasks } from '../store/useStore';
import { Task, TaskStatus, STATUS_COLORS } from '../types';

type SortField = 'ID' | 'name' | 'unit' | 'progress' | 'status';
type SortOrder = 'asc' | 'desc';

const Tasks: React.FC = () => {
  const {
    filteredTasks,
    isLoading,
    error,
    statusFilter,
    searchTerm,
    setStatusFilter,
    setSearchTerm,
    refreshData,
  } = useTasks();

  const [sortField, setSortField] = useState<SortField>('ID');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Sort tasks
  const sortedTasks = React.useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'ID':
          aValue = a.ID;
          bValue = b.ID;
          break;
        case 'name':
          aValue = a["Tên Công việc"];
          bValue = b["Tên Công việc"];
          break;
        case 'unit':
          aValue = a["Đơn vị thực hiện"];
          bValue = b["Đơn vị thực hiện"];
          break;
        case 'progress':
          aValue = a["Tiến độ (% hoàn thành)"];
          bValue = b["Tiến độ (% hoàn thành)"];
          break;
        case 'status':
          aValue = a["Trạng thái "];
          bValue = b["Trạng thái "];
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [filteredTasks, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const color = STATUS_COLORS[status];
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {status}
      </span>
    );
  };

  const getProgressBar = (progress: number, status: TaskStatus) => {
    const color = STATUS_COLORS[status];
    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
          {progress}%
        </span>
      </div>
    );
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDownIcon className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách công việc</h1>
          <p className="mt-2 text-sm text-gray-600">
            Quản lý và theo dõi chi tiết từng công việc
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm công việc..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Đã xong">Đã xong</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Tạm dừng">Tạm dừng</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Đang tải...' : 'Làm mới'}
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('ID')}
                  >
                    <div className="flex items-center">
                      ID
                      <SortIcon field="ID" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Tên công việc
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center">
                      Đơn vị thực hiện
                      <SortIcon field="unit" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center">
                      Tiến độ
                      <SortIcon field="progress" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="animate-pulse">Đang tải dữ liệu...</div>
                    </td>
                  </tr>
                ) : sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      Không tìm thấy công việc nào
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task, index) => (
                    <tr key={task.ID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {task.ID}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={task["Tên Công việc"]}>
                          {task["Tên Công việc"]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task["Đơn vị thực hiện"]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>Bắt đầu: {task["Ngày bắt đầu "]}</div>
                          <div>Kết thúc: {task["Ngày kết thúc"]}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(task["Trạng thái "])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          {getProgressBar(task["Tiến độ (% hoàn thành)"], task["Trạng thái "])}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={task["Ghi chú - Mô tả"]}>
                          {task["Ghi chú - Mô tả"]}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task["Đánh giá"]}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <div className="text-sm text-gray-600">
            Hiển thị {sortedTasks.length} công việc
            {statusFilter !== 'all' && ` (lọc theo: ${statusFilter})`}
            {searchTerm && ` (tìm kiếm: "${searchTerm}")`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;