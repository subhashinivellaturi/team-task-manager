import React from 'react';

export default function ProjectCard({ project, onClick, role }) {
  return (
    <div
      className="bg-white rounded shadow p-4 cursor-pointer hover:bg-gray-50 flex flex-col gap-2"
      onClick={onClick}
    >
      <div className="font-bold text-lg">{project.name}</div>
      <div className="text-gray-600">{project.description}</div>
      <div className="flex gap-4 mt-2 text-sm">
        <span>Members: {project.memberCount}</span>
        <span>Tasks: {project.taskCount}</span>
        <span>Your role: {role}</span>
      </div>
    </div>
  );
}
