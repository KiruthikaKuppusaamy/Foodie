/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Star, 
  Clock, 
  ChevronRight, 
  Plus, 
  Minus, 
  X, 
  ArrowLeft,
  MapPin,
  Menu as MenuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RESTAURANTS, CATEGORIES } from './data';
import { Restaurant, MenuItem, CartItem } from './types';

export default function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter(res => {
      const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !activeCategory || res.categories.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const addToCart = (item: MenuItem, restaurantId: string) => {
    if (orderStatus !== 'idle') return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, restaurantId }];
    });
  };

  const removeFromCart = (itemId: string) => {
    if (orderStatus !== 'idle') return;
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const handleCheckout = () => {
    setOrderStatus('processing');
    setTimeout(() => {
      setOrderStatus('success');
      setCart([]);
      setTimeout(() => {
        setOrderStatus('idle');
        setIsCartOpen(false);
        setSelectedRestaurant(null);
      }, 3000);
    }, 2000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-100 rounded-full lg:hidden">
              <MenuIcon size={20} />
            </button>
            <div 
              className="text-2xl font-bold tracking-tighter text-emerald-600 cursor-pointer"
              onClick={() => setSelectedRestaurant(null)}
            >
              QuickBite
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-500 bg-neutral-100 px-4 py-2 rounded-full">
            <MapPin size={16} className="text-emerald-500" />
            <span>Deliver to: <span className="text-neutral-900">123 Tech Avenue, Silicon Valley</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedRestaurant ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Section */}
              <section className="mb-12">
                <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-neutral-900">
                  <img 
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" 
                    alt="Hero" 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                      Hungry? We've got <br /> you covered.
                    </h1>
                    <div className="relative max-w-xl">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Search for restaurants, cuisines, or dishes..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Categories */}
              <section className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveCategory(null)}
                    className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl transition-all ${!activeCategory ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white hover:bg-neutral-100 border border-neutral-200'}`}
                  >
                    <span className="text-2xl mb-1">All</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Explore</span>
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`flex flex-col items-center justify-center min-w-[80px] h-24 rounded-2xl transition-all ${activeCategory === cat.name ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white hover:bg-neutral-100 border border-neutral-200'}`}
                    >
                      <span className="text-2xl mb-1">{cat.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Featured Restaurants */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight">Featured Restaurants</h2>
                  <button className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
                    View all <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRestaurants.map(res => (
                    <motion.div 
                      key={res.id}
                      whileHover={{ y: -8 }}
                      className="group cursor-pointer"
                      onClick={() => setSelectedRestaurant(res)}
                    >
                      <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all">
                        <img 
                          src={res.image} 
                          alt={res.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          {res.rating}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{res.name}</h3>
                          <p className="text-sm text-neutral-500 mb-2">{res.categories.join(' • ')}</p>
                          <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
                            <span className="flex items-center gap-1"><Clock size={14} /> {res.deliveryTime}</span>
                            <span>•</span>
                            <span>${res.deliveryFee} delivery</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="restaurant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setSelectedRestaurant(null)}
                className="mb-8 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-medium transition-colors"
              >
                <ArrowLeft size={20} /> Back to restaurants
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                  <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-lg">
                    <img 
                      src={selectedRestaurant.image} 
                      alt={selectedRestaurant.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                        {selectedRestaurant.name}
                      </h1>
                      <div className="flex items-center gap-4 text-white/90 font-medium">
                        <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /> {selectedRestaurant.rating}</span>
                        <span>•</span>
                        <span>{selectedRestaurant.deliveryTime}</span>
                        <span>•</span>
                        <span>{selectedRestaurant.categories.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {['Popular Items', 'Main Dishes', 'Sides', 'Drinks'].map(section => {
                      const items = selectedRestaurant.menu.filter(item => 
                        section === 'Popular Items' ? true : item.category === section
                      );
                      if (items.length === 0 && section !== 'Popular Items') return null;
                      
                      return (
                        <div key={section}>
                          <h2 className="text-2xl font-bold mb-6 tracking-tight">{section}</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {items.map(item => (
                              <div 
                                key={item.id}
                                className="bg-white p-4 rounded-2xl border border-neutral-100 flex gap-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{item.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-600">${item.price}</span>
                                    <button 
                                      onClick={() => addToCart(item, selectedRestaurant.id)}
                                      className="p-2 bg-neutral-100 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                    >
                                      <Plus size={18} />
                                    </button>
                                  </div>
                                </div>
                                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="sticky top-24 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
                    <h3 className="text-xl font-bold mb-6">Your Order</h3>
                    {cart.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag size={48} className="mx-auto text-neutral-200 mb-4" />
                        <p className="text-neutral-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                          {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-xs text-neutral-500">${item.price} each</p>
                              </div>
                              <div className="flex items-center gap-3 bg-neutral-100 px-2 py-1 rounded-lg">
                                <button onClick={() => removeFromCart(item.id)} className="hover:text-emerald-600 transition-colors">
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item, item.restaurantId)} className="hover:text-emerald-600 transition-colors">
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2 border-t border-neutral-100 pt-4 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Subtotal</span>
                            <span className="font-medium">${cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Delivery Fee</span>
                            <span className="font-medium">${selectedRestaurant.deliveryFee}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2">
                            <span>Total</span>
                            <span className="text-emerald-600">${(cartTotal + selectedRestaurant.deliveryFee).toFixed(2)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={handleCheckout}
                          disabled={orderStatus !== 'idle'}
                          className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                            orderStatus === 'processing' ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' :
                            orderStatus === 'success' ? 'bg-emerald-600 text-white' :
                            'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                          }`}
                        >
                          {orderStatus === 'processing' ? 'Processing...' : orderStatus === 'success' ? 'Order Placed!' : 'Checkout'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Your Cart</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag size={40} className="text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
                    <p className="text-neutral-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="px-8 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Browse Restaurants
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-bold">{item.name}</h4>
                            <span className="font-bold text-emerald-600">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-neutral-500 mb-3 line-clamp-1">{item.description}</p>
                          <div className="flex items-center gap-3 bg-neutral-100 w-fit px-3 py-1 rounded-lg">
                            <button onClick={() => removeFromCart(item.id)} className="hover:text-emerald-600 transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => addToCart(item, item.restaurantId)} className="hover:text-emerald-600 transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Delivery Fee</span>
                      <span>$2.99</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-neutral-200">
                      <span>Total</span>
                      <span className="text-emerald-600">${(cartTotal + 2.99).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={orderStatus !== 'idle'}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                      orderStatus === 'processing' ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' :
                      orderStatus === 'success' ? 'bg-emerald-600 text-white' :
                      'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                    }`}
                  >
                    {orderStatus === 'processing' ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Clock size={20} />
                      </motion.div>
                    ) : orderStatus === 'success' ? (
                      'Order Placed!'
                    ) : (
                      <>Place Order <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
              )}

              {orderStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <Star size={40} className="fill-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2 tracking-tight">Order Confirmed!</h2>
                  <p className="text-neutral-500 mb-8">Your food is being prepared and will be with you shortly.</p>
                  <div className="w-full bg-neutral-100 rounded-2xl p-4 text-left space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Order ID</span>
                      <span className="font-bold">#QB-82910</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Estimated Delivery</span>
                      <span className="font-bold">25-35 min</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold tracking-tighter text-emerald-600 mb-4">QuickBite</div>
            <p className="text-neutral-500 max-w-sm">
              Delivering happiness to your doorstep. The best food from your favorite local restaurants, delivered fast.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-neutral-400">Company</h4>
            <ul className="space-y-2 text-sm font-medium text-neutral-600">
              <li className="hover:text-emerald-600 cursor-pointer">About Us</li>
              <li className="hover:text-emerald-600 cursor-pointer">Careers</li>
              <li className="hover:text-emerald-600 cursor-pointer">Partner with us</li>
              <li className="hover:text-emerald-600 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-neutral-400">Support</h4>
            <ul className="space-y-2 text-sm font-medium text-neutral-600">
              <li className="hover:text-emerald-600 cursor-pointer">Help Center</li>
              <li className="hover:text-emerald-600 cursor-pointer">Contact Us</li>
              <li className="hover:text-emerald-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-emerald-600 cursor-pointer">Refund Policy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-12 mt-12 border-t border-neutral-100 text-center text-xs text-neutral-400 font-medium">
          © 2026 QuickBite Delivery. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
