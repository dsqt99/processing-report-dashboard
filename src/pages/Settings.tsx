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
import { saveSheetInformationLog } from '../utils/fileUtils';

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

      // Validate Google Sheets URL format
      if (!formData.sheet_url.includes('docs.google.com/spreadsheets')) {
        throw new Error('URL không hợp lệ. Vui lòng nhập URL Google Sheets đúng định dạng');
      }

      // Save configuration
      setConfig(formData);
      
      // Save sheet information to JSON file
      await saveSheetInformationLog({
        sheet_url: formData.sheet_url,
        sheet_name: formData.sheet_name
      });

      // Fetch sheet data from webhook API and save to tiendocongviec.json
      try {
        const fetchAndSaveResponse = await fetch('http://localhost:3001/api/fetch-and-save-sheet-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sheet_url: formData.sheet_url,
            sheet_name: formData.sheet_name
          })
        });

        if (fetchAndSaveResponse.ok) {
          const result = await fetchAndSaveResponse.json();
          setMessage({
            type: 'success',
            text: `Đã lưu cấu hình và thấy ${result.dataCount} bản ghi từ Google Sheets!`
          });
        } else {
          const errorResult = await fetchAndSaveResponse.json();
          setMessage({
            type: 'error',
            text: `Đã lưu cấu hình thành công nhưng không thể thấy dữ liệu sheet: ${errorResult.message}`
          });
        }
      } catch (fetchError) {
        console.error('Error fetching and saving sheet data:', fetchError);
        setMessage({
          type: 'error',
          text: 'Đã lưu cấu hình thành công nhưng không thể kết nối đến server để tải dữ liệu sheet!'
        });
      }
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
      const response = await fetch('https://n8n-hungyen.cahy.io.vn/webhook/check-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheet_url: formData.sheet_url,
          sheet_name: formData.sheet_name
        })
      });

      if (response.status === 200) {
        setMessage({
          type: 'success',
          text: 'Kết nối thành công! Cấu hình đã được xác thực.'
        });
      } else if (response.status === 400) {
        setMessage({
          type: 'error',
          text: 'Lỗi kết nối. Vui lòng kiểm tra lại URL và tên sheet.'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Có lỗi xảy ra khi kiểm tra kết nối.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
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
                  Cấu hình Google Sheet
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