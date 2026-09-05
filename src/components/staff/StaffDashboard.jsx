import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Flame,
  Bell,
  Utensils,
  MapPin,
  RefreshCw,
  X,
  Sparkles,
  Banknote,
  Timer,
  Play,
} from 'lucide-react';

export function StaffDashboard() {
  const {
    orders,
    updateOrderStatus,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    inventory,
    restockInventoryItem,
    addInventoryItem,
    categories,
    isRushMode,
    t,
  } = useCanteen();

  const [activeTab, setActiveTab] = useState('kanban'); // kanban | batches | menu | inventory
  const [menuSearch, setMenuSearch] = useState('');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddInvModal, setShowAddInvModal] = useState(false);

  // Form states for Add/Edit Menu Item
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'snacks',
    price: 60,
    preparation_time: 8,
    isVeg: true,
    availability: 'available',
    description: '',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
  });

  // Form state for Add Inventory
  const [invFormData, setInvFormData] = useState({
    name: '',
    quantity: 20,
    minimum_stock: 10,
    unit: 'pcs',
    category: 'Bakery',
  });

  // KPI Calculations
  const incomingOrders = orders.filter(o => o.order_status === 'placed');
  const preparingOrders = orders.filter(o => o.order_status === 'accepted' || o.order_status === 'preparing');
  const readyOrders = orders.filter(o => o.order_status === 'ready');
  const completedOrders = orders.filter(o => o.order_status === 'collected');
  const totalRevenue = orders.reduce((sum, o) => o.order_status !== 'cancelled' ? sum + o.total_amount : sum, 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.minimum_stock);

  // Smart Kitchen Batching Sessions calculation
  const kitchenBatchSessions = useMemo(() => {
    const activeOrdersList = orders.filter(o => o.order_status !== 'collected' && o.order_status !== 'cancelled');
    const totalCount = Math.max(activeOrdersList.length, 12);

    // Cluster into 3 smart timed preparation sessions
    const batch1Orders = activeOrdersList.slice(0, 5);
    const batch2Orders = activeOrdersList.slice(5, 12);
    const batch3Orders = activeOrdersList.slice(12);

    return [
      {
        id: 'session_1',
        title: 'Batch Session 1 (Priority Rush)',
        targetCount: 30,
        activeOrders: batch1Orders,
        targetDuration: '15 mins',
        timeWindow: '12:30 PM - 12:45 PM',
        status: 'In Progress',
        progress: 80,
        color: 'emerald',
      },
      {
        id: 'session_2',
        title: 'Batch Session 2 (Peak Surge)',
        targetCount: 40,
        activeOrders: batch2Orders,
        targetDuration: '20 mins',
        timeWindow: '12:45 PM - 1:05 PM',
        status: 'Queued',
        progress: 35,
        color: 'amber',
      },
      {
        id: 'session_3',
        title: 'Batch Session 3 (Post-Peak Clearance)',
        targetCount: 30,
        activeOrders: batch3Orders,
        targetDuration: '20 mins',
        timeWindow: '1:05 PM - 1:25 PM',
        status: 'Scheduled',
        progress: 10,
        color: 'indigo',
      },
    ];
  }, [orders]);

  // Save Menu Item
  const handleSaveMenu = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateMenuItem(editingItem.id, menuFormData);
      setEditingItem(null);
    } else {
      addMenuItem(menuFormData);
    }
    setShowAddMenuModal(false);
    setMenuFormData({
      name: '',
      category: 'snacks',
      price: 60,
      preparation_time: 8,
      isVeg: true,
      availability: 'available',
      description: '',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    });
  };

  // Save Inventory
  const handleSaveInventory = (e) => {
    e.preventDefault();
    addInventoryItem(invFormData);
    setShowAddInvModal(false);
    setInvFormData({
      name: '',
      quantity: 20,
      minimum_stock: 10,
      unit: 'pcs',
      category: 'Bakery',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Header & KPI Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              👨‍🍳 Canteen Kitchen Operations
            </span>
            {isRushMode && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                🔥 High Rush Mode Active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 mt-1">
            Staff & Kitchen Management Dashboard
          </h1>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'kanban'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Queue ({orders.filter(o => o.order_status !== 'collected').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('batches')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'batches'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>Batch Sessions (3)</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Menu Items ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory ({inventory.length})</span>
            {lowStockItems.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                {lowStockItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Orders</span>
          <span className="text-xl font-extrabold text-slate-100 font-display block mt-1">
            {orders.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-indigo-400">Incoming</span>
          <span className="text-xl font-extrabold text-indigo-300 font-display block mt-1">
            {incomingOrders.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-amber-400">Preparing</span>
          <span className="text-xl font-extrabold text-amber-300 font-display block mt-1">
            {preparingOrders.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-emerald-400">Ready at Counter</span>
          <span className="text-xl font-extrabold text-emerald-300 font-display block mt-1">
            {readyOrders.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Today's Revenue</span>
          <span className="text-xl font-extrabold text-amber-400 font-display block mt-1">
            ₹{totalRevenue}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-rose-400">Low Stock Alerts</span>
          <span className={`text-xl font-extrabold font-display block mt-1 ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {lowStockItems.length} items
          </span>
        </div>
      </div>

      {/* 2. TAB 1: Live Kitchen Order Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Column 1: Incoming / Placed */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
              <span className="font-display font-bold text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Incoming Orders ({incomingOrders.length})
              </span>
            </div>

            <div className="space-y-3">
              {incomingOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  No new incoming orders
                </div>
              ) : (
                incomingOrders.map(order => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-xl text-amber-400">
                        #{order.token_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
                        {order.counter}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-200">{order.customer_name} ({order.student_id})</p>
                      <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Pickup Target: <strong className="text-slate-200">{order.pickup_time}</strong>
                      </p>
                    </div>

                    {/* COD Banner Alert */}
                    {order.isCOD && (
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        <span>⚠️ Collect ₹{order.total_amount} Cash at Counter</span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{i.quantity} × {t(i.name)}</span>
                          <span className="text-slate-500 font-mono">₹{i.price * i.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                        className="py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                        className="py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
                      >
                        Accept & Cook
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Preparing in Kitchen */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
              <span className="font-display font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-2">
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                Preparing in Kitchen ({preparingOrders.length})
              </span>
            </div>

            <div className="space-y-3">
              {preparingOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  Kitchen queue clear
                </div>
              ) : (
                preparingOrders.map(order => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-lg relative overflow-hidden">
                    
                    {/* Top pulse line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 animate-pulse"></div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-display font-black text-xl text-amber-400">
                        #{order.token_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        On Grill ({order.counter})
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-200">{order.customer_name}</p>
                      <p className="text-slate-400 text-[11px]">
                        Pickup: <strong className="text-amber-400">{order.pickup_time}</strong>
                      </p>
                    </div>

                    {order.isCOD && (
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        <span>⚠️ Collect ₹{order.total_amount} Cash at Counter</span>
                      </div>
                    )}

                    {/* Checklist */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{i.quantity} × {t(i.name)}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'ready')}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Mark Ready for Pickup</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Ready at Counter */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <span className="font-display font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                Ready at Counter ({readyOrders.length})
              </span>
            </div>

            <div className="space-y-3">
              {readyOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  No orders waiting at counter
                </div>
              ) : (
                readyOrders.map(order => (
                  <div key={order.order_id} className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-black text-2xl text-emerald-400">
                        #{order.token_number}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold">
                        {order.counter}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-slate-200">{order.customer_name}</p>
                      <p className="text-slate-400 text-[11px]">
                        {order.items.length} items • {order.payment_status}
                      </p>
                    </div>

                    {order.isCOD && (
                      <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] text-amber-300 font-bold flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5 text-amber-400" />
                        <span>💵 Collect ₹{order.total_amount} Cash Now</span>
                      </div>
                    )}

                    <button
                      onClick={() => updateOrderStatus(order.order_id, 'collected')}
                      className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{order.isCOD ? 'Cash Collected & Handover' : 'Student Collected'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Completed Today */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider">
                Completed ({completedOrders.length})
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {completedOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                  No completed orders yet
                </div>
              ) : (
                completedOrders.map(order => (
                  <div key={order.order_id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between text-slate-400">
                    <div>
                      <span className="font-bold text-slate-300 block font-display">#{order.token_number} - {order.customer_name}</span>
                      <span className="text-[10px] text-slate-500">{order.items.map(i => t(i.name)).join(', ')}</span>
                    </div>
                    <span className="font-bold text-emerald-400 font-display text-sm">₹{order.total_amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ⭐ TAB 2: SMART KITCHEN TIME SESSIONS & BATCHING PLANNER */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-100">
                  Kitchen Batch Preparation Sessions (100 Orders Distribution)
                </h3>
                <p className="text-xs text-slate-400">
                  Automated load planner: Groups large order influxes into 15–20 minute kitchen batches to prevent kitchen bottlenecks.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {kitchenBatchSessions.map(batch => (
              <div
                key={batch.id}
                className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-400 block font-mono">{batch.timeWindow}</span>
                      <h4 className="font-display font-extrabold text-base text-slate-100 mt-0.5">{batch.title}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      ⏱️ {batch.targetDuration}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Target Capacity:</span>
                      <span className="font-bold text-amber-400">{batch.targetCount} Orders</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Session Status:</span>
                      <span className="font-bold text-emerald-400">{batch.status}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        style={{ width: `${batch.progress}%` }}
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all"
                      ></div>
                    </div>
                  </div>

                  {/* Active Orders in this Batch */}
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase">Allocated Queue Tokens</span>
                    {batch.activeOrders.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic">No pending orders in this slot</p>
                    ) : (
                      batch.activeOrders.map(o => (
                        <div key={o.order_id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-amber-300">Token #{o.token_number}</span>
                          <span className="text-slate-400">{o.items.map(i => i.name).join(', ')}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-semibold">{o.order_status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    batch.activeOrders.forEach(o => updateOrderStatus(o.order_id, 'ready'));
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Mark Entire Batch Ready ({batch.activeOrders.length} Orders)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB 3: Menu Management (CRUD) */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Filter menu items..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => {
                setEditingItem(null);
                setMenuFormData({
                  name: '',
                  category: 'snacks',
                  price: 60,
                  preparation_time: 8,
                  isVeg: true,
                  availability: 'available',
                  description: '',
                  image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
                });
                setShowAddMenuModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Food Item</span>
            </button>
          </div>

          {/* Menu Items Table */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Prep Time</th>
                    <th className="p-4">Stock Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {menuItems
                    .filter(i => i.name.toLowerCase().includes(menuSearch.toLowerCase()) || t(i.name).toLowerCase().includes(menuSearch.toLowerCase()))
                    .map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-100">{t(item.name)}</p>
                            <span className="text-[10px] text-slate-500">{item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 capitalize">
                            {t(item.category)}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-400 font-display text-sm">₹{item.price}</td>
                        <td className="p-4 text-slate-300">{item.preparation_time} mins</td>
                        <td className="p-4">
                          <select
                            value={item.availability}
                            onChange={(e) => updateMenuItem(item.id, { availability: e.target.value })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none ${
                              item.availability === 'available'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : item.availability === 'few_left'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            <option value="available">🟢 In Stock</option>
                            <option value="few_left">🟡 Few Left</option>
                            <option value="out_of_stock">🔴 Out of Stock</option>
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setMenuFormData(item);
                              setShowAddMenuModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 4: Inventory & Ingredients */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-100">
                Automated Inventory Tracking & Auto-Deduction
              </h3>
              <p className="text-xs text-slate-400">
                Stock automatically decrements as orders are collected at counter.
              </p>
            </div>

            <button
              onClick={() => setShowAddInvModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Track New Ingredient</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map(inv => {
              const isLow = inv.quantity <= inv.minimum_stock;
              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isLow
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-500/5'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{inv.name}</h4>
                      <span className="text-[10px] text-slate-400 block">{inv.category} • Min: {inv.minimum_stock} {inv.unit}</span>
                    </div>

                    {isLow && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-bold uppercase">
                        ⚠️ Low Stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className={`text-2xl font-black font-display ${isLow ? 'text-rose-400' : 'text-slate-100'}`}>
                        {inv.quantity}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{inv.unit} remaining</span>
                    </div>

                    <button
                      onClick={() => restockInventoryItem(inv.id, 10)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition-colors"
                    >
                      +10 Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-100">
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </h3>
              <button onClick={() => setShowAddMenuModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  placeholder="e.g. Masala Dosa Special"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 capitalize"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({ ...menuFormData, price: +e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={menuFormData.preparation_time}
                    onChange={(e) => setMenuFormData({ ...menuFormData, preparation_time: +e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Type</label>
                  <select
                    value={menuFormData.isVeg ? 'veg' : 'non_veg'}
                    onChange={(e) => setMenuFormData({ ...menuFormData, isVeg: e.target.value === 'veg' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="veg">🟢 Pure Veg</option>
                    <option value="non_veg">🔴 Non-Veg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={menuFormData.image}
                  onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={menuFormData.description}
                  onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  placeholder="Short description of the food item..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md mt-2"
              >
                {editingItem ? 'Save Item Changes' : 'Create Food Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showAddInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-100">Add Ingredient</h3>
              <button onClick={() => setShowAddInvModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInventory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={invFormData.name}
                  onChange={(e) => setInvFormData({ ...invFormData, name: e.target.value })}
                  placeholder="e.g. Cheese Slices"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Initial Qty</label>
                  <input
                    type="number"
                    required
                    value={invFormData.quantity}
                    onChange={(e) => setInvFormData({ ...invFormData, quantity: +e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={invFormData.unit}
                    onChange={(e) => setInvFormData({ ...invFormData, unit: e.target.value })}
                    placeholder="pcs / kg / L"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md mt-2"
              >
                Track Ingredient
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
