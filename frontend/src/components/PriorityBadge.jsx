import React from 'react';

const priorityColors = {
  LOW: 'bg-green-500 text-white',
  MEDIUM: 'bg-yellow-400 text-black',
  HIGH: 'bg-red-500 text-white',
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[priority] || 'bg-gray-300'}`}>
      {priority}
    </span>
  );
}
