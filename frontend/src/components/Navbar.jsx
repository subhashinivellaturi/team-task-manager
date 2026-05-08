import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-blue-600 font-bold text-lg">
            TaskManager
          </Link>
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">
            Dashboard
          </Link>
          <Link to="/projects" className="text-sm text-gray-600 hover:text-blue-600 transition">
            Projects
          </Link>
          <Link to="/tasks" className="text-sm text-gray-600 hover:text-blue-600 transition">
            My Tasks
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;