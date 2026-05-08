import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './store';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminUsersPage from './pages/AdminUsersPage';

function AppContent() {
  const { state, dispatch } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  // Check for stored login on mount — validate against registered users
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const exists = state.registeredUsers.find(u => u.id === user.id);
        if (exists) {
          dispatch({
            type: 'LOGIN',
            payload: {
              name: exists.name,
              email: exists.email,
              isAdmin: exists.isAdmin,
              userId: exists.id,
            },
          });
        } else {
          localStorage.removeItem('user');
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'menu':
        return <MenuPage onNavigate={handleNavigate} />;
      case 'cart':
        if (!state.isLoggedIn) return <LoginPage onNavigate={handleNavigate} />;
        return <CartPage onNavigate={handleNavigate} />;
      case 'orders':
        if (!state.isLoggedIn) return <LoginPage onNavigate={handleNavigate} />;
        return <OrdersPage onNavigate={handleNavigate} />;
      case 'login':
        if (state.isLoggedIn) {
          return state.isAdmin
            ? <AdminDashboard onNavigate={handleNavigate} />
            : <HomePage onNavigate={handleNavigate} />;
        }
        return <LoginPage onNavigate={handleNavigate} />;
      case 'admin-dashboard':
        if (!state.isLoggedIn || !state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'admin-menu':
        if (!state.isLoggedIn || !state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminMenuPage />;
      case 'admin-orders':
        if (!state.isLoggedIn || !state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminOrdersPage />;
      case 'admin-users':
        if (!state.isLoggedIn || !state.isAdmin) return <LoginPage onNavigate={handleNavigate} />;
        return <AdminUsersPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="font-body min-h-screen bg-gray-50">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} cartCount={cartCount} />
      <main>{renderPage()}</main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
