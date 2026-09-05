import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_MENU_ITEMS,
  INITIAL_INVENTORY,
  INITIAL_USER,
  INITIAL_ORDERS,
  INITIAL_FEEDBACKS,
  INITIAL_CATEGORIES,
} from '../services/mockData';
import { calculateLiveCrowdStatus } from '../services/aiPredictionEngine';
import { TRANSLATIONS, tItemName, tItemDesc, tCategoryName } from '../services/translations';
import { evaluateCoupon } from '../services/coupons';
import { INITIAL_PREPARED_BATCHES, computeFoodWastageStats } from '../services/wasteManagement';
import {
  db,
  COLLECTIONS,
  syncOrderToFirestore,
  syncMenuItemToFirestore,
  syncInventoryToFirestore,
  syncFeedbackToFirestore,
} from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const CanteenContext = createContext(null);

const STORAGE_KEYS = {
  MENU: 'smartbite_menu',
  INVENTORY: 'smartbite_inventory',
  ORDERS: 'smartbite_orders',
  FEEDBACKS: 'smartbite_feedbacks',
  USER: 'smartbite_user',
  ROLE: 'smartbite_active_role',
  SIMULATION: 'smartbite_simulation',
  TIME_OVERRIDE: 'smartbite_time_override',
  LANGUAGE: 'smartbite_language',
  WEATHER: 'smartbite_weather',
  NOTIFY_SUBS: 'smartbite_notify_subs',
};

// Play pleasant notification tone via Web Audio API
function playReadyBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore
  }
}

export function CanteenProvider({ children }) {
  // Active Role: 'student' | 'faculty' | 'staff' | 'admin'
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || 'student';
  });

  // Language: 'en' | 'hi' | 'te' | 'kn'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  });

  // Weather: 'rainy' | 'sunny' | 'cold' | 'pleasant'
  const [weather, setWeather] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.WEATHER) || 'rainy';
  });

  // User Profile with dynamic wallet balance
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  // Menu Items
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // Inventory
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
    return saved ? JSON.parse(saved) : INITIAL_FEEDBACKS;
  });

  // Out of Stock Notification Subscriptions
  const [notifySubscriptions, setNotifySubscriptions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFY_SUBS);
    return saved ? JSON.parse(saved) : [];
  });

  // Prepared batches for food waste tracking
  const [preparedBatches, setPreparedBatches] = useState(INITIAL_PREPARED_BATCHES);

  // Time-of-Day Mode: 'auto' | 'morning' | 'afternoon' | 'night'
  const [timeOfDayOverride, setTimeOfDayOverride] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.TIME_OVERRIDE) || 'auto';
  });

  // Firebase Realtime Connection Status
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  // Simulator Settings
  const [isRushMode, setIsRushMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIMULATION);
    return saved ? JSON.parse(saved).isRushMode : false;
  });

  // Shopping Cart & Pre-Order Slot
  const [cart, setCart] = useState([]);
  const [selectedPickupSlot, setSelectedPickupSlot] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Applied Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Toast Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_welcome',
      title: 'Smart Canteen Connected',
      message: 'AI crowd prediction, climate recommender & food waste tracking active.',
      time: 'Just now',
      type: 'info',
    }
  ]);

  // Translation helper with automatic support for UI keys, menu item names, descriptions & categories
  const t = (key) => {
    if (!key) return '';
    if (typeof key === 'object') {
      if (key.name) return tItemName(key.name, language);
      return '';
    }
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];

    // Check if key is a menu item name
    const itemTr = tItemName(key, language);
    if (itemTr !== key) return itemTr;

    // Check if key is a category
    const catTr = tCategoryName(key, language);
    if (catTr !== key) return catTr;

    // Check if key is item description
    const descTr = tItemDesc(key, language);
    if (descTr !== key) return descTr;

    return TRANSLATIONS.en[key] || key;
  };

  // Compute effective time of day
  const getActiveTimeOfDay = () => {
    if (timeOfDayOverride !== 'auto') return timeOfDayOverride;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'night';
  };

  const activeTimeOfDay = getActiveTimeOfDay();

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEATHER, weather);
  }, [weather]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFY_SUBS, JSON.stringify(notifySubscriptions));
  }, [notifySubscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIMULATION, JSON.stringify({ isRushMode }));
  }, [isRushMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIME_OVERRIDE, timeOfDayOverride);
  }, [timeOfDayOverride]);

  // Firestore Live Realtime Subscriptions
  useEffect(() => {
    let unsubOrders = () => {};
    let unsubMenu = () => {};

    try {
      unsubOrders = onSnapshot(
        collection(db, COLLECTIONS.ORDERS),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteOrders = snapshot.docs.map(d => d.data());
            setOrders(prev => {
              const map = new Map();
              prev.forEach(o => map.set(o.order_id, o));
              remoteOrders.forEach(o => map.set(o.order_id, o));
              return Array.from(map.values());
            });
            setFirebaseConnected(true);
          }
        },
        () => {}
      );

      unsubMenu = onSnapshot(
        collection(db, COLLECTIONS.MENU),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteMenu = snapshot.docs.map(d => d.data());
            setMenuItems(remoteMenu);
          }
        },
        () => {}
      );
    } catch (err) {
      console.warn("Firebase listener initialization:", err);
    }

    return () => {
      unsubOrders();
      unsubMenu();
    };
  }, []);

  // Notifications helper
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      time: 'Just now',
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 8)]);
  };

  // Subscribe to out-of-stock item
  const subscribeToItemAvailability = (itemId, itemName) => {
    setNotifySubscriptions(prev => {
      if (prev.includes(itemId)) return prev;
      return [...prev, itemId];
    });
    addNotification('🔔 Alert Set', `We will notify you the moment "${itemName}" is back in kitchen stock!`, 'success');
  };

  // Top Up Wallet Balance
  const topUpWallet = (amount = 200) => {
    const newBalance = user.walletBalance + amount;
    const updatedUser = { ...user, walletBalance: newBalance };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    addNotification(
      '💳 Wallet Recharged',
      `Added ₹${amount} to your Campus Card. New balance: ₹${newBalance}.`,
      'success'
    );
  };

  // Active student/faculty order
  const activeStudentOrder = orders.find(
    o => o.user_id === user.id && ['placed', 'accepted', 'preparing', 'ready'].includes(o.order_status)
  ) || null;

  // Order history for active user
  const studentOrderHistory = orders.filter(o => o.user_id === user.id);

  // Live crowd status calculation
  const pendingQueueCount = orders.filter(o => ['placed', 'accepted', 'preparing'].includes(o.order_status)).length;
  const liveCrowd = calculateLiveCrowdStatus(pendingQueueCount, isRushMode);

  // Cart operations
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    addNotification('Item Added', `${item.name} added to cart.`, 'success');
  };

  const updateCartQuantity = (itemId, delta) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPickupSlot(null);
    setAppliedCoupon(null);
  };

  // Cart Totals & Coupon Calculation
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const couponResult = appliedCoupon ? evaluateCoupon(appliedCoupon.code, cartSubtotal, cart) : { valid: false, discount: 0 };
  const discountAmount = couponResult.valid ? couponResult.discount : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Apply Coupon
  const applyCouponCode = (code) => {
    const res = evaluateCoupon(code, cartSubtotal, cart);
    if (res.valid) {
      setAppliedCoupon(res.coupon);
      addNotification('🎉 Coupon Applied', res.message, 'success');
      return { success: true, message: res.message };
    } else {
      addNotification('Coupon Notice', res.message, 'warning');
      return { success: false, message: res.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addNotification('Coupon Removed', 'Coupon removed from your cart.', 'info');
  };

  // 1-Click Reorder
  const reorderPreviousOrder = (order) => {
    const itemsToAdd = order.items.map(item => {
      const fullItem = menuItems.find(m => m.id === item.item_id || m.name === item.name);
      return fullItem ? { ...fullItem, quantity: item.quantity } : { ...item };
    });
    setCart(itemsToAdd);
    addNotification(
      '🔁 Order Items Added',
      `${itemsToAdd.length} items from Token #${order.token_number} added to cart.`,
      'success'
    );
  };

  // Auto-deduct inventory on order fulfillment
  const deductInventoryForOrder = (order) => {
    setInventory(prevInv => {
      const newInv = [...prevInv];
      order.items.forEach(orderItem => {
        const menuItem = menuItems.find(m => m.id === orderItem.item_id);
        if (menuItem && menuItem.ingredients) {
          menuItem.ingredients.forEach(ing => {
            const invIndex = newInv.findIndex(inv => inv.name.toLowerCase() === ing.name.toLowerCase());
            if (invIndex !== -1) {
              const currentQty = newInv[invIndex].quantity;
              const deductAmount = (ing.qty * orderItem.quantity) / (ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 1);
              const remaining = Math.max(0, +(currentQty - deductAmount).toFixed(2));
              newInv[invIndex] = {
                ...newInv[invIndex],
                quantity: remaining,
                alert: remaining <= newInv[invIndex].minimum_stock,
              };
              syncInventoryToFirestore(newInv[invIndex]);
            }
          });
        }
      });
      return newInv;
    });
  };

  // Place new order supporting Cash on Delivery (COD), Campus Card, UPI, and Card
  const placeOrder = ({ paymentMethod = 'UPI', pickupSlot, customToken }) => {
    const isFaculty = currentRole === 'faculty';
    const isCOD = paymentMethod === 'COD' || paymentMethod.toLowerCase().includes('cash');

    // If paid via Campus Card, deduct from wallet
    if (paymentMethod === 'Campus Card') {
      const remainingBalance = Math.max(0, user.walletBalance - cartTotal);
      const updatedUser = {
        ...user,
        walletBalance: remainingBalance,
        recentOrdersCount: (user.recentOrdersCount || 0) + 1,
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }

    const nextTokenNum = isFaculty
      ? `F${101 + orders.length}`
      : customToken || `A${125 + orders.length}`;

    const newOrder = {
      order_id: `ORD-${1025 + orders.length}`,
      token_number: nextTokenNum,
      user_id: user.id,
      customer_name: user.name,
      student_id: isFaculty ? `FAC-${user.studentId}` : user.studentId,
      isFacultyOrder: isFaculty,
      items: [...cart],
      subtotal: cartSubtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      total_amount: cartTotal,
      pickup_time: pickupSlot?.time || (activeTimeOfDay === 'morning' ? '10:45 AM' : activeTimeOfDay === 'afternoon' ? '1:30 PM' : '8:15 PM'),
      payment_status: isCOD ? 'CASH ON DELIVERY (Pay at Counter)' : `PAID (${paymentMethod})`,
      isCOD,
      order_status: 'placed',
      counter: isFaculty ? 'Priority Faculty Lounge' : Math.random() > 0.5 ? 'Counter 2' : 'Counter 1',
      created_at: new Date().toISOString(),
      prep_time_min: Math.max(...cart.map(c => c.preparation_time || 8)),
      notes: orderNotes,
      queue_position: pendingQueueCount + 1,
    };

    setOrders(prev => [newOrder, ...prev]);
    syncOrderToFirestore(newOrder);
    clearCart();

    addNotification(
      '🎟️ Token Generated & Synced!',
      `Digital token #${newOrder.token_number} generated. ${isCOD ? 'Pay ₹' + cartTotal + ' in cash at counter.' : 'Paid successfully.'}`,
      'success'
    );
    return newOrder;
  };

  // Update order status (Staff / Kitchen action)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.order_id === orderId) {
          const updated = {
            ...order,
            order_status: newStatus,
            payment_status: newStatus === 'collected' && order.isCOD ? 'PAID (Cash at Counter)' : order.payment_status,
          };
          syncOrderToFirestore(updated);

          if (newStatus === 'ready') {
            playReadyBeep();
            addNotification(
              '🔔 Order Ready for Pickup!',
              `Token #${order.token_number} is freshly ready at ${order.counter}!`,
              'success'
            );
          } else if (newStatus === 'collected') {
            deductInventoryForOrder(order);
          }
          return updated;
        }
        return order;
      })
    );
  };

  // Menu CRUD with "Notify Available" push trigger
  const addMenuItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: `item_${Date.now()}`,
      rating: 4.8,
      rating_count: 1,
    };
    setMenuItems(prev => [newItem, ...prev]);
    syncMenuItemToFirestore(newItem);
    addNotification('Menu Updated', `"${newItem.name}" synced to Firebase.`, 'info');
  };

  const updateMenuItem = (itemId, updatedData) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          // If item became available, alert subscribed students
          if (item.availability === 'out_of_stock' && updatedData.availability === 'available') {
            if (notifySubscriptions.includes(itemId)) {
              addNotification('🎉 Item Back in Stock!', `"${item.name}" is now freshly available in the kitchen!`, 'success');
              setNotifySubscriptions(subs => subs.filter(id => id !== itemId));
            }
          }

          const updated = { ...item, ...updatedData };
          syncMenuItemToFirestore(updated);
          return updated;
        }
        return item;
      })
    );
    addNotification('Menu Updated', `Item modified successfully.`, 'info');
  };

  const deleteMenuItem = (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    addNotification('Item Removed', `Menu item deleted.`, 'warning');
  };

  // Inventory Management
  const restockInventoryItem = (invId, addQty = 10) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === invId) {
          const newQty = item.quantity + addQty;
          const updated = {
            ...item,
            quantity: newQty,
            alert: newQty <= item.minimum_stock,
            lastRestocked: 'Just now',
          };
          syncInventoryToFirestore(updated);
          return updated;
        }
        return item;
      })
    );
    addNotification('Restocked', `Inventory restocked successfully.`, 'success');
  };

  const addInventoryItem = (invData) => {
    const newItem = {
      ...invData,
      id: `inv_${Date.now()}`,
      lastRestocked: 'Just now',
      alert: invData.quantity <= invData.minimum_stock,
    };
    setInventory(prev => [...prev, newItem]);
    syncInventoryToFirestore(newItem);
    addNotification('Inventory Added', `New ingredient tracked: ${newItem.name}`, 'info');
  };

  // Feedback
  const addFeedback = ({ rating, food_rating, service_rating, comment, token }) => {
    const newFb = {
      feedback_id: `fb_${Date.now()}`,
      user_name: user.name,
      token: token || 'A125',
      rating,
      food_rating: food_rating || rating,
      service_rating: service_rating || rating,
      comment,
      time: 'Just now',
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
    };
    setFeedbacks(prev => [newFb, ...prev]);
    syncFeedbackToFirestore(newFb);
    addNotification('Feedback Submitted', 'Rating synced to Firebase database!', 'success');
  };

  // Compute Food Wastage Statistics for Admin Dashboard
  const foodWastageStats = computeFoodWastageStats(preparedBatches, orders);

  // Reset to seed demo state
  const resetDemoState = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    setInventory(INITIAL_INVENTORY);
    setOrders(INITIAL_ORDERS);
    setFeedbacks(INITIAL_FEEDBACKS);
    setUser(INITIAL_USER);
    setIsRushMode(false);
    setTimeOfDayOverride('auto');
    setCart([]);
    setAppliedCoupon(null);
    addNotification('Demo Data Reset', 'Canteen state reloaded with clean demo records.', 'info');
  };

  return (
    <CanteenContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        language,
        setLanguage,
        weather,
        setWeather,
        t,
        tItemName: (name) => tItemName(name, language),
        tItemDesc: (desc) => tItemDesc(desc, language),
        tCategoryName: (cat) => tCategoryName(cat, language),
        user,
        setUser,
        topUpWallet,
        menuItems,
        setMenuItems,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        inventory,
        restockInventoryItem,
        addInventoryItem,
        orders,
        activeStudentOrder,
        studentOrderHistory,
        placeOrder,
        reorderPreviousOrder,
        updateOrderStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartTotal,
        discountAmount,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        selectedPickupSlot,
        setSelectedPickupSlot,
        orderNotes,
        setOrderNotes,
        liveCrowd,
        isRushMode,
        setIsRushMode,
        timeOfDayOverride,
        setTimeOfDayOverride,
        activeTimeOfDay,
        notifySubscriptions,
        subscribeToItemAvailability,
        preparedBatches,
        setPreparedBatches,
        foodWastageStats,
        feedbacks,
        addFeedback,
        notifications,
        addNotification,
        resetDemoState,
        firebaseConnected,
        categories: INITIAL_CATEGORIES,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
}

export function useCanteen() {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
}
