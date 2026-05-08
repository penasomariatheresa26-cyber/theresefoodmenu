import { useState } from 'react';
import { useApp } from '../store';
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Cloud,
  CloudOff,
  MapPin,
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  cartCount: number;
}

export default function Navbar({ currentPage, onNavigate, cartCount }: NavbarProps) {
  const { state, dispatch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = state.isAdmin
    ? [
        { id: 'admin-dashboard', label: 'Dashboard' },
        { id: 'admin-menu', label: 'Menu' },
        { id: 'admin-orders', label: 'Orders' },
        { id: 'admin-users', label: 'Users' },
      ]
    : [
        { id: 'home', label: 'Home' },
        { id: 'menu', label: 'Menu' },
        { id: 'orders', label: 'My Orders' },
      ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    setUserMenuOpen(false);
    onNavigate('home');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate(state.isAdmin ? 'admin-dashboard' : 'home')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
              <img src="/images/logo.png" alt="Theresse" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-primary-dark">Theresse</span>
              <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={10} />
                <span>Hinunangan</span>
              </div>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Database Status Indicator */}
            <div 
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                state.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
              title={state.isOnline ? 'Connected to database' : 'Offline mode (local data)'}
            >
              {state.isOnline ? <Cloud size={12} /> : <CloudOff size={12} />}
              <span>{state.isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Cart (customer only) */}
            {!state.isAdmin && state.isLoggedIn && (
              <button
                onClick={() => onNavigate('cart')}
                className={`relative p-2 rounded-lg transition-all cursor-pointer ${
                  currentPage === 'cart'
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-primary/10'
                }`}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse-glow">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {state.isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    state.isAdmin ? 'bg-purple-500' : 'bg-primary'
                  }`}>
                    {state.userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {state.userName}
                  </span>
                  {state.isAdmin && <Shield size={14} className="text-purple-500" />}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{state.userName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {state.isAdmin ? (
                          <><Shield size={10} /> Admin</>
                        ) : (
                          <><User size={10} /> Customer</>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all cursor-pointer"
              >
                <User size={16} />
                Login
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentPage === link.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-primary/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
