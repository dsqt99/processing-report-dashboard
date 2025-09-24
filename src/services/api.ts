import axios, { AxiosResponse } from 'axios';
import { Task, ApiRequest, DashboardStats, TaskStatus } from '../types';

// API endpoint
const WEBHOOK_API_URL = 'https://67c21da0bd4e.ngrok-free.app/webhook/get-sheet';

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response interface
interface ApiResponse {
  data: Task[];
}

// Error handling class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fetch tasks from Google Sheets via webhook
export const fetchTasks = async (request: ApiRequest): Promise<Task[]> => {
  try {
    const response: AxiosResponse<Task[]> = await apiClient.post(WEBHOOK_API_URL, request);

    if (!response.data || !Array.isArray(response.data)) {
      throw new ApiError('Invalid response format from API');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        throw new ApiError('Sheet not found or invalid URL', status);
      } else if (status === 403) {
        throw new ApiError('Access denied to the sheet', status);
      } else if (status === 500) {
        throw new ApiError('Server error occurred', status);
      } else {
        throw new ApiError(`API request failed: ${message}`, status);
      }
    }
    
    throw new ApiError('Network error or unexpected error occurred');
  }
};

// Calculate dashboard statistics from tasks
export const calculateStats = (tasks: Task[]): DashboardStats => {
  const total = tasks.length;
  
  const completed = tasks.filter(task => task["Trạng thái "] === 'Đã xong').length;
  const inProgress = tasks.filter(task => task["Trạng thái "] === 'Đang thực hiện').length;
  const notStarted = tasks.filter(task => task["Trạng thái "] === 'Chưa bắt đầu').length;
  const paused = tasks.filter(task => task["Trạng thái "] === 'Tạm dừng').length;
  
  // Calculate overall progress as weighted average
  const totalProgress = tasks.reduce((sum, task) => {
    return sum + (task["Tiến độ (% hoàn thành)"] || 0);
  }, 0);
  
  const overallProgress = total > 0 ? Math.round(totalProgress / total) : 0;
  
  return {
    total,
    completed,
    inProgress,
    notStarted,
    paused,
    overallProgress,
  };
};

// Validate task data
export const validateTask = (task: any): task is Task => {
  return (
    typeof task === 'object' &&
    task !== null &&
    typeof task.row_number === 'number' &&
    typeof task.ID === 'number' &&
    typeof task["Tên Công việc"] === 'string' &&
    typeof task["Đơn vị thực hiện"] === 'string' &&
    typeof task["Ngày bắt đầu "] === 'string' &&
    typeof task["Ngày kết thúc"] === 'string' &&
    typeof task["Trạng thái "] === 'string' &&
    typeof task["Tiến độ (% hoàn thành)"] === 'number' &&
    typeof task["Ghi chú - Mô tả"] === 'string' &&
    typeof task["Đánh giá"] === 'string'
  );
};

// Filter tasks by status
export const filterTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] => {
  return tasks.filter(task => task["Trạng thái "] === status);
};

// Search tasks by name
export const searchTasks = (tasks: Task[], searchTerm: string): Task[] => {
  if (!searchTerm.trim()) return tasks;
  
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task["Tên Công việc"].toLowerCase().includes(term) ||
    task["Đơn vị thực hiện"].toLowerCase().includes(term) ||
    task["Ghi chú - Mô tả"].toLowerCase().includes(term)
  );
};

// Sort tasks by different criteria
export const sortTasks = (tasks: Task[], sortBy: 'id' | 'name' | 'progress' | 'status', order: 'asc' | 'desc' = 'asc'): Task[] => {
  const sorted = [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'id':
        aValue = a.ID;
        bValue = b.ID;
        break;
      case 'name':
        aValue = a["Tên Công việc"];
        bValue = b["Tên Công việc"];
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
      return order === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
  
  return sorted;
};