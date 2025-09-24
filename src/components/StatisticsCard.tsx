import React from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { TaskStatus } from '../types';

interface StatisticsCardProps {
  title: string;
  value: number;
  type: 'total' | TaskStatus;
  isLoading?: boolean;
}

const getIconAndColor = (type: StatisticsCardProps['type']) => {
  switch (type) {
    case 'total':
      return {
        icon: DocumentTextIcon,
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-900',
      };
    case 'Đã xong':
      return {
        icon: CheckCircleIcon,
        bgColor: 'bg-green-50',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
      };
    case 'Đang thực hiện':
      return {
        icon: PlayIcon,
        bgColor: 'bg-blue-50',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
      };
    case 'Chưa bắt đầu':
      return {
        icon: ClockIcon,
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-900',
      };
    case 'Tạm dừng':
      return {
        icon: PauseIcon,
        bgColor: 'bg-red-50',
        iconColor: 'text-red-600',
        textColor: 'text-red-900',
      };
    default:
      return {
        icon: DocumentTextIcon,
        bgColor: 'bg-gray-50',
        iconColor: 'text-gray-600',
        textColor: 'text-gray-900',
      };
  }
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title, 
  value, 
  type, 
  isLoading = false 
}) => {
  const { icon: Icon, bgColor, iconColor, textColor } = getIconAndColor(type);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            {title}
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">
              {value}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
        </div>
       </div>
     </div>
   );
 };

export default StatisticsCard;