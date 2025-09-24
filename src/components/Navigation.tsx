import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChartBarIcon, 
  TableCellsIcon, 
  ChartPieIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: ChartBarIcon,
  },
  {
    name: 'Danh sách công việc',
    path: '/tasks',
    icon: TableCellsIcon,
  },
  {
    name: 'Biểu đồ',
    path: '/charts',
    icon: ChartPieIcon,
  },
  {
    name: 'Cấu hình',
    path: '/settings',
    icon: CogIcon,
  },
];

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ứng dụng Quản lý Tiến độ Công việc
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý tiến độ công việc một cách trực quan và hiệu quả
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-8 border-b border-gray-200">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-colors duration-200
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-2 h-5 w-5 transition-colors duration-200
                    ${
                      isActive
                        ? 'text-blue-500'
                        : 'text-gray-500'
                    }
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navigation;