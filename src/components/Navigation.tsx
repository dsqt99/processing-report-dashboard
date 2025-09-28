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
    name: 'Công việc',
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
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-xl">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="py-8">
          <div className="flex items-center mb-2">
            <img 
              src="/src/assets/Logo-Bo-Cong-An.webp" 
              alt="Logo Bộ Công An" 
              className="h-16 w-16 mr-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Ứng dụng Quản lý Tiến độ Công việc
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Theo dõi và quản lý tiến độ công việc một cách trực quan và hiệu quả
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 pb-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  inline-flex items-center px-6 py-4 rounded-t-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105
                  ${
                    isActive
                      ? 'bg-white text-blue-900 shadow-lg border-b-4 border-yellow-400'
                      : 'text-blue-100 hover:text-white hover:bg-blue-700/50 backdrop-blur-sm'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 transition-all duration-300
                    ${
                      isActive
                        ? 'text-blue-700'
                        : 'text-blue-200 group-hover:text-white'
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
      
      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
    </div>
  );
};

export default Navigation;