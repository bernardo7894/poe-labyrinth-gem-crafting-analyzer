
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-4 border-b border-gray-600 pb-3">{title}</h2>
      {children}
    </div>
  );
};
