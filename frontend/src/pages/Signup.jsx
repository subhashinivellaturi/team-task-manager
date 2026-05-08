import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupApi } from '../api/auth.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, User, Crown, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast.jsx';

const roles = [
  {
    value: 'admin',
    label: 'Admin',
    icon: <Crown size={20} className="text-violet-600" />,
    desc: 'Full access, manage team & projects',
  },
  {
    value: 'member',
    label: 'Member',
    icon: <User size={20} className="text-sky-600" />,
    desc: 'Work on assigned tasks',
  },
];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score === 0) return { label: 'Weak', color: 'red' };
  if (score <= 2) return { label: 'Medium', color: 'amber' };
  return { label: 'Strong', color: 'emerald' };
}

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('member');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'Enter a valid email';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await signupApi({ name, email, password, role });
      login(res.data.token, res.data.user);
      showToast('Signup successful!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left gradient section */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white p-12">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <User size={36} />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">TaskFlow</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Create your free account</h2>
        <p className="text-lg text-indigo-100">Join your team and start managing projects.</p>
      </div>
      {/* Right form section */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign up for TaskFlow</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2.5 border ${errors.name ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Your name"
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
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
                  placeholder="Create a password"
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
              {/* Password strength bar */}
              <div className="h-2 mt-2 rounded bg-gray-200 overflow-hidden">
                <div
                  className={`h-2 transition-all duration-300 ${
                    strength.color === 'red'
                      ? 'bg-red-400 w-1/3'
                      : strength.color === 'amber'
                      ? 'bg-amber-400 w-2/3'
                      : 'bg-emerald-400 w-full'
                  }`}
                />
              </div>
              <p className={`text-xs mt-1 font-medium ${
                strength.color === 'red'
                  ? 'text-red-500'
                  : strength.color === 'amber'
                  ? 'text-amber-500'
                  : 'text-emerald-500'
              }`}>{strength.label} password</p>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2.5 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all`}
                  placeholder="Re-enter password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            {/* Role selection */}
            <div>
              <label className="block font-medium text-gray-700 mb-2">Role</label>
              <div className="flex gap-4">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    className={`flex-1 flex flex-col items-center gap-1 border-2 rounded-lg px-4 py-3 transition-all duration-150 ${
                      role === r.value
                        ? 'border-indigo-600 bg-indigo-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setRole(r.value)}
                    disabled={loading}
                  >
                    <span>{r.icon}</span>
                    <span className="font-semibold text-gray-800">{r.label}</span>
                    <span className="text-xs text-gray-500">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <span className="loader border-white border-2 border-t-indigo-500 mr-2 w-4 h-4 rounded-full animate-spin" />}
              Create Account
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;