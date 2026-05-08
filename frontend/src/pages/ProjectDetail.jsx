import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, addMember, removeMember } from '../api/projects.js';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';
import {
  Users, FolderKanban, CheckSquare, Calendar,
  ChevronRight, Trash, Pencil, User, Crown, Plus, Mail, X
} from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';

const statusOptions = [
  { value: 'TODO', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'DONE', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
];

const priorityOptions = [
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-700' },
];

function stringToColor(str) {
  if (!str || typeof str !== 'string' || str.length === 0) return 'hsl(210, 16%, 90%)';
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash % 360)}, 70%, 85%)`;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('tasks');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  // Add Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: ''
  });
  const [savingTask, setSavingTask] = useState(false);
  const [taskErrors, setTaskErrors] = useState({});

  // Edit task state
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    document.title = project ? `${project.name} | TaskFlow` : 'Project | TaskFlow';
  }, [project]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        getProjectById(id),
        getTasks(id)
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project');
      showToast('Failed to load project', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );
  if (error) return (
    <div className="min-h-[60vh] flex items-center justify-center text-red-500">
      {error}
    </div>
  );
  if (!project) return null;

  // Fix: handle both id and userId field names
  const currentUserId = user?.id || user?.userId;

  const isAdmin =
    project?.ownerId === currentUserId ||
    project?.members?.find(m =>
      m.userId === currentUserId && m.role === 'admin'
    ) !== undefined;

  // Filter tasks
  let filteredTasks = tasks;
  if (filterStatus !== 'ALL') filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  if (filterPriority !== 'ALL') filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);

  // Handle create task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!taskForm.title.trim()) errors.title = 'Title is required';
    if (taskForm.title.trim().length < 2) errors.title = 'Title must be at least 2 characters';
    setTaskErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingTask(true);
    try {
      await createTask({ ...taskForm, projectId: id });
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
      setTaskErrors({});
      showToast('Task created successfully!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create task', 'error');
    } finally {
      setSavingTask(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
      showToast('Status updated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      showToast('Task deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete task', 'error');
    }
  };

  // Handle edit task
  const handleEditTask = (task) => {
    setEditTask(task);
    setEditForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task.assigneeId || ''
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await updateTask(editTask.id, editForm);
      setEditTask(null);
      showToast('Task updated!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update task', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link to="/projects" className="hover:underline text-indigo-600">Projects</Link>
        <ChevronRight size={16} />
        <span className="text-gray-700 font-medium">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
          <FolderKanban className="text-indigo-500" /> {project.name}
        </h1>
        <p className="text-gray-500 mb-3">{project.description || 'No description'}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
            <Crown size={12} /> {project.owner?.name} (Owner)
          </span>
          <span className="flex items-center gap-1 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">
            <Users size={12} /> {project.members?.length} members
          </span>
          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            <CheckSquare size={12} /> {tasks.length} tasks
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-100">
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-2 font-medium transition-all ${tab === 'tasks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setTab('members')}
          className={`px-4 py-2 font-medium transition-all ${tab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
        >
          Members ({project.members?.length})
        </button>
      </div>

      {/* TASKS TAB */}
      {tab === 'tasks' && (
        <div>
          {/* Filter bar + Add Task button */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterStatus === 'ALL' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
              >
                All
              </button>
              {statusOptions.map(s => (
                <button
                  key={s.value}
                  onClick={() => setFilterStatus(s.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterStatus === s.value ? s.color + ' ring-2 ring-indigo-200' : 'bg-gray-100 text-gray-600'}`}
                >
                  {s.label}
                </button>
              ))}
              <select
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium"
              >
                <option value="ALL">All Priorities</option>
                {priorityOptions.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* ADD TASK BUTTON — only for admins */}
            {isAdmin && (
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap"
              >
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>

          {/* Task list */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              type="tasks"
              title="No tasks found"
              subtitle={isAdmin ? 'Click "Add Task" to create one.' : 'No tasks assigned yet.'}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Priority bar */}
                  <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${
                    task.priority === 'HIGH' ? 'bg-red-500' :
                    task.priority === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        task.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {task.dueDate
                          ? <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-medium' : ''}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          : 'No due date'
                        }
                      </span>
                      <span className="flex items-center gap-1">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: stringToColor(task.assignee?.name || '') }}
                        >
                          {task.assignee?.name ? task.assignee.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        {task.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Status dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                      task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <option value="TODO">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {project.members?.map((m) => {
              // Fix: backend returns m.user.name not m.name
              const memberName = m.user?.name || m.name || 'Unknown';
              const memberEmail = m.user?.email || m.email || '';
              return (
                <div key={m.userId} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ background: stringToColor(memberName) }}
                  >
                    {memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{memberName}</div>
                    <div className="text-xs text-gray-400 truncate">{memberEmail}</div>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      m.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
                    }`}>
                      {m.role}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : ''}
                  </div>
                  {isAdmin && m.userId !== project.ownerId && (
                    <button
                      onClick={() => setConfirmRemove(m.userId)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Invite member form */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} /> Invite Member
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setInviting(true);
                  try {
                    await addMember(id, { email: inviteEmail, role: inviteRole });
                    setInviteEmail('');
                    setInviteRole('member');
                    showToast('Member invited successfully!', 'success');
                    fetchData();
                  } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to invite member', 'error');
                  } finally {
                    setInviting(false);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="member@example.com"
                    required
                    disabled={inviting}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole('admin')}
                    disabled={inviting}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-1 ${
                      inviteRole === 'admin' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <Crown size={14} /> Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole('member')}
                    disabled={inviting}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-1 ${
                      inviteRole === 'member' ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    <User size={14} /> Member
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={inviting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {inviting && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {inviting ? 'Inviting...' : 'Send Invite'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ADD TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Add New Task</h2>
              <button
                onClick={() => { setShowTaskModal(false); setTaskErrors({}); }}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className={`w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    taskErrors.title ? 'border-red-400' : 'border-gray-200'
                  }`}
                  placeholder="Task title"
                  disabled={savingTask}
                />
                {taskErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{taskErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Optional description"
                  disabled={savingTask}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={savingTask}
                  >
                    <option value="TODO">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={savingTask}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" /> Due Date
                </label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={savingTask}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={14} className="inline mr-1" /> Assign To
                </label>
                <select
                  value={taskForm.assigneeId}
                  onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={savingTask}
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTaskModal(false); setTaskErrors({}); }}
                  disabled={savingTask}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingTask && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {savingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
              <button
                onClick={() => setEditTask(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={savingEdit}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                    disabled={savingEdit}
                  >
                    <option value="TODO">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                    disabled={savingEdit}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                  disabled={savingEdit}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={editForm.assigneeId}
                  onChange={e => setEditForm({ ...editForm, assigneeId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500"
                  disabled={savingEdit}
                >
                  <option value="">Unassigned</option>
                  {project?.members?.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.name || m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  disabled={savingEdit}
                  className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {savingEdit && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE MEMBER CONFIRMATION */}
      {confirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button
              onClick={() => setConfirmRemove(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-3">Remove Member?</h2>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to remove this member? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await removeMember(id, confirmRemove);
                    showToast('Member removed successfully', 'success');
                    setConfirmRemove(null);
                    fetchData();
                  } catch (err) {
                    showToast(err.response?.data?.message || 'Failed to remove member', 'error');
                  }
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 font-medium transition"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetail;