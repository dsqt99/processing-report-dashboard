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
        bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-100',
        iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
        iconColor: 'text-white',
        textColor: 'text-gray-900',
        accentColor: 'border-slate-400',
        shadowColor: 'shadow-slate-200/50',
      };
    case 'Đã xong':
      return {
        icon: CheckCircleIcon,
        bgGradient: 'bg-gradient-to-br from-emerald-50 to-green-100',
        iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
        iconColor: 'text-white',
        textColor: 'text-emerald-900',
        accentColor: 'border-emerald-400',
        shadowColor: 'shadow-emerald-200/50',
      };
    case 'Đang thực hiện':
      return {
        icon: PlayIcon,
        bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        iconColor: 'text-white',
        textColor: 'text-blue-900',
        accentColor: 'border-blue-400',
        shadowColor: 'shadow-blue-200/50',
      };
    case 'Chưa bắt đầu':
      return {
        icon: ClockIcon,
        bgGradient: 'bg-gradient-to-br from-amber-50 to-yellow-100',
        iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
        iconColor: 'text-white',
        textColor: 'text-amber-900',
        accentColor: 'border-amber-400',
        shadowColor: 'shadow-amber-200/50',
      };
    case 'Tạm dừng':
      return {
        icon: PauseIcon,
        bgGradient: 'bg-gradient-to-br from-rose-50 to-red-100',
        iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
        iconColor: 'text-white',
        textColor: 'text-rose-900',
        accentColor: 'border-rose-400',
        shadowColor: 'shadow-rose-200/50',
      };
    default:
      return {
        icon: DocumentTextIcon,
        bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-100',
        iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
        iconColor: 'text-white',
        textColor: 'text-gray-900',
        accentColor: 'border-slate-400',
        shadowColor: 'shadow-slate-200/50',
      };
  }
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title, 
  value, 
  type, 
  isLoading = false 
}) => {
  const { icon: Icon, bgGradient, iconBg, iconColor, textColor, accentColor, shadowColor } = getIconAndColor(type);

  return (
    <div className={`${bgGradient} border-2 ${accentColor} rounded-2xl shadow-lg ${shadowColor} p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl group relative overflow-hidden`}>
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-6 -translate-y-6"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              {title}
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-white/50 rounded-lg w-20"></div>
              </div>
            ) : (
              <div className={`text-3xl font-bold ${textColor} transition-all duration-300 group-hover:scale-110`}>
                {value.toLocaleString()}
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 ml-4">
            <div className={`${iconBg} p-3 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
              <Icon className={`h-7 w-7 ${iconColor}`} aria-hidden="true" />
            </div>
          </div>
        </div>
        
        {/* Progress indicator for visual appeal */}
        <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full ${iconBg} transition-all duration-1000 ease-out`}
            style={{ 
              width: isLoading ? '0%' : '100%',
              transitionDelay: isLoading ? '0ms' : '300ms'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;