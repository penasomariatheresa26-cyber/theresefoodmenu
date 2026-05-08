import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MenuItem, CartItem, Order } from './types';
import { menuApi, ordersApi, healthApi } from './lib/api';

// Default menu items (used when API is not available) - Prices in Philippine Peso
const defaultMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken Platter',
    description: 'Tender grilled chicken breast served with roasted vegetables, garlic mashed potatoes, and our signature herb sauce.',
    price: 259.00,
    image: '/images/food-1.jpg',
    category: 'meals',
    available: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, pickles, and special sauce on a toasted brioche bun. Served with crispy fries.',
    price: 199.00,
    image: '/images/food-2.jpg',
    category: 'meals',
    available: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Pasta Pomodoro',
    description: 'Al dente spaghetti tossed in a rich tomato basil sauce with fresh parmesan cheese and aromatic Italian herbs.',
    price: 175.00,
    image: '/images/food-3.jpg',
    category: 'meals',
    available: true,
    featured: true,
  },
  {
    id: '4',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with a molten center, topped with fresh berries and a dusting of powdered sugar. Served with vanilla ice cream.',
    price: 145.00,
    image: '/images/food-4.jpg',
    category: 'desserts',
    available: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Shrimp Salad',
    description: 'Fresh mixed greens with grilled shrimp, cherry tomatoes, and citrus vinaigrette dressing.',
    price: 185.00,
    image: '/images/food-5.jpg',
    category: 'meals',
    available: true,
  },
  {
    id: '6',
    name: 'Iced Coffee Frappe',
    description: 'Blended iced coffee with milk, caramel drizzle, and whipped cream. A perfect refreshing beverage.',
    price: 85.00,
    image: '/images/food-6.jpg',
    category: 'drinks',
    available: true,
  },
  {
    id: '7',
    name: 'Mango Smoothie',
    description: 'Fresh mango blended with yogurt, honey, and ice. Naturally sweet and incredibly refreshing.',
    price: 75.00,
    image: '/images/food-6.jpg',
    category: 'drinks',
    available: true,
  },
  {
    id: '8',
    name: 'Garlic Bread Basket',
    description: 'Warm garlic bread toasted to perfection with butter, garlic, and fresh parsley. Perfect as a starter.',
    price: 65.00,
    image: '/images/food-2.jpg',
    category: 'sides',
    available: true,
  },
  {
    id: '9',
    name: 'Leche Flan',
    description: 'Classic Filipino custard dessert with caramelized sugar topping. Smooth and creamy.',
    price: 95.00,
    image: '/images/food-4.jpg',
    category: 'desserts',
    available: true,
  },
  {
    id: '10',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing.',
    price: 125.00,
    image: '/images/food-5.jpg',
    category: 'sides',
    available: true,
  },
  {
    id: '11',
    name: 'Calamansi Juice',
    description: 'Freshly squeezed calamansi juice with a hint of honey. Served ice cold for maximum refreshment.',
    price: 45.00,
    image: '/images/food-6.jpg',
    category: 'drinks',
    available: true,
  },
  {
    id: '12',
    name: 'Pork BBQ Platter',
    description: 'Slow-cooked pork BBQ skewers glazed with our house-made sweet BBQ sauce, served with java rice.',
    price: 189.00,
    image: '/images/food-1.jpg',
    category: 'meals',
    available: true,
  },
];

export interface RegisteredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  walletBalance: number;
  createdAt: string;
}

interface AppState {
  menuItems: MenuItem[];
  cart: CartItem[];
  orders: Order[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userId: string | null;
  registeredUsers: RegisteredUser[];
  isLoading: boolean;
  isOnline: boolean;
}

type Action =
  | { type: 'SET_MENU_ITEMS'; payload: MenuItem[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_TO_CART'; payload: MenuItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_MENU_ITEM'; payload: MenuItem }
  | { type: 'UPDATE_MENU_ITEM'; payload: MenuItem }
  | { type: 'DELETE_MENU_ITEM'; payload: string }
  | { type: 'PLACE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status'] } }
  | { type: 'REGISTER_USER'; payload: RegisteredUser }
  | { type: 'LOGIN'; payload: { name: string; isAdmin: boolean; userId: string; email: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ONLINE'; payload: boolean }
  | { type: 'LOAD_USERS'; payload: RegisteredUser[] }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'TOGGLE_USER_ADMIN'; payload: { id: string; isAdmin: boolean } };

// Default admin account
const DEFAULT_ADMIN: RegisteredUser = {
  id: 'admin-default',
  email: 'admin@theresse.com',
  password: 'admin123',
  name: 'Admin',
  isAdmin: true,
  walletBalance: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
};

// Load registered users from localStorage, always include default admin
function loadRegisteredUsers(): RegisteredUser[] {
  try {
    const stored = localStorage.getItem('theresse_users');
    if (stored) {
      const users: RegisteredUser[] = JSON.parse(stored);
      // Ensure default admin always exists
      const hasAdmin = users.some(u => u.id === DEFAULT_ADMIN.id);
      if (!hasAdmin) {
        const withAdmin = [DEFAULT_ADMIN, ...users];
        localStorage.setItem('theresse_users', JSON.stringify(withAdmin));
        return withAdmin;
      }
      return users;
    }
  } catch (e) { /* ignore */ }
  // First load — seed with default admin
  const initial = [DEFAULT_ADMIN];
  localStorage.setItem('theresse_users', JSON.stringify(initial));
  return initial;
}

// Save registered users to localStorage
function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem('theresse_users', JSON.stringify(users));
}

const initialState: AppState = {
  menuItems: defaultMenuItems,
  cart: [],
  orders: [],
  isAdmin: false,
  isLoggedIn: false,
  userName: '',
  userEmail: '',
  userId: null,
  registeredUsers: loadRegisteredUsers(),
  isLoading: false,
  isOnline: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload.length > 0 ? action.payload : defaultMenuItems };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'ADD_TO_CART': {
      const existing = state.cart.find(item => item.menuItem.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.menuItem.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { menuItem: action.payload, quantity: 1 }] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.menuItem.id !== action.payload) };
    case 'UPDATE_CART_QUANTITY':
      if (action.payload.quantity <= 0) {
        return { ...state, cart: state.cart.filter(item => item.menuItem.id !== action.payload.id) };
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.menuItem.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'ADD_MENU_ITEM':
      return { ...state, menuItems: [...state.menuItems, action.payload] };
    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'DELETE_MENU_ITEM':
      return { ...state, menuItems: state.menuItems.filter(item => item.id !== action.payload) };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.payload, ...state.orders], cart: [] };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, status: action.payload.status } : order
        ),
      };
    case 'REGISTER_USER': {
      const updatedUsers = [...state.registeredUsers, action.payload];
      saveRegisteredUsers(updatedUsers);
      return { ...state, registeredUsers: updatedUsers };
    }
    case 'LOGIN':
      return { 
        ...state, 
        isLoggedIn: true, 
        userName: action.payload.name, 
        userEmail: action.payload.email,
        isAdmin: action.payload.isAdmin,
        userId: action.payload.userId,
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isLoggedIn: false, 
        userName: '', 
        userEmail: '',
        isAdmin: false, 
        cart: [],
        userId: null,
      };
    case 'LOAD_USERS': 
      return { ...state, registeredUsers: action.payload };
    case 'DELETE_USER': {
      const filtered = state.registeredUsers.filter(u => u.id !== action.payload);
      saveRegisteredUsers(filtered);
      return { ...state, registeredUsers: filtered };
    }
    case 'TOGGLE_USER_ADMIN': {
      const toggled = state.registeredUsers.map(u =>
        u.id === action.payload.id ? { ...u, isAdmin: action.payload.isAdmin } : u
      );
      saveRegisteredUsers(toggled);
      return { ...state, registeredUsers: toggled };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ONLINE':
      return { ...state, isOnline: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  syncMenuItems: () => Promise<void>;
  syncOrders: () => Promise<void>;
  addMenuItemToDb: (item: MenuItem) => Promise<void>;
  updateMenuItemInDb: (item: MenuItem) => Promise<void>;
  deleteMenuItemFromDb: (id: string) => Promise<void>;
  updateOrderStatusInDb: (orderId: string, status: Order['status']) => Promise<void>;
  placeOrderInDb: (order: Omit<Order, 'id' | 'createdAt' | 'items'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check API health and sync menu items
  const syncMenuItems = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // First check if API is available
      await healthApi.check();
      dispatch({ type: 'SET_ONLINE', payload: true });
      
      // Fetch menu items
      const items = await menuApi.getAll();
      if (items.length > 0) {
        dispatch({ type: 'SET_MENU_ITEMS', payload: items });
      }
    } catch (error) {
      console.log('API not available, using local data');
      dispatch({ type: 'SET_ONLINE', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Sync orders from API
  const syncOrders = async () => {
    if (!state.isOnline || !state.userId) return;
    try {
      const orders = await ordersApi.getAll(state.userId, state.isAdmin);
      dispatch({ type: 'SET_ORDERS', payload: orders });
    } catch (error) {
      console.error('Failed to sync orders:', error);
    }
  };

  // Add menu item
  const addMenuItemToDb = async (item: MenuItem) => {
    dispatch({ type: 'ADD_MENU_ITEM', payload: item });
    if (state.isOnline) {
      try {
        await menuApi.create({ ...item, featured: item.featured ?? false });
      } catch (error) {
        console.error('Failed to add menu item to database:', error);
      }
    }
  };

  // Update menu item
  const updateMenuItemInDb = async (item: MenuItem) => {
    dispatch({ type: 'UPDATE_MENU_ITEM', payload: item });
    if (state.isOnline) {
      try {
        await menuApi.update(item.id, item);
      } catch (error) {
        console.error('Failed to update menu item in database:', error);
      }
    }
  };

  // Delete menu item
  const deleteMenuItemFromDb = async (id: string) => {
    dispatch({ type: 'DELETE_MENU_ITEM', payload: id });
    if (state.isOnline) {
      try {
        await menuApi.delete(id);
      } catch (error) {
        console.error('Failed to delete menu item from database:', error);
      }
    }
  };

  // Update order status
  const updateOrderStatusInDb = async (orderId: string, status: Order['status']) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id: orderId, status } });
    if (state.isOnline) {
      try {
        await ordersApi.updateStatus(orderId, status);
      } catch (error) {
        console.error('Failed to update order status:', error);
      }
    }
  };

  // Place order
  const placeOrderInDb = async (orderData: Omit<Order, 'id' | 'createdAt' | 'items'>) => {
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const order: Order = {
      ...orderData,
      id: orderId,
      items: [...state.cart],
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'PLACE_ORDER', payload: order });
    
    if (state.isOnline && state.userId) {
      try {
        await ordersApi.create({
          id: orderId,
          user_id: state.userId,
          customer_name: orderData.customerName,
          address: orderData.address,
          phone: orderData.phone,
          payment_method: orderData.paymentMethod,
          total: orderData.total,
          items: state.cart.map(item => ({
            menuItem: { ...item.menuItem, featured: item.menuItem.featured ?? false },
            quantity: item.quantity,
          })),
        });
      } catch (error) {
        console.error('Failed to create order in database:', error);
      }
    }
  };

  // Load initial data
  useEffect(() => {
    syncMenuItems();
  }, []);

  // Sync user data when logged in
  useEffect(() => {
    if (state.isLoggedIn && state.userId && state.isOnline) {
      syncOrders();
    }
  }, [state.isLoggedIn, state.userId, state.isOnline]);

  return (
    <AppContext.Provider value={{ 
      state, 
      dispatch,
      syncMenuItems,
      syncOrders,
      addMenuItemToDb,
      updateMenuItemInDb,
      deleteMenuItemFromDb,
      updateOrderStatusInDb,
      placeOrderInDb,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
