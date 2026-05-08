import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatCardSkeleton } from '../components/SkeletonLoader.jsx';
import { useToast } from '../components/Toast.jsx';
import { LayoutDashboard, FolderKanban, CheckSquare, AlertTriangle, TrendingUp, Users, Calendar, ChevronRight, Circle, CheckCircle } from 'lucide-react';

const statCards = [
  {
    label: 'Total Projects',
    icon: <FolderKanban className="text-indigo-500" size={28} />,
    color: 'indigo',
    key: 'totalProjects',
  },
  {
    label: 'Total Tasks',
    icon: <CheckSquare className="text-purple-500" size={28} />,
    color: 'purple',
    key: 'totalTasks',
  },
  {
    label: 'In Progress',
    icon: <TrendingUp className="text-blue-500" size={28} />,
    color: 'blue',
    key: 'inProgress',
  },
  {
    label: 'Overdue',
    icon: <AlertTriangle className="text-red-500 animate-pulse" size={28} />,
    color: 'red',
    key: 'overdue',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    document.title = 'Dashboard | TaskFlow';
    setLoading(true);
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        showToast('Failed to load dashboard', 'error');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="text-red-400 mb-2" size={40} />
        <p className="text-red-500 font-semibold text-lg mb-2">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg mt-2">Retry</button>
      </div>
    );
  }

  // Stat values
  const totalProjects = data?.totalProjects ?? 0;
  const totalTasks = data?.totalTasks ?? 0;
  const inProgress = data?.tasksByStatus?.IN_PROGRESS ?? 0;
  const overdue = data?.overdueTasks?.length ?? 0;
  const done = data?.tasksByStatus?.DONE ?? 0;
  const todo = data?.tasksByStatus?.TODO ?? 0;
  const percent = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0]} <span role="img" aria-label="wave">👋</span>
          </h1>
          <p className="text-gray-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 mb-2">{statCards[0].icon}</div>
          <div className="text-3xl font-bold text-indigo-600">{totalProjects}</div>
          <div className="text-gray-500 text-sm font-medium">Total Projects</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 mb-2">{statCards[1].icon}</div>
          <div className="text-3xl font-bold text-purple-600">{totalTasks}</div>
          <div className="text-gray-500 text-sm font-medium">Total Tasks</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 mb-2">{statCards[2].icon}</div>
          <div className="text-3xl font-bold text-blue-600">{inProgress}</div>
          <div className="text-gray-500 text-sm font-medium">In Progress</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 mb-2">{statCards[3].icon}</div>
          <div className="text-3xl font-bold text-red-600 animate-pulse">{overdue}</div>
          <div className="text-gray-500 text-sm font-medium">Overdue</div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Overall Progress</h2>
        <div className="mb-2 flex items-center gap-3">
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-700 min-w-[40px]">{percent}%</span>
        </div>
        <div className="flex gap-2 mt-2">
          <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium">🟡 Pending: {todo}</span>
          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">🔵 In Progress: {inProgress}</span>
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium">🟢 Completed: {done}</span>
        </div>
      </div>
      {/* Bottom row: Recent tasks and Overdue tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent tasks */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckSquare className="text-emerald-500" size={20} /> Recent Tasks
          </h2>
          {data?.recentTasks?.length === 0 ? (
            <div className="text-gray-400 text-sm">No recent tasks.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.recentTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-4 py-3 group hover:bg-gray-50 transition">
                  <span className={`w-3 h-3 rounded-full ${
                    task.status === 'DONE'
                      ? 'bg-emerald-500'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.project?.name}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    task.priority === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Overdue tasks */}
        <div className={`rounded-xl p-6 shadow-sm border ${overdue > 0 ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${overdue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {overdue > 0 ? '⚠️ Overdue Tasks' : '✅ All tasks on track!'}
          </h2>
          {overdue > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">Task</th>
                    <th className="pb-2">Project</th>
                    <th className="pb-2">Due Date</th>
                    <th className="pb-2">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overdueTasks.map((task) => (
                    <tr key={task.id} className="border-b last:border-0">
                      <td className="py-2 font-medium text-gray-700">{task.title}</td>
                      <td className="py-2 text-gray-500">{task.project?.name}</td>
                      <td className="py-2 text-red-500">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 text-gray-500">{task.assignee?.name || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-emerald-600 text-sm font-medium flex items-center gap-2">
              <CheckCircle size={18} /> No overdue tasks!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;