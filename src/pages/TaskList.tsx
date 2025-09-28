import React, { useState } from 'react';
import { 
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import { Task, TaskStatus, STATUS_COLORS } from '../types';

type SortField = 'ID' | 'name' | 'unit' | 'progress' | 'status';
type SortOrder = 'asc' | 'desc';

const TaskList: React.FC = () => {
  const { tasks, isLoading, error } = useStore();
  const [sortField, setSortField] = useState<SortField>('ID');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Sort tasks
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
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
  }, [tasks, sortField, sortOrder]);

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
        <span className="text-sm text-gray-600 min-w-[3rem]">{progress}%</span>
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Lỗi tải dữ liệu</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Danh sách công việc
          </h1>
          <p className="text-gray-600">
            Hiển thị toàn bộ danh sách công việc
          </p>
        </div>

        {/* Tasks Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
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
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('progress')}
                  >
                    <div className="flex items-center">
                      Tiến độ
                      <SortIcon field="progress" />
                    </div>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Không có dữ liệu công việc
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => (
                    <tr key={task.ID} className="hover:bg-gray-50">
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
                        <div className="w-32">
                          {getProgressBar(task["Tiến độ (% hoàn thành)"], task["Trạng thái "])}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getStatusBadge(task["Trạng thái "])}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {!isLoading && sortedTasks.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị {sortedTasks.length} công việc
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;