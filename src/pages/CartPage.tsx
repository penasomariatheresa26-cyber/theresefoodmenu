import { useState } from 'react';
import { useApp } from '../store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MapPin, Phone, User, Banknote, Truck } from 'lucide-react';

interface CartPageProps {
  onNavigate: (page: string) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { state, dispatch, placeOrderInDb } = useApp();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customerName, setCustomerName] = useState(state.userName);
  const [address, setAddress] = useState('');
  const [barangay, setBarangay] = useState('');
  const [phone, setPhone] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = state.cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 50.00 : 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!customerName || !address || !phone) return;

    const fullAddress = barangay
      ? `${address}, Brgy. ${barangay}, Hinunangan, Southern Leyte`
      : `${address}, Hinunangan, Southern Leyte`;

    await placeOrderInDb({
      total,
      status: 'pending',
      customerName,
      address: fullAddress,
      phone,
      paymentMethod: 'cash-on-delivery',
    });
    
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md mx-4 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Order Placed!</h2>
          <p className="text-gray-600 mb-2">Salamat! Your order has been successfully placed.</p>
          <p className="text-gray-500 text-sm mb-6">Please prepare <span className="font-bold text-primary">₱{total.toFixed(2)}</span> for Cash on Delivery.</p>
          <div className="space-y-3">
            <button
              onClick={() => onNavigate('orders')}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition cursor-pointer"
            >
              View My Orders
            </button>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
          <button
            onClick={() => onNavigate('menu')}
            className="px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition cursor-pointer"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold">
            {step === 'cart' ? 'Shopping Cart' : 'Checkout'}
          </h1>
          <p className="text-white/80 mt-1">
            {step === 'cart'
              ? `${state.cart.length} item(s) in your cart`
              : 'Complete your delivery details'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step === 'cart' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'cart' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            Cart
          </div>
          <div className="flex-1 h-0.5 bg-gray-200">
            <div className={`h-full bg-primary transition-all ${step === 'checkout' ? 'w-full' : 'w-0'}`} />
          </div>
          <div className={`flex items-center gap-2 ${step === 'checkout' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === 'checkout' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            Checkout
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-4">
                {state.cart.map(cartItem => (
                  <div
                    key={cartItem.menuItem.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 animate-fade-in-up"
                  >
                    <img
                      src={cartItem.menuItem.image}
                      alt={cartItem.menuItem.name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold text-gray-900">{cartItem.menuItem.name}</h3>
                      <p className="text-gray-500 text-sm truncate">{cartItem.menuItem.description}</p>
                      <p className="text-primary font-bold mt-1">₱{cartItem.menuItem.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: cartItem.menuItem.id })}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl">
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_CART_QUANTITY',
                              payload: { id: cartItem.menuItem.id, quantity: cartItem.quantity - 1 },
                            })
                          }
                          className="p-2 hover:bg-gray-200 rounded-l-xl transition cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm">{cartItem.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_CART_QUANTITY',
                              payload: { id: cartItem.menuItem.id, quantity: cartItem.quantity + 1 },
                            })
                          }
                          className="p-2 hover:bg-gray-200 rounded-r-xl transition cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">
                        ₱{(cartItem.menuItem.price * cartItem.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Truck size={20} className="text-primary" /> Delivery Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <User size={14} /> Full Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <MapPin size={14} /> Street Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="House #, Street name"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <MapPin size={14} /> Barangay
                      </label>
                      <select
                        value={barangay}
                        onChange={e => setBarangay(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none bg-white"
                      >
                        <option value="">Select Barangay</option>
                        <option value="Poblacion">Poblacio</option>
                        <option value="Ambacon">Ambacon</option>
                        <option value="Bangon">Bangcas A</option>
                        <option value="Cabuynan">Bangcas B</option>
                        <option value="Calag-itan">Calag-itan</option>
                        <option value="Canamucan">Ingan</option>
                        <option value="Canap-acan">Canipaan</option>
                        <option value="Mag-aso">San Pedro Island</option>
                        <option value="Magtino">San Pablo Island</option>
                        <option value="Nahulid">Matin-ao</option>
                        <option value="Otikon">Panalaron</option>
                        <option value="Panalaron">Tawog</option>
                        <option value="San Vicente">San Vicente</option>
                        <option value="Tahusan">Tahusan</option>
                        <option value="Talisay">Talisay</option>
                        <option value="Toptop">Toptop</option>
                        <option value="Tugawe">libas</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                    📍 Delivery within Hinunangan, Southern Leyte only
                  </p>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Phone size={14} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="09552085854"
                    />
                  </div>
                </div>

                {/* Payment Method — Cash on Delivery only */}
                <div className="pt-4 border-t">
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2 mb-4">
                    <Banknote size={20} className="text-primary" /> Payment Method
                  </h3>
                  <div className="bg-primary/5 border-2 border-primary rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Banknote size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive your order</p>
                    </div>
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" /> Order Summary
              </h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {state.cart.map(item => (
                  <div key={item.menuItem.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.menuItem.name} x{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                      ₱{(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">₱{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-medium text-gray-700">Cash on Delivery</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-primary">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-3 mt-6">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!customerName || !address || !phone}
                    className="w-full py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-light transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Order — ₱{total.toFixed(2)}
                  </button>
                  <button
                    onClick={() => setStep('cart')}
                    className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
                  >
                    Back to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
