import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Task, 
  DashboardStats, 
  WebhookConfig, 
  TaskStatus,
  STORAGE_KEYS,
  sampleTaskData
} from '../types';
import { fetchTasks, calculateStats, ApiError } from '../services/api';

interface AppState {
  // Tasks state
  tasks: Task[];
  filteredTasks: Task[];
  stats: DashboardStats;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Webhook config
  config: WebhookConfig;
  
  // Filters and search
  statusFilter: TaskStatus | 'all';
  searchTerm: string;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  loadTasks: () => Promise<void>;
  setConfig: (config: WebhookConfig) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
  loadSampleData: () => void;
}

// Calculate initial stats
const initialStats = calculateStats(sampleTaskData);

// Filter tasks based on status and search term
const filterTasks = (tasks: Task[], statusFilter: TaskStatus | 'all', searchTerm: string): Task[] => {
  let filtered = tasks;
  
  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(task => task["Trạng thái "] === statusFilter);
  }
  
  // Filter by search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(task => 
      task["Tên Công việc"].toLowerCase().includes(term) ||
      task["Đơn vị thực hiện"].toLowerCase().includes(term) ||
      task["Ghi chú - Mô tả"].toLowerCase().includes(term)
    );
  }
  
  return filtered;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: sampleTaskData,
      filteredTasks: sampleTaskData,
      stats: initialStats,
      isLoading: false,
      error: null,
      config: {
        sheet_url: 'https://docs.google.com/spreadsheets/d/1vy0dgWegn6btmYTPfvpPnWa7o897H39QDnZqnKzhi7E/edit?usp=sharing',
        sheet_name: 'Trang tính1',
        refreshInterval: 5, // 5 minutes
      },
      statusFilter: 'all',
      searchTerm: '',
      
      // Actions
      setTasks: (tasks: Task[]) => {
        const state = get();
        const stats = calculateStats(tasks);
        const filteredTasks = filterTasks(tasks, state.statusFilter, state.searchTerm);
        
        set({ 
          tasks, 
          stats, 
          filteredTasks,
          error: null 
        });
      },
      
      loadTasks: async () => {
        const state = get();
        
        if (!state.config.sheet_url || !state.config.sheet_name) {
          set({ error: 'Vui lòng cấu hình Sheet URL và Sheet Name trong phần Cấu hình' });
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          const tasks = await fetchTasks({
            sheet_url: state.config.sheet_url,
            sheet_name: state.config.sheet_name,
          });
          
          const stats = calculateStats(tasks);
          const filteredTasks = filterTasks(tasks, state.statusFilter, state.searchTerm);
          
          set({ 
            tasks, 
            stats, 
            filteredTasks,
            isLoading: false, 
            error: null 
          });
          
          // Cache data to localStorage
          localStorage.setItem(STORAGE_KEYS.CACHED_TASKS, JSON.stringify({
            tasks,
            stats,
            timestamp: Date.now()
          }));
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
          
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Có lỗi xảy ra khi tải dữ liệu';
            
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },
      
      setConfig: (config: WebhookConfig) => {
        set({ config });
        
        // Save config to localStorage
        localStorage.setItem(STORAGE_KEYS.WEBHOOK_CONFIG, JSON.stringify(config));
      },
      
      setStatusFilter: (statusFilter: TaskStatus | 'all') => {
        const state = get();
        const filteredTasks = filterTasks(state.tasks, statusFilter, state.searchTerm);
        
        set({ statusFilter, filteredTasks });
      },
      
      setSearchTerm: (searchTerm: string) => {
        const state = get();
        const filteredTasks = filterTasks(state.tasks, state.statusFilter, searchTerm);
        
        set({ searchTerm, filteredTasks });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      refreshData: async () => {
        await get().loadTasks();
      },
      
      loadSampleData: () => {
        const stats = calculateStats(sampleTaskData);
        const state = get();
        const filteredTasks = filterTasks(sampleTaskData, state.statusFilter, state.searchTerm);
        
        set({ 
          tasks: sampleTaskData, 
          stats, 
          filteredTasks,
          error: null 
        });
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        config: state.config,
        statusFilter: state.statusFilter,
      }),
    }
  )
);

// Hook to get dashboard stats
export const useDashboardStats = () => {
  const stats = useStore(state => state.stats);
  const isLoading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);
  
  return { stats, isLoading, error };
};

// Hook to get tasks with filtering
export const useTasks = () => {
  const tasks = useStore(state => state.tasks);
  const filteredTasks = useStore(state => state.filteredTasks);
  const isLoading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);
  const statusFilter = useStore(state => state.statusFilter);
  const searchTerm = useStore(state => state.searchTerm);
  
  const setStatusFilter = useStore(state => state.setStatusFilter);
  const setSearchTerm = useStore(state => state.setSearchTerm);
  const loadTasks = useStore(state => state.loadTasks);
  const refreshData = useStore(state => state.refreshData);
  
  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    statusFilter,
    searchTerm,
    setStatusFilter,
    setSearchTerm,
    loadTasks,
    refreshData,
  };
};

// Hook to get config
export const useConfig = () => {
  const config = useStore(state => state.config);
  const setConfig = useStore(state => state.setConfig);
  const loadTasks = useStore(state => state.loadTasks);
  const loadSampleData = useStore(state => state.loadSampleData);
  
  return {
    config,
    setConfig,
    loadTasks,
    loadSampleData,
  };
};