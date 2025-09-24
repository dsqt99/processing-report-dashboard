import React, { useState } from 'react';
import { 
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { useConfig } from '../store/useStore';
import { WebhookConfig } from '../types';

const Settings: React.FC = () => {
  const { config, setConfig, loadTasks, loadSampleData } = useConfig();
  const [formData, setFormData] = useState<WebhookConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (field: keyof WebhookConfig, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Validate form data
      if (!formData.sheet_url.trim()) {
        throw new Error('Vui lòng nhập URL của Google Sheets');
      }
      if (!formData.sheet_name.trim()) {
        throw new Error('Vui lòng nhập tên sheet');
      }
      if (formData.refreshInterval < 1) {
        throw new Error('Thời gian làm mới phải lớn hơn 0');
      }

      // Validate Google Sheets URL format
      if (!formData.sheet_url.includes('docs.google.com/spreadsheets')) {
        throw new Error('URL không hợp lệ. Vui lòng nhập URL Google Sheets đúng định dạng');
      }

      // Save configuration
      setConfig(formData);
      
      setMessage({
        type: 'success',
        text: 'Cấu hình đã được lưu thành công!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu cấu hình'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save current config first
      setConfig(formData);
      
      // Test connection by loading data
      await loadTasks();
      
      setMessage({
        type: 'success',
        text: 'Kết nối thành công! Dữ liệu đã được tải.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Không thể kết nối. Vui lòng kiểm tra lại URL và tên sheet.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleData = () => {
    loadSampleData();
    setMessage({
      type: 'success',
      text: 'Đã tải dữ liệu mẫu thành công!'
    });
  };

  const handleReset = () => {
    setFormData({
      sheet_url: 'https://docs.google.com/spreadsheets/d/1vy0dgWegn6btmYTPfvpPnWa7o897H39QDnZqnKzhi7E/edit?usp=sharing',
      sheet_name: 'Trang tính1',
      refreshInterval: 5
    });
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
          <p className="mt-2 text-sm text-gray-600">
            Cấu hình kết nối Google Sheets và các thiết lập hệ thống
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  message.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {message.text}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CogIcon className="h-5 w-5 mr-2" />
                  Cấu hình Webhook API
                </h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Sheet URL */}
                <div>
                  <label htmlFor="sheet_url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Google Sheets
                  </label>
                  <input
                    type="url"
                    id="sheet_url"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={formData.sheet_url}
                    onChange={(e) => handleInputChange('sheet_url', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Nhập URL đầy đủ của Google Sheets chứa dữ liệu công việc
                  </p>
                </div>

                {/* Sheet Name */}
                <div>
                  <label htmlFor="sheet_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Sheet
                  </label>
                  <input
                    type="text"
                    id="sheet_name"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Trang tính1"
                    value={formData.sheet_name}
                    onChange={(e) => handleInputChange('sheet_name', e.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tên của sheet chứa dữ liệu (thường là "Trang tính1")
                  </p>
                </div>

                {/* Refresh Interval */}
                <div>
                  <label htmlFor="refresh_interval" className="block text-sm font-medium text-gray-700 mb-2">Thời gian làm mới (phút)</label>
                  <input
                    type="number"
                    id="refresh_interval"
                    min="1"
                    max="60"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.refreshInterval}
                    onChange={(e) => handleInputChange('refreshInterval', parseInt(e.target.value) || 5)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tần suất tự động làm mới dữ liệu (1-60 phút)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                  
                  <button
                    onClick={handleTestConnection}
                    disabled={isLoading || !formData.sheet_url || !formData.sheet_name}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <CloudArrowUpIcon className="-ml-1 mr-2 h-4 w-4" />
                    {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Đặt lại mặc định
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">


            {/* Help */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Hướng dẫn
                </h3>
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-600 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Cách lấy URL Google Sheets:</h4>
                    <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
                      <li>Mở Google Sheets</li>
                      <li>Click "Chia sẻ" ở góc phải</li>
                      <li>Chọn "Bất kỳ ai có liên kết"</li>
                      <li>Copy URL từ thanh địa chỉ</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Định dạng dữ liệu:</h4>
                    <p className="text-xs mt-1">
                      Sheet cần có các cột: ID, Tên Công việc, Đơn vị thực hiện, 
                      Ngày bắt đầu, Ngày kết thúc, Trạng thái, Tiến độ (%), Ghi chú, Đánh giá
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;