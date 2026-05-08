import { FolderKanban, CheckCircle, Users } from 'lucide-react';

const icons = {
  projects: <FolderKanban size={40} className="text-indigo-400" />,
  tasks: <CheckCircle size={40} className="text-emerald-400" />,
  members: <Users size={40} className="text-blue-400" />,
};

const EmptyState = ({
  type = 'projects',
  title = '',
  subtitle = '',
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-50 mb-4">
      {icons[type]}
    </div>
    <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
    <p className="text-gray-500 mb-4 text-center max-w-xs">{subtitle}</p>
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
