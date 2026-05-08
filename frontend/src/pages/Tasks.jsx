import { useState, useEffect } from 'react';
import { getTasks, updateTask } from '../api/tasks.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { TaskCardSkeleton } from '../components/SkeletonLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { FolderKanban, CheckSquare, ChevronRight, List, Layout, Calendar } from 'lucide-react';

const statusTabs = [
  { value: 'ALL', label: 'All' },
  { value: 'TODO', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Completed' },
];
const priorityOptions = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [view, setView] = useState('list');
  const { showToast } = useToast();

  useEffect(() => { document.title = 'My Tasks | TaskFlow'; }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter(t =>
    (tab === 'ALL' || t.status === tab) &&
    (priority === 'ALL' || t.priority === priority) &&
    t.assigneeId === user?.id
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-500 mt-1">Tasks assigned to you across all projects</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`p-2 rounded-lg border ${view === 'list' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <List size={18} />
          </button>
          <button
            className={`p-2 rounded-lg border ${view === 'kanban' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            onClick={() => setView('kanban')}
            aria-label="Kanban view"
          >
            <Layout size={18} />
          </button>
        </div>
      </div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusTabs.map((s) => (
          <button
            key={s.value}
            onClick={() => setTab(s.value)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${tab === s.value ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-indigo-50'}`}
          >
            {s.label}
          </button>
        ))}
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium ml-2"
        >
          {priorityOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {/* List view */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="tasks"
          title="You're all caught up! 🎉"
          subtitle="No tasks assigned to you."
        />
      ) : view === 'list' ? (
        <div className="flex flex-col gap-3">
          {filtered.map(task => (
            <div key={task.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${task.status === 'TODO' && new Date(task.dueDate) < new Date() ? 'border-l-4 border-red-500' : ''}`}>
              <div className={`w-1.5 h-12 rounded-l-xl ${
                task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
              <div className="flex-1">
                <div className="font-semibold text-gray-800 flex items-center gap-2">
                  {task.title}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>{task.priority}</span>
                </div>
                <div className="text-xs text-gray-400 mb-1">{task.project?.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{task.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(task => (
            <div key={task.id} className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-start gap-2 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md w-full ${task.status === 'TODO' && new Date(task.dueDate) < new Date() ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                <span className="font-semibold text-gray-800">{task.title}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>{task.priority}</span>
              <span className="text-xs text-gray-400">{task.project?.name}</span>
              <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={14} /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>{task.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;