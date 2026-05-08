import { useState } from 'react';
import { useApp } from '../store';
import { User, Shield, LogIn, Eye, EyeOff, UserPlus, Mail, Lock, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { state, dispatch } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginAs, setLoginAs] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const user = state.registeredUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      setError('No account found with this email. Please register first.');
      return;
    }

    if (user.password !== password) {
      setError('Incorrect password. Please try again.');
      return;
    }

    if (loginAs === 'admin' && !user.isAdmin) {
      setError('This account does not have admin access.');
      return;
    }

    if (loginAs === 'user' && user.isAdmin) {
      setError('This is an admin account. Please select "Admin" to login.');
      return;
    }

    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    }));

    dispatch({
      type: 'LOGIN',
      payload: {
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        userId: user.id,
      },
    });

    onNavigate(user.isAdmin ? 'admin-dashboard' : 'home');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const exists = state.registeredUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (exists) {
      setError('An account with this email already exists. Please login instead.');
      return;
    }

    // Register as customer only (no admin registration)
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.trim().toLowerCase(),
      password: password,
      name: name.trim(),
      isAdmin: false,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'REGISTER_USER', payload: newUser });

    setSuccess('Account created successfully! You can now login.');
    setMode('login');
    setLoginAs('user');
    setPassword('');
    setConfirmPassword('');
    setName('');
  };

  // When admin is selected, force login mode (no register for admin)
  const handleLoginAsChange = (role: 'user' | 'admin') => {
    setLoginAs(role);
    setError('');
    setSuccess('');
    if (role === 'admin' && mode === 'register') {
      setMode('login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 pt-20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-8 text-center text-white relative">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
            <h2 className="font-display text-3xl font-bold">
              {mode === 'login'
                ? (loginAs === 'admin' ? 'Admin Login' : 'Welcome Back')
                : 'Create Account'}
            </h2>
            <p className="text-white/80 mt-1">
              {mode === 'login' 
                ? (loginAs === 'admin' ? 'Sign in with your admin credentials' : 'Sign in to your Theresse account')
                : 'Register a new customer account'}
            </p>
            <p className="text-white/60 text-sm mt-2">
              📍 Hinunangan, Southern Leyte
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-2 m-6 mb-0 bg-gray-100 rounded-xl">
            <button
              onClick={() => handleLoginAsChange('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                loginAs === 'user'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User size={16} /> Customer
            </button>
            <button
              onClick={() => handleLoginAsChange('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition cursor-pointer ${
                loginAs === 'admin'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield size={16} /> Admin
            </button>
          </div>

          {/* Login / Register Toggle (only for customer) */}
          {loginAs === 'user' && (
            <div className="flex p-2 mx-6 mt-4 bg-gray-100 rounded-xl">
              <button
                onClick={() => { setMode('login'); resetForm(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LogIn size={14} /> Login
              </button>
              <button
                onClick={() => { setMode('register'); resetForm(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}

          {/* Admin notice with demo credentials */}
          {loginAs === 'admin' && (
            <div className="mx-6 mt-4 space-y-3">
              <div className="bg-purple-50 border border-purple-100 text-purple-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <Shield size={16} className="mt-0.5 flex-shrink-0" />
                <span>Admin accounts are created by existing administrators from the dashboard.</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-xl">
                <p className="font-semibold text-gray-700 mb-1">Demo Admin Account:</p>
                <p>📧 Email: <span className="font-mono bg-white px-2 py-0.5 rounded text-primary">admin@theresse.com</span></p>
                <p>🔑 Password: <span className="font-mono bg-white px-2 py-0.5 rounded text-primary">admin123</span></p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' || loginAs === 'admin' ? handleLogin : handleRegister} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl border border-green-100 flex items-start gap-2">
                <span className="mt-0.5">✅</span>
                <span>{success}</span>
              </div>
            )}

            {mode === 'register' && loginAs === 'user' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="Juan Dela Cruz"
                />
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                placeholder={loginAs === 'admin' ? 'admin@theresse.com' : 'you@email.com'}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Lock size={14} /> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition pr-12"
                  placeholder={mode === 'register' && loginAs === 'user' ? 'At least 6 characters' : 'Enter password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && loginAs === 'user' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <Lock size={14} /> Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 text-white rounded-xl font-semibold hover:opacity-90 transition cursor-pointer text-lg mt-2 flex items-center justify-center gap-2 ${
                loginAs === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary-light'
              }`}
            >
              {mode === 'login' || loginAs === 'admin' ? (
                <>
                  <LogIn size={20} />
                  {loginAs === 'admin' ? 'Sign In as Admin' : 'Sign In'}
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

            {/* Toggle between login and register (customer only) */}
            {loginAs === 'user' && (
              <p className="text-center text-gray-500 text-sm">
                {mode === 'login' 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); resetForm(); }}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  {mode === 'login' ? 'Register here' : 'Login here'}
                </button>
              </p>
            )}
          </form>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 w-full mt-6 text-gray-500 hover:text-primary transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
}
