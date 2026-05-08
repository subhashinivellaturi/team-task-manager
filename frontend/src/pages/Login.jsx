import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast.jsx';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      login(res.data.token, res.data.user);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left gradient section */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <Mail size={36} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">TaskFlow</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Manage your team's work efficiently</h2>
        <p className="text-lg text-indigo-100">Collaborate, assign, and track tasks with ease.</p>
      </div>
      {/* Right form section */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign in to TaskFlow</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="accent-indigo-600 rounded" disabled={loading} />
                Remember me
              </label>
              <Link to="/signup" className="text-indigo-600 hover:underline text-sm font-medium">Create account</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <span className="loader border-white border-2 border-t-indigo-500 mr-2 w-4 h-4 rounded-full animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;