import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { getHourlyCrowdForecast } from '../../services/aiPredictionEngine';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  DollarSign,
  Package,
  Award,
  Sparkles,
  Flame,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Leaf,
  Trash2,
  AlertTriangle,
  Zap,
  PlusCircle,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export function AdminDashboard() {
  const {
    orders,
    menuItems,
    inventory,
    feedbacks,
    isRushMode,
    foodWastageStats,
    preparedBatches,
    setPreparedBatches,
    addNotification,
    t,
  } = useCanteen();

  const [timeRange, setTimeRange] = useState('today'); // today | week | month
  const [activeWasteTab, setActiveWasteTab] = useState('overview'); // overview | log_batch
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCount, setNewBatchCount] = useState(50);
  const [newBatchCost, setNewBatchCost] = useState(30);
  const [newBatchPrice, setNewBatchPrice] = useState(70);
  const [newBatchExpiry, setNewBatchExpiry] = useState('05:00 PM');
  const [appliedHappyHours, setAppliedHappyHours] = useState([]);

  // Forecast data from AI Prediction Engine
  const hourlyForecast = getHourlyCrowdForecast(isRushMode);

  // Analytics Computations
  const totalSales = orders.reduce((sum, o) => o.order_status !== 'cancelled' ? sum + o.total_amount : sum, 0);
  const totalOrders = orders.length;
  const avgWaitTimeMin = (orders.reduce((sum, o) => sum + (o.prep_time_min || 8), 0) / Math.max(1, orders.length)).toFixed(1);
  const avgRating = (feedbacks.reduce((sum, f) => sum + f.rating, 0) / Math.max(1, feedbacks.length)).toFixed(1);

  // Calculate top selling items
  const itemSalesMap = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemSalesMap[item.name]) {
        itemSalesMap[item.name] = { count: 0, revenue: 0, item };
      }
      itemSalesMap[item.name].count += item.quantity;
      itemSalesMap[item.name].revenue += item.price * item.quantity;
    });
  });

  const topSellingItems = Object.values(itemSalesMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const positiveFeedbackCount = feedbacks.filter(f => f.sentiment === 'positive').length;
  const positivePercentage = Math.round((positiveFeedbackCount / Math.max(1, feedbacks.length)) * 100);

  // Handle logging new prepared batch
  const handleAddBatch = (e) => {
    e.preventDefault();
    if (!newBatchName) return;
    const newBatch = {
      id: `prep_${Date.now()}`,
      name: newBatchName,
      preparedPortions: Number(newBatchCount),
      costPerPortion: Number(newBatchCost),
      price: Number(newBatchPrice),
      expiryTime: newBatchExpiry,
    };
    setPreparedBatches(prev => [newBatch, ...prev]);
    addNotification('🌿 Prepared Batch Logged', `Logged ${newBatchCount} portions of ${newBatchName} into food wastage tracker.`, 'success');
    setNewBatchName('');
    setActiveWasteTab('overview');
  };

  // Trigger AI Happy Hour Flash Discount
  const triggerHappyHourDiscount = (itemName, remainingCount) => {
    setAppliedHappyHours(prev => [...prev, itemName]);
    addNotification(
      '⚡ AI Flash Deal Activated',
      `Applied 30% Surplus Flash Discount on ${remainingCount} remaining portions of "${itemName}" for student app!`,
      'success'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              📊 Executive Canteen Analytics
            </span>
            <span className="text-xs text-slate-400">
              AI Demand & Crowd Optimization
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100 mt-1">
            Campus Canteen Business Intelligence
          </h1>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              timeRange === 'today' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today (Live)
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              timeRange === 'week' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              timeRange === 'month' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semester
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Sales */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              ₹{totalSales}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold mt-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4% vs last week
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Orders Processed</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-100 font-display">
              {totalOrders}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              100% digital tokens
            </span>
          </div>
        </div>

        {/* Peak Rush Hour */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Rush Window</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-rose-400 font-display">
              12:30 - 1:30 PM
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              85+ peak student influx
            </span>
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Wait Time</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
              {avgWaitTimeMin}m
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" /> Reduced by 42%
            </span>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="col-span-2 sm:col-span-1 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Rating</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              {avgRating} / 5.0
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {feedbacks.length} student reviews
            </span>
          </div>
        </div>

      </div>

      {/* 3. 🌿 Food Wastage Reduction & Surplus Tracking Intelligence System */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Leaf className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
                  {t('food_wastage')}
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    Eco-AI Active
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time tracking of food prepared, sold, remaining surplus portions, and AI happy-hour redistribution algorithms.
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Tab */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveWasteTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeWasteTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Surplus Monitor
            </button>
            <button
              onClick={() => setActiveWasteTab('log_batch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeWasteTab === 'log_batch'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" /> Log Batch
            </button>
          </div>
        </div>

        {/* Wastage KPIs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{t('prepared')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-100 font-display">{foodWastageStats.totalPrepared}</span>
              <span className="text-xs text-slate-400">portions</span>
            </div>
            <span className="text-[10px] text-slate-500">₹{foodWastageStats.totalValuePrepared} total production</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">{t('sold')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-display">{foodWastageStats.totalSold}</span>
              <span className="text-xs text-slate-400">portions</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">₹{foodWastageStats.totalValueRecovered} recovered</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">{t('remaining')}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400 font-display">{foodWastageStats.totalRemainingSurplus}</span>
              <span className="text-xs text-slate-400">portions</span>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold">₹{foodWastageStats.potentialWasteLoss} cost at risk</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">Waste Prevention Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-300 font-display">{foodWastageStats.wasteReductionScore}%</span>
              <span className="text-xs text-emerald-400 font-bold">Optimal</span>
            </div>
            <span className="text-[10px] text-emerald-400/80">{t('waste_rate')}: only {foodWastageStats.overallWastageRate}%</span>
          </div>
        </div>

        {/* Tab 1: Overview & Active Prepared Batches Table */}
        {activeWasteTab === 'overview' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Prepared Food Batch</th>
                    <th className="p-3.5 text-center">Prepared</th>
                    <th className="p-3.5 text-center">Sold</th>
                    <th className="p-3.5 text-center">Remaining</th>
                    <th className="p-3.5 text-center">Expiry Target</th>
                    <th className="p-3.5 text-center">Status / Risk</th>
                    <th className="p-3.5 text-right">AI Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 font-medium">
                  {foodWastageStats.itemDetails.map((item) => {
                    const isHappyHourActive = appliedHappyHours.includes(item.name);
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-200">
                          {item.name}
                          <span className="text-[10px] text-slate-400 block font-normal">
                            Cost: ₹{item.costPerPortion} • Retail: ₹{item.price}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-slate-300">
                          {item.preparedPortions}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                          {item.soldPortions}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">
                          <span className={item.remainingPortions > 10 ? 'text-amber-400' : 'text-slate-300'}>
                            {item.remainingPortions}
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-slate-400 font-mono">
                          {item.expiryTime}
                        </td>
                        <td className="p-3.5 text-center">
                          {item.remainingPortions === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                              Sold Out (0% Waste)
                            </span>
                          ) : item.isAtRisk ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Surplus Alert ({item.wastePercent}%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Healthy Flow
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {item.remainingPortions > 5 ? (
                            <button
                              onClick={() => triggerHappyHourDiscount(item.name, item.remainingPortions)}
                              disabled={isHappyHourActive}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ml-auto ${
                                isHappyHourActive
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold shadow'
                              }`}
                            >
                              {isHappyHourActive ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Flash Deal On
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3 h-3" /> 30% Flash Sale
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">Auto-Optimized</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* AI Redistribution Alerts Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI Automated Food Surplus Redistribution Recommendations</span>
              </div>
              <div className="space-y-1.5">
                {foodWastageStats.redistributionAlerts.length === 0 ? (
                  <p className="text-xs text-slate-400">All prepared batches are in high demand with zero projected waste today!</p>
                ) : (
                  foodWastageStats.redistributionAlerts.map((alert, i) => (
                    <p key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {alert.recommendation}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Log New Batch Form */}
        {activeWasteTab === 'log_batch' && (
          <form onSubmit={handleAddBatch} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 max-w-xl">
            <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Log Newly Cooked Food Batch for Surplus Tracking
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Dish / Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Veg Pulao Combo"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Portions Prepared</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBatchCount}
                  onChange={(e) => setNewBatchCount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cost Per Portion (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBatchCost}
                  onChange={(e) => setNewBatchCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Retail Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newBatchPrice}
                  onChange={(e) => setNewBatchPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1 font-semibold">Target Fresh Expiry Window</label>
                <input
                  type="text"
                  placeholder="e.g. 04:30 PM"
                  value={newBatchExpiry}
                  onChange={(e) => setNewBatchExpiry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveWasteTab('overview')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg"
              >
                Save Prepared Batch
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 4. AI Crowd Prediction & Hourly Rush Influx Visualizer */}
      <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-lg text-slate-100">
                AI Rush-Hour & Crowd Prediction Curves
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Machine learning time-series model predicting student influx & counter waiting times across campus schedules.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical Rush (&gt;60)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (25-60)
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;25)
            </span>
          </div>
        </div>

        {/* Dynamic Chart Bars Container */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 items-end h-64 border-b border-slate-800 pb-2">
            {hourlyForecast.map((slot, idx) => {
              const heightPercent = Math.min(100, Math.max(15, (slot.crowd / 90) * 100));
              const isPeak = slot.status === 'high';
              const isMod = slot.status === 'moderate';

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-slate-950 border border-slate-700 text-[10px] text-slate-200 px-2.5 py-1 rounded-xl shadow-xl whitespace-nowrap">
                    <p className="font-bold text-amber-400">{slot.time}</p>
                    <p>{slot.crowd} students • ~{slot.waitMin}m wait</p>
                    {slot.tag && <p className="text-rose-400 font-semibold">{slot.tag}</p>}
                  </div>

                  {/* Optional Break Tag Badge */}
                  {slot.tag && (
                    <span className="text-[9px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-md mb-1.5 text-center hidden lg:inline-block truncate max-w-[80px]">
                      {slot.tag}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125 relative overflow-hidden ${
                      isPeak
                        ? 'bg-gradient-to-t from-rose-600 via-orange-500 to-amber-400 shadow-lg shadow-rose-500/20'
                        : isMod
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                    }`}
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Time label */}
                  <span className="text-[10px] text-slate-400 font-mono mt-2 group-hover:text-slate-200 truncate max-w-full">
                    {slot.time.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insight Summary footer */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400">💡 AI Optimization Recommendation:</span>
            <span>Shift 35% of lunch pre-orders into 1:35 PM - 1:50 PM window to eliminate counter queues completely.</span>
          </div>
          <span className="text-emerald-400 font-bold font-mono">Load Distribution: 92% Efficient</span>
        </div>
      </section>

      {/* 5. Top Selling Items & Feedback Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Food Items Leaderboard */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-display font-bold text-base text-slate-100">
                Top Selling Food Items
              </h3>
            </div>
            <span className="text-xs text-slate-400">Ranked by volume</span>
          </div>

          <div className="space-y-3">
            {topSellingItems.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No orders processed yet</p>
            ) : (
              topSellingItems.map((entry, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold">{medals[idx] || `#${idx + 1}`}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">{entry.item.name}</h4>
                        <span className="text-[11px] text-slate-400">{entry.count} portions sold</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-400 font-display text-sm">
                        ₹{entry.revenue}
                      </span>
                      <span className="text-[10px] text-slate-500 block">revenue</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Student Feedback & Sentiment Analysis */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-base text-slate-100">
                Student Feedback & Sentiment
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {positivePercentage}% Positive Sentiment
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {feedbacks.map(fb => (
              <div
                key={fb.feedback_id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{fb.user_name}</span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                      Token #{fb.token}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{fb.rating}.0</span>
                  </div>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  "{fb.comment}"
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Food: {fb.food_rating}★ • Pickup Speed: {fb.service_rating}★</span>
                  <span>{fb.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

