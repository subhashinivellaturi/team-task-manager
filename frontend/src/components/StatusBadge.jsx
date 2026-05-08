import React from 'react';

const statusColors = {
  TODO: 'bg-gray-400 text-white',
  IN_PROGRESS: 'bg-blue-500 text-white',
  DONE: 'bg-green-500 text-white',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-300'}`}>
      {status}
    </span>
  );
}
