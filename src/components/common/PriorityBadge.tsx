import React from 'react';
import { Priority, RequestStatus } from '../../types';

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({
  priority,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  switch (priority) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1 font-bold rounded-md bg-red-100 text-red-800 border border-red-300 shadow-xs ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          CRITICAL
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 font-semibold rounded-md bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-100 text-amber-800 border border-amber-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 font-normal rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          LOW
        </span>
      );
  }
};

export const StatusBadge: React.FC<{ status: RequestStatus | string; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  switch (status) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          Pending Verification
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          Verified & Queued
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          Volunteer Assigned
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-cyan-50 text-cyan-800 border border-cyan-300 ${sizeClasses}`}>
          Active in Field
        </span>
      );
    case 'RESOLUTION_PENDING':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 ${sizeClasses}`}>
          Resolution Review
        </span>
      );
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          Closed & Resolved
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          Rejected / Non-actionable
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-md font-medium bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
