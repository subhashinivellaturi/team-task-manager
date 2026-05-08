import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function TaskCard({ task, isAssignee, onStatusChange }) {
  return (
    <div className="bg-white rounded shadow p-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <div className="font-semibold text-lg">{task.title}</div>
        <div className="flex gap-2 mt-1">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="text-sm text-gray-500 mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</div>
        <div className="text-sm text-gray-500">Assignee: {task.assignee ? task.assignee.name : 'Unassigned'}</div>
      </div>
      {isAssignee && (
        <select
          className="border rounded px-2 py-1 mt-2 sm:mt-0"
          value={task.status}
          onChange={e => onStatusChange(e.target.value)}
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      )}
    </div>
  );
}
