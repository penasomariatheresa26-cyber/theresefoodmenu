-- ============================================
-- THERESSE FOOD MENU SYSTEM - AIVEN POSTGRESQL SCHEMA
-- Location: Hinunangan, Southern Leyte
-- Currency: Philippine Peso (₱)
-- Run this in your Aiven PostgreSQL database
-- ============================================

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  wallet_balance DECIMAL(10, 2) DEFAULT 500.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MENU ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(500) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('meals', 'drinks', 'desserts', 'sides')),
  available BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('e-wallet', 'cash-on-delivery')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'out-for-delivery', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id VARCHAR(50) REFERENCES menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- WALLET TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('topup', 'payment')),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- SEED DATA - MENU ITEMS (Prices in Philippine Peso)
-- ============================================
INSERT INTO menu_items (id, name, description, price, image, category, available, featured) VALUES
  ('1', 'Grilled Chicken Platter', 'Tender grilled chicken breast served with roasted vegetables, garlic mashed potatoes, and our signature herb sauce.', 259.00, '/images/food-1.jpg', 'meals', true, true),
  ('2', 'Classic Beef Burger', 'Juicy beef patty with lettuce, tomato, pickles, and special sauce on a toasted brioche bun. Served with crispy fries.', 199.00, '/images/food-2.jpg', 'meals', true, true),
  ('3', 'Pasta Pomodoro', 'Al dente spaghetti tossed in a rich tomato basil sauce with fresh parmesan cheese and aromatic Italian herbs.', 175.00, '/images/food-3.jpg', 'meals', true, true),
  ('4', 'Chocolate Lava Cake', 'Warm chocolate cake with a molten center, topped with fresh berries and a dusting of powdered sugar. Served with vanilla ice cream.', 145.00, '/images/food-4.jpg', 'desserts', true, true),
  ('5', 'Shrimp Salad', 'Fresh mixed greens with grilled shrimp, cherry tomatoes, and citrus vinaigrette dressing.', 185.00, '/images/food-5.jpg', 'meals', true, false),
  ('6', 'Iced Coffee Frappe', 'Blended iced coffee with milk, caramel drizzle, and whipped cream. A perfect refreshing beverage.', 85.00, '/images/food-6.jpg', 'drinks', true, false),
  ('7', 'Mango Smoothie', 'Fresh mango blended with yogurt, honey, and ice. Naturally sweet and incredibly refreshing.', 75.00, '/images/food-6.jpg', 'drinks', true, false),
  ('8', 'Garlic Bread Basket', 'Warm garlic bread toasted to perfection with butter, garlic, and fresh parsley. Perfect as a starter.', 65.00, '/images/food-2.jpg', 'sides', true, false),
  ('9', 'Leche Flan', 'Classic Filipino custard dessert with caramelized sugar topping. Smooth and creamy.', 95.00, '/images/food-4.jpg', 'desserts', true, false),
  ('10', 'Caesar Salad', 'Crisp romaine lettuce with parmesan cheese, croutons, and creamy Caesar dressing.', 125.00, '/images/food-5.jpg', 'sides', true, false),
  ('11', 'Calamansi Juice', 'Freshly squeezed calamansi juice with a hint of honey. Served ice cold for maximum refreshment.', 45.00, '/images/food-6.jpg', 'drinks', true, false),
  ('12', 'Pork BBQ Platter', 'Slow-cooked pork BBQ skewers glazed with our house-made sweet BBQ sauce, served with java rice.', 189.00, '/images/food-1.jpg', 'meals', true, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- Email: admin@theresse.com
-- Password: admin123 (you need to hash this with bcrypt in your app)
-- ============================================
-- Note: Run this after setting up bcrypt hashing in your backend
-- INSERT INTO users (email, password, name, is_admin, wallet_balance) VALUES
--   ('admin@theresse.com', '$2a$10$YOUR_HASHED_PASSWORD', 'Admin User', true, 1000.00)
-- ON CONFLICT (email) DO NOTHING;
