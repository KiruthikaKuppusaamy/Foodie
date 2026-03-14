/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Menu as MenuIcon,
  CheckCircle2,
  Truck,
  UtensilsCrossed,
  PackageCheck,
  Phone,
  MessageSquare,
  Navigation,
  History,
  CreditCard,
  Wallet,
  Banknote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { RESTAURANTS, CATEGORIES, PROMOTIONS } from './data';
import { Restaurant, MenuItem, CartItem, Order, Promotion } from './types';

const socket = io();

export default function App() {
  const [view, setView] = useState<'customer' | 'restaurant' | 'past-orders'>('customer');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered'>('idle');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pastOrders');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'cash'>('cash');
  const [activeDeliveryFilter, setActiveDeliveryFilter] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('pastOrders', JSON.stringify(pastOrders));
  }, [pastOrders]);

  useEffect(() => {
    socket.on('order_update', (data) => {
      console.log('Received order update:', data);
      if (activeOrder && data.orderId === activeOrder.id) {
        setOrderStatus(data.status);
      }
    });

    return () => {
      socket.off('order_update');
    };
  }, [activeOrder]);

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter(res => {
      const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !activeCategory || res.categories.includes(activeCategory);
      const matchesDelivery = activeDeliveryFilter === null || 
                             (activeDeliveryFilter === 0 ? res.deliveryFee === 0 : res.deliveryFee <= activeDeliveryFilter);
      return matchesSearch && matchesCategory && matchesDelivery;
    });
  }, [searchQuery, activeCategory, activeDeliveryFilter]);

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

  const buyNow = (item: MenuItem, restaurantId: string) => {
    if (orderStatus !== 'idle') return;
    const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
    if (!restaurant) return;

    const newOrder: Order = {
      id: `QB-${Math.floor(Math.random() * 90000) + 10000}`,
      items: [{ ...item, quantity: 1, restaurantId }],
      total: item.price + restaurant.deliveryFee,
      restaurant: restaurant,
      timestamp: Date.now(),
      status: 'processing',
      paymentMethod: selectedPaymentMethod
    };

    setCart([]);
    setOrderStatus('processing');
    setSelectedRestaurant(restaurant);
    setActiveOrder(newOrder);
    
    // Emit to server
    socket.emit('place_order', newOrder);
    setIsCartOpen(false);
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
    if (!selectedRestaurant) return;
    
    const newOrder: Order = {
      id: `QB-${Math.floor(Math.random() * 90000) + 10000}`,
      items: [...cart],
      total: cartTotal + selectedRestaurant.deliveryFee,
      restaurant: selectedRestaurant,
      timestamp: Date.now(),
      status: 'processing',
      paymentMethod: selectedPaymentMethod
    };

    setOrderStatus('processing');
    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);

    // Emit to server
    socket.emit('place_order', newOrder);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const OrderTrackingView = () => {
    if (!activeOrder) return null;

    const steps = [
      { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Restaurant has accepted your order' },
      { id: 'preparing', label: 'Preparing', icon: UtensilsCrossed, description: 'Chef is working their magic' },
      { id: 'out-for-delivery', label: 'On the Way', icon: Truck, description: 'Courier is heading to you' },
      { id: 'delivered', label: 'Delivered', icon: PackageCheck, description: 'Enjoy your meal!' },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === orderStatus);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Status Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
              <div className="p-6 bg-emerald-500 text-white">
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Order Status</p>
                <h2 className="text-2xl font-bold mb-4">{activeOrder.id}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/20">
                    <img src={activeOrder.restaurant.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm">
                    <p className="font-bold">{activeOrder.restaurant.name}</p>
                    <p className="text-emerald-100">{activeOrder.items.length} items • ₹{activeOrder.total.toFixed(2)}</p>
                    <p className="text-[10px] text-emerald-100/80 uppercase tracking-widest mt-1 font-bold">
                      Paid via {activeOrder.paymentMethod || 'Cash'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex || orderStatus === 'delivered';
                    const isActive = step.id === orderStatus;
                    const Icon = step.icon;

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {index !== steps.length - 1 && (
                          <div className={`absolute left-5 top-10 bottom-[-16px] w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-neutral-100'}`} />
                        )}
                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500 text-white' : 
                          isActive ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50' : 
                          'bg-neutral-100 text-neutral-400'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h4 className={`text-sm font-bold ${isActive ? 'text-neutral-900' : isCompleted ? 'text-neutral-600' : 'text-neutral-400'}`}>
                            {step.label}
                          </h4>
                          <p className="text-xs text-neutral-500">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery Partner */}
            <AnimatePresence>
              {(orderStatus === 'out-for-delivery' || orderStatus === 'delivered') && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-lg"
                >
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Delivery Partner</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80" alt="Rider" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">Rahul Sharma</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" /> 4.9 • 2k+ deliveries
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-neutral-100 hover:bg-emerald-50 text-emerald-600 rounded-2xl transition-colors">
                        <Phone size={18} />
                      </button>
                      <button className="p-3 bg-neutral-100 hover:bg-emerald-50 text-emerald-600 rounded-2xl transition-colors">
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map Visualization */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden h-full min-h-[400px] relative">
              {/* Simulated Map Background */}
              <div className="absolute inset-0 bg-[#f8f9fa] overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Simulated Roads */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 400">
                  <path d="M0 100 H400 M0 200 H400 M0 300 H400 M100 0 V400 M200 0 V400 M300 0 V400" stroke="black" strokeWidth="2" fill="none" />
                </svg>

                {/* Delivery Path */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <motion.path 
                    d="M100 300 L100 200 L300 200 L300 100" 
                    stroke="#10b981" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: currentStepIndex / 3 }}
                    transition={{ duration: 2 }}
                  />
                </svg>

                {/* Restaurant Marker */}
                <div className="absolute left-[100px] top-[300px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-white p-1 rounded-lg shadow-lg border border-neutral-200 mb-1">
                    <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-white">
                      <UtensilsCrossed size={14} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full shadow-sm border border-neutral-100 whitespace-nowrap">
                    {activeOrder.restaurant.name}
                  </span>
                </div>

                {/* Home Marker */}
                <div className="absolute left-[300px] top-[100px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="bg-white p-1 rounded-lg shadow-lg border border-neutral-200 mb-1">
                    <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center text-white">
                      <MapPin size={14} />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full shadow-sm border border-neutral-100 whitespace-nowrap">
                    Home
                  </span>
                </div>

                {/* Moving Courier Marker */}
                <AnimatePresence>
                  {orderStatus === 'out-for-delivery' && (
                    <motion.div 
                      initial={{ left: '100px', top: '300px' }}
                      animate={{ 
                        left: ['100px', '100px', '300px', '300px'],
                        top: ['300px', '200px', '200px', '100px']
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                    >
                      <div className="relative">
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 bg-emerald-500/20 rounded-full"
                        />
                        <div className="bg-emerald-500 text-white p-2 rounded-full shadow-xl relative z-10">
                          <Truck size={20} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delivered Marker */}
                {orderStatus === 'delivered' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute left-[300px] top-[100px] -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <div className="bg-emerald-600 text-white p-3 rounded-full shadow-2xl ring-8 ring-emerald-500/20">
                      <PackageCheck size={24} />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Map Overlay Info */}
              <div className="absolute bottom-6 left-6 right-6 flex gap-4">
                <div className="flex-1 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Navigation size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Current Location</p>
                    <p className="text-sm font-bold">
                      {orderStatus === 'out-for-delivery' ? 'Near Sector 42' : 
                       orderStatus === 'delivered' ? 'At your doorstep' : 
                       'At Restaurant'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {orderStatus === 'delivered' && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  if (activeOrder) {
                    setPastOrders(prev => [{ ...activeOrder, status: 'delivered' }, ...prev]);
                  }
                  setOrderStatus('idle');
                  setActiveOrder(null);
                  setSelectedRestaurant(null);
                }}
                className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
              >
                Order Received
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const PastOrdersView = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto py-8"
      >
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setView('customer')}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
        </div>

        {pastOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
            <History size={64} className="mx-auto text-neutral-200 mb-4" />
            <h3 className="text-xl font-bold text-neutral-400">No past orders yet</h3>
            <button 
              onClick={() => setView('customer')}
              className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pastOrders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-neutral-200">
                      <img src={order.restaurant.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{order.restaurant.name}</h3>
                      <p className="text-xs text-neutral-500">
                        {new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Delivered</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-600">{item.quantity}x</span>
                          <span className="text-neutral-700">{item.name}</span>
                        </div>
                        <span className="text-neutral-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-neutral-100 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-neutral-400">Order ID: #{order.id}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Payment: {order.paymentMethod || 'Cash'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        // Logic to reorder could go here
                        setSelectedRestaurant(order.restaurant);
                        setView('customer');
                      }}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors"
                    >
                      Order Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const PromoCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
      }, 5000);
      return () => clearInterval(timer);
    }, []);

    return (
      <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden mb-12 shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={PROMOTIONS[currentIndex].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${PROMOTIONS[currentIndex].color} flex items-center`}
          >
            <div className="flex-1 px-8 md:px-16 z-10">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-4"
              >
                Limited Time Offer
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight"
              >
                {PROMOTIONS[currentIndex].title}
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-sm md:text-lg font-medium mb-6 max-w-md"
              >
                {PROMOTIONS[currentIndex].subtitle}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={() => {
                  const resId = PROMOTIONS[currentIndex].restaurantId;
                  if (resId) {
                    const res = RESTAURANTS.find(r => r.id === resId);
                    if (res) setSelectedRestaurant(res);
                  }
                }}
                className="px-6 py-3 bg-white text-neutral-900 rounded-2xl font-bold text-sm hover:bg-neutral-100 transition-all shadow-xl"
              >
                Order Now
              </motion.button>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 overflow-hidden">
              <img 
                src={PROMOTIONS[currentIndex].image} 
                alt="" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-inherit to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-6 left-8 md:left-16 flex gap-2 z-20">
          {PROMOTIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  const RestaurantDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
      socket.emit('join_restaurant');
      socket.on('active_orders', (data) => setOrders(data));
      socket.on('new_order', (order) => setOrders(prev => [...prev, order]));
      socket.on('order_update', (data) => {
        setOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o));
      });

      return () => {
        socket.off('active_orders');
        socket.off('new_order');
        socket.off('order_update');
      };
    }, []);

    const updateStatus = (orderId: string, status: string) => {
      socket.emit('update_order_status', { orderId, status });
    };

    return (
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Updates Active
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
              <PackageCheck size={64} className="mx-auto text-neutral-200 mb-4" />
              <h3 className="text-xl font-bold text-neutral-400">No active orders right now</h3>
            </div>
          ) : (
            orders.map(order => (
              <motion.div 
                key={order.id}
                layout
                className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.id}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-neutral-500">{order.items.length} items • ₹{order.total}</p>
                        <span className="text-[10px] font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded uppercase tracking-wider">
                          {order.paymentMethod || 'Cash'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.status === 'delivered' ? 'bg-neutral-100 text-neutral-500' :
                    order.status === 'out-for-delivery' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {order.status}
                  </div>
                </div>
                <div className="p-6 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-100">
                        <span className="font-bold text-emerald-600">{item.quantity}x</span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateStatus(order.id, 'confirmed')}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm font-bold hover:bg-neutral-800 transition-colors"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
                    >
                      Start Preparing
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'out-for-delivery')}
                      className="px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors"
                    >
                      Dispatch
                    </button>
                    <button 
                      onClick={() => updateStatus(order.id, 'delivered')}
                      className="px-4 py-2 rounded-xl bg-neutral-100 text-neutral-600 text-sm font-bold hover:bg-neutral-200 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-neutral-100 rounded-full md:hidden"
            >
              <MenuIcon size={20} />
            </button>
            <div 
              className="text-2xl font-bold tracking-tighter text-emerald-600 cursor-pointer"
              onClick={() => {
                setSelectedRestaurant(null);
                setView('customer');
              }}
            >
              QuickBite
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => {
                setSelectedRestaurant(null);
                setView('customer');
              }}
              className={`text-sm font-bold transition-colors ${view === 'customer' && !selectedRestaurant ? 'text-emerald-600' : 'text-neutral-500 hover:text-emerald-600'}`}
            >
              Home
            </button>
            <button 
              onClick={() => setView('past-orders')}
              className={`text-sm font-bold transition-colors ${view === 'past-orders' ? 'text-emerald-600' : 'text-neutral-500 hover:text-emerald-600'}`}
            >
              My Orders
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-neutral-500 bg-neutral-100 px-4 py-2 rounded-full">
            <MapPin size={16} className="text-emerald-500" />
            <span>Deliver to: <span className="text-neutral-900">123 Tech Avenue, Silicon Valley</span></span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView(prev => prev === 'customer' ? 'restaurant' : 'customer')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-xs font-bold transition-all"
            >
              {view === 'customer' ? 'Restaurant View' : 'Customer View'}
            </button>
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-2xl md:hidden p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="text-xl font-bold tracking-tighter text-emerald-600">QuickBite</div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => {
                    setSelectedRestaurant(null);
                    setView('customer');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${view === 'customer' && !selectedRestaurant ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-600 hover:bg-neutral-50'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    setView('past-orders');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${view === 'past-orders' ? 'bg-emerald-50 text-emerald-600' : 'text-neutral-600 hover:bg-neutral-50'}`}
                >
                  My Orders
                </button>
                <div className="pt-4 border-t border-neutral-100">
                  <button 
                    onClick={() => {
                      setView(prev => prev === 'customer' ? 'restaurant' : 'customer');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all"
                  >
                    {view === 'customer' ? 'Switch to Restaurant View' : 'Switch to Customer View'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'restaurant' ? (
            <RestaurantDashboard key="restaurant-dashboard" />
          ) : view === 'past-orders' ? (
            <PastOrdersView key="past-orders" />
          ) : activeOrder ? (
            <OrderTrackingView key="tracking" />
          ) : !selectedRestaurant ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PromoCarousel />

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
                    
                    <div className="flex flex-wrap gap-2 mt-4 max-w-xl">
                      <button 
                        onClick={() => setActiveCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!activeCategory ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                      >
                        All
                      </button>
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => setActiveCategory(cat.name)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${activeCategory === cat.name ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 max-w-xl">
                      <span className="text-white/60 text-xs font-bold uppercase tracking-wider flex items-center mr-2">Delivery:</span>
                      {[
                        { label: 'All', value: null },
                        { label: 'Free', value: 0 },
                        { label: 'Under ₹50', value: 50 },
                        { label: 'Under ₹100', value: 100 },
                      ].map(filter => (
                        <button 
                          key={filter.label}
                          onClick={() => setActiveDeliveryFilter(filter.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeDeliveryFilter === filter.value ? 'bg-white text-emerald-600' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
                        >
                          {filter.value === 0 && <Truck size={14} />}
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  {filteredRestaurants.length > 0 ? (
                    filteredRestaurants.map(res => (
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
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {res.categories.map(cat => (
                                <span 
                                  key={cat} 
                                  className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-neutral-600">
                              <span className="flex items-center gap-1"><Clock size={14} /> {res.deliveryTime}</span>
                              <span>•</span>
                              <span className={res.deliveryFee === 0 ? 'text-emerald-600 font-bold' : ''}>
                                {res.deliveryFee === 0 ? 'Free delivery' : `₹${res.deliveryFee} delivery`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                        <UtensilsCrossed size={40} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No restaurants found</h3>
                      <p className="text-neutral-500">Try adjusting your filters or search query</p>
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory(null);
                          setActiveDeliveryFilter(null);
                        }}
                        className="mt-4 text-emerald-600 font-bold hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
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
                                    <span className="font-bold text-emerald-600">₹{item.price}</span>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => buyNow(item, selectedRestaurant.id)}
                                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-sm"
                                      >
                                        Buy Now
                                      </button>
                                      <button 
                                        onClick={() => addToCart(item, selectedRestaurant.id)}
                                        className="p-2 bg-neutral-100 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                      >
                                        <Plus size={18} />
                                      </button>
                                    </div>
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
                                <p className="text-xs text-neutral-500">₹{item.price} each</p>
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
                            <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Delivery Fee</span>
                            <span className="font-medium">₹{selectedRestaurant.deliveryFee}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2">
                            <span>Total</span>
                            <span className="text-emerald-600">₹{(cartTotal + selectedRestaurant.deliveryFee).toFixed(2)}</span>
                          </div>
                        </div>
                        <button 
                          onClick={handleCheckout}
                          disabled={orderStatus !== 'idle'}
                          className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                            orderStatus === 'processing' ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' :
                            orderStatus !== 'idle' ? 'bg-emerald-600 text-white' :
                            'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100'
                          }`}
                        >
                          {orderStatus === 'processing' ? 'Processing...' : orderStatus !== 'idle' ? 'Order Placed!' : 'Checkout'}
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
                            <span className="font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(2)}</span>
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
                  <div className="mb-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Payment Method</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'cash', label: 'Cash', icon: Banknote },
                        { id: 'upi', label: 'UPI', icon: Wallet },
                        { id: 'card', label: 'Card', icon: CreditCard },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setSelectedPaymentMethod(method.id as any)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                            selectedPaymentMethod === method.id
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                              : 'border-neutral-200 bg-white text-neutral-400 hover:border-neutral-300'
                          }`}
                        >
                          <method.icon size={20} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Delivery Fee</span>
                      <span>₹{cart[0]?.restaurantId ? RESTAURANTS.find(r => r.id === cart[0].restaurantId)?.deliveryFee : 0}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-3 border-t border-neutral-200">
                      <span>Total</span>
                      <span className="text-emerald-600">₹{(cartTotal + (cart[0]?.restaurantId ? (RESTAURANTS.find(r => r.id === cart[0].restaurantId)?.deliveryFee || 0) : 0)).toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={orderStatus !== 'idle'}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-2 ${
                      orderStatus === 'processing' ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' :
                      orderStatus !== 'idle' ? 'bg-emerald-600 text-white' :
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
                    ) : orderStatus !== 'idle' ? (
                      'Order Placed!'
                    ) : (
                      <>Place Order <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
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
