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
import { fetchTasks, fetchTasksWithSaveTime, fetchSheetConfig, calculateStats, ApiError } from '../services/api';

interface AppState {
  // Data
  tasks: Task[];
  filteredTasks: Task[];
  stats: DashboardStats;
  saveTime?: string;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Configuration
  config: WebhookConfig;
  
  // Filters
  statusFilter: TaskStatus | 'all';
  unitFilter: string | 'all';
  searchTerm: string;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  loadTasks: () => Promise<void>;
  loadConfig: () => Promise<void>;
  setConfig: (config: WebhookConfig) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  setUnitFilter: (unit: string | 'all') => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  loadSampleData: () => void;
}

// Calculate initial stats (empty)
const initialStats = calculateStats([]);

// Filter tasks based on status, unit, and search term
const filterTasks = (tasks: Task[], statusFilter: TaskStatus | 'all', unitFilter: string | 'all', searchTerm: string): Task[] => {
  let filtered = [...tasks];
  
  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(task => task["Trạng thái "] === statusFilter);
  }
  
  // Filter by unit
  if (unitFilter !== 'all') {
    filtered = filtered.filter(task => task["Đơn vị thực hiện"] === unitFilter);
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

// Get unique units from tasks
const getUniqueUnits = (tasks: Task[]): string[] => {
  const units = tasks.map(task => task["Đơn vị thực hiện"]);
  return [...new Set(units)].sort();
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      filteredTasks: [],
      stats: initialStats,
      saveTime: undefined,
      isLoading: false,
      error: null,
      config: {
        sheet_url: 'https://docs.google.com/spreadsheets/d/1sb6lnE9yMY6Nj9H2L2clHGhX05bHXvB_1SQXuWBPsrU/edit?usp=sharing',
        sheet_name: 'Trang tính1',
      },
      statusFilter: 'all',
      unitFilter: 'all',
      searchTerm: '',
      
      // Actions
      setTasks: (tasks: Task[]) => {
        const state = get();
        const stats = calculateStats(tasks);
        const filteredTasks = filterTasks(tasks, state.statusFilter, state.unitFilter, state.searchTerm);
        
        set({ 
          tasks, 
          stats, 
          filteredTasks,
          error: null 
        });
      },
      
      loadTasks: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch tasks with save_time from local tiendocongviec.json file
          const { tasks, saveTime } = await fetchTasksWithSaveTime();
          
          const stats = calculateStats(tasks);
          const state = get();
          const filteredTasks = filterTasks(tasks, state.statusFilter, state.unitFilter, state.searchTerm);
          
          set({ 
            tasks, 
            stats, 
            filteredTasks,
            saveTime,
            isLoading: false, 
            error: null 
          });
          
          // Cache data to localStorage with Vietnam timezone
          const now = new Date();
          const vietnamTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
          localStorage.setItem(STORAGE_KEYS.CACHED_TASKS, JSON.stringify({
            tasks,
            stats,
            saveTime,
            timestamp: vietnamTime.getTime()
          }));
          localStorage.setItem(STORAGE_KEYS.LAST_SYNC, vietnamTime.toISOString());
          
        } catch (error) {
          const errorMessage = error instanceof ApiError 
            ? error.message 
            : 'Có lỗi xảy ra khi tải dữ liệu từ file tiendocongviec.json';
            
          set({ 
            isLoading: false, 
            error: errorMessage 
          });
        }
      },
      
      loadConfig: async () => {
        try {
          const config = await fetchSheetConfig();
          if (config) {
            set({ 
              config: {
                sheet_url: config.sheet_url,
                sheet_name: config.sheet_name
              }
            });
          }
        } catch (error) {
          console.error('Error loading sheet configuration:', error);
          // Keep using default/existing config if loading fails
        }
      },
      
      setConfig: (config: WebhookConfig) => {
        set({ config });
        
        // Save config to localStorage
        localStorage.setItem(STORAGE_KEYS.WEBHOOK_CONFIG, JSON.stringify(config));
      },
      
      setStatusFilter: (statusFilter: TaskStatus | 'all') => {
        const state = get();
        const filteredTasks = filterTasks(state.tasks, statusFilter, state.unitFilter, state.searchTerm);
        set({ statusFilter, filteredTasks });
      },
      
      setUnitFilter: (unitFilter: string | 'all') => {
        const state = get();
        const filteredTasks = filterTasks(state.tasks, state.statusFilter, unitFilter, state.searchTerm);
        set({ unitFilter, filteredTasks });
      },
      
      setSearchTerm: (searchTerm: string) => {
        const state = get();
        const filteredTasks = filterTasks(state.tasks, state.statusFilter, state.unitFilter, searchTerm);
        set({ searchTerm, filteredTasks });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      loadSampleData: () => {
        const stats = calculateStats(sampleTaskData);
        const state = get();
        const filteredTasks = filterTasks(sampleTaskData, state.statusFilter, state.unitFilter, state.searchTerm);
        
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
        unitFilter: state.unitFilter,
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

// Hook to get tasks with filtering and sorting
export const useTasks = () => {
  const tasks = useStore(state => state.tasks);
  const filteredTasks = useStore(state => state.filteredTasks);
  const isLoading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);
  const statusFilter = useStore(state => state.statusFilter);
  const unitFilter = useStore(state => state.unitFilter);
  const searchTerm = useStore(state => state.searchTerm);
  
  const setStatusFilter = useStore(state => state.setStatusFilter);
  const setUnitFilter = useStore(state => state.setUnitFilter);
  const setSearchTerm = useStore(state => state.setSearchTerm);
  const loadTasks = useStore(state => state.loadTasks);
  const clearError = useStore(state => state.clearError);
  const loadSampleData = useStore(state => state.loadSampleData);
  
  const uniqueUnits = getUniqueUnits(tasks);
  
  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    statusFilter,
    unitFilter,
    searchTerm,
    uniqueUnits,
    setStatusFilter,
    setUnitFilter,
    setSearchTerm,
    loadTasks,
    clearError,
    loadSampleData,
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

// Hook to get save time
export const useSaveTime = () => {
  const saveTime = useStore(state => state.saveTime);
  return saveTime;
};