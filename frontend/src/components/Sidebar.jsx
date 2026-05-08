import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, Menu, LogOut, User, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: FolderKanban,
  },
  {
    label: 'My Tasks',
    to: '/tasks',
    icon: CheckSquare,
  },
];

function stringToColor(str) {
  // Generates a pastel color from a string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const roleBadge = user?.role === 'admin'
    ? (
      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex items-center gap-1">
        <Crown size={14} className="inline" /> Admin
      </span>
    ) : (
      <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full text-xs font-medium ml-2 flex items-center gap-1">
        <User size={14} className="inline" /> Member
      </span>
    );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
          <LayoutDashboard size={28} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-indigo-700 tracking-tight">TaskFlow</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 mt-4">
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-6 py-3 my-1 rounded-lg font-medium transition-colors duration-150 ${
                active
                  ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {/* User section */}
      <div className="mt-auto px-6 py-6 border-t border-gray-100 flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2"
          style={{ background: stringToColor(user?.name || '') }}
        >
          {initials}
        </div>
        <div className="text-gray-800 font-semibold text-base flex items-center">
          {user?.name}
          {roleBadge}
        </div>
        <button
          onClick={logout}
          className="mt-4 flex items-center gap-2 text-sm bg-red-50 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-100 transition-all"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col bg-white border-r border-gray-100 z-30 shadow-sm">
        {sidebarContent}
      </aside>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 bg-white border border-gray-200 rounded-full p-2 shadow-md"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-60 bg-white h-full shadow-lg border-r border-gray-100 animate-slide-in-left">
            {sidebarContent}
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;
