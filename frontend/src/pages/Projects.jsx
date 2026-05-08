import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../api/projects.js';
import { useToast } from '../components/Toast.jsx';
import { ProjectCardSkeleton } from '../components/SkeletonLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { FolderKanban, Plus, Users, CheckSquare } from 'lucide-react';

const colorOptions = [
  'from-indigo-500 to-indigo-700',
  'from-purple-500 to-purple-700',
  'from-blue-500 to-blue-700',
  'from-pink-500 to-pink-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
];

function hashColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colorOptions[Math.abs(hash) % colorOptions.length];
}

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => { document.title = 'Projects | TaskFlow'; }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
      showToast('Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.length < 2) return showToast('Project name must be at least 2 characters', 'error');
    setCreating(true);
    try {
      await createProject({ name, description, color });
      setShowModal(false);
      setName('');
      setDescription('');
      setColor(colorOptions[0]);
      fetchProjects();
      showToast('Project created!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your projects and teams</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> New Project
        </button>
      </div>
      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          type="projects"
          title="No projects yet"
          subtitle="Create your first project to get started."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium mt-4"
            >
              <Plus size={16} className="inline mr-1" /> New Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer group"
            >
              <div className={`h-2 rounded-t-xl bg-gradient-to-r ${hashColor(project.name)}`} />
              <div className="p-6 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg text-gray-800 truncate">{project.name}</h2>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${project.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>{project.role}</span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-2">{project.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <Users size={14} /> {project.memberCount} members
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <CheckSquare size={14} /> {project.taskCount} tasks
                  </span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    Owner: <span className="font-medium text-gray-700">{project.ownerName}</span>
                  </span>
                  <button
                    onClick={() => window.location.href = `/projects/${project.id}`}
                    className="text-indigo-600 hover:underline text-xs font-medium flex items-center gap-1"
                  >
                    View Project <FolderKanban size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md mx-2 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-4">New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Project name"
                  disabled={creating}
                />
                <div className="text-xs text-gray-400 mt-1 text-right">{name.length}/50</div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Project description"
                  rows={3}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Accent Color</label>
                <div className="flex gap-2 mt-1">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200'} bg-gradient-to-tr ${c}`}
                      onClick={() => setColor(c)}
                      aria-label={c}
                      disabled={creating}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {creating && <span className="loader border-white border-2 border-t-indigo-500 mr-2 w-4 h-4 rounded-full animate-spin" />}
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;