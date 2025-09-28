// Task interface theo API response format
export interface Task {
  row_number: number;
  ID: number;
  "Tên Công việc": string;
  "Đơn vị thực hiện": string;
  "Ngày bắt đầu ": string;
  "Ngày kết thúc": string;
  "Trạng thái ": TaskStatus;
  "Tiến độ (% hoàn thành)": number;
  "Ghi chú - Mô tả": string;
  "Đánh giá": string;
}

// Task status types
export type TaskStatus = 'Đang thực hiện' | 'Đã xong' | 'Chưa bắt đầu' | 'Tạm dừng';

// Dashboard statistics interface
export interface DashboardStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  paused: number;
  overallProgress: number;
}

// Webhook configuration interface
export interface WebhookConfig {
  sheet_url: string;
  sheet_name: string;
}

// API request interface
export interface ApiRequest {
  sheet_url: string;
  sheet_name: string;
}

// Local storage interfaces
export interface StoredConfig {
  sheet_url: string;
  sheet_name: string;
}

export interface CachedData {
  tasks: Task[];
  timestamp: number;
  stats: DashboardStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultView: 'dashboard' | 'tasks' | 'charts';
  autoRefresh: boolean;
  notificationsEnabled: boolean;
}

// Status color mapping
export const STATUS_COLORS: Record<TaskStatus, string> = {
  'Đã xong': '#10B981',     // green
  'Đang thực hiện': '#3B82F6', // blue
  'Chưa bắt đầu': '#6B7280',   // gray
  'Tạm dừng': '#EF4444'        // red
};

// Local storage keys
export const STORAGE_KEYS = {
  WEBHOOK_CONFIG: 'webhookConfig',
  CACHED_TASKS: 'cachedTasks',
  LAST_SYNC: 'lastSync',
  USER_PREFERENCES: 'userPreferences'
} as const;

// Sample data for testing
export const sampleTaskData: Task[] = [
  {
    row_number: 2,
    ID: 1,
    "Tên Công việc": "làm sạch dữ liệu can phạm",
    "Đơn vị thực hiện": "PV06",
    "Ngày bắt đầu ": "15/9/2025",
    "Ngày kết thúc": "31/10/2025",
    "Trạng thái ": "Đang thực hiện",
    "Tiến độ (% hoàn thành)": 20,
    "Ghi chú - Mô tả": "đẩy nhanh tiến độ",
    "Đánh giá": "chưa tốt"
  },
  {
    row_number: 3,
    ID: 2,
    "Tên Công việc": "làm sạch dữ liệu người nước ngoài",
    "Đơn vị thực hiện": "PA08",
    "Ngày bắt đầu ": "16/9/2025",
    "Ngày kết thúc": "30/9/2025",
    "Trạng thái ": "Đang thực hiện",
    "Tiến độ (% hoàn thành)": 90,
    "Ghi chú - Mô tả": "Cần thêm phản hồi",
    "Đánh giá": "Tốt"
  },
  {
    row_number: 4,
    ID: 3,
    "Tên Công việc": "triển khai đường truyền cho công an các xã",
    "Đơn vị thực hiện": "PV01",
    "Ngày bắt đầu ": "15/7/2025",
    "Ngày kết thúc": "30/7/2025",
    "Trạng thái ": "Đã xong",
    "Tiến độ (% hoàn thành)": 100,
    "Ghi chú - Mô tả": "Hoàn thành tiến độ",
    "Đánh giá": "Tốt"
  }
];