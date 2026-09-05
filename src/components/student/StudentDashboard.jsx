import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { FoodCard } from './FoodCard';
import { FreshersGuide } from '../common/FreshersGuide';
import { getPersonalizedRecommendations } from '../../services/recommendationEngine';
import { getWeatherRecommendedItems, CLIMATE_TYPES } from '../../services/weatherService';
import {
  Users,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Tag,
  ArrowRight,
  Wallet,
  Plus,
  RotateCcw,
  Sun,
  Sunrise,
  Moon,
  Receipt,
  ShoppingBag,
  History,
  CloudSun,
  Gift,
  BookOpen,
} from 'lucide-react';

export function StudentDashboard({ onOpenCart, onOpenTracking, onOpenSlotModal, onOpenFeedback }) {
  const {
    currentRole,
    user,
    topUpWallet,
    menuItems,
    categories,
    liveCrowd,
    isRushMode,
    weather,
    setWeather,
    activeStudentOrder,
    studentOrderHistory,
    reorderPreviousOrder,
    timeOfDayOverride,
    setTimeOfDayOverride,
    activeTimeOfDay,
    cart,
    t,
  } = useCanteen();

  const isFaculty = currentRole === 'faculty';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietarySelection, setDietarySelection] = useState('all'); // 'all' | 'veg' | 'non_veg'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // all | available | few_left
  const [sortBy, setSortBy] = useState('popular'); // popular | price_low | price_high | rating
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Dynamic Greeting based on time of day and selected language
  const timeGreeting = useMemo(() => {
    const prefix = isFaculty ? `Prof. ${user.name.split(' ')[0]}` : user.name.split(' ')[0];
    if (activeTimeOfDay === 'morning') {
      return {
        title: `${t('good_morning')}, ${prefix}!`,
        icon: Sunrise,
        badge: t('morning_badge'),
        subtitle: isFaculty ? t('faculty_morning_sub') : t('morning_subtitle'),
      };
    } else if (activeTimeOfDay === 'afternoon') {
      return {
        title: `${t('good_afternoon')}, ${prefix}!`,
        icon: Sun,
        badge: t('lunch_badge'),
        subtitle: isFaculty ? t('faculty_lunch_sub') : t('lunch_subtitle'),
      };
    } else {
      return {
        title: `${t('good_evening')}, ${prefix}!`,
        icon: Moon,
        badge: t('dinner_badge'),
        subtitle: t('dinner_subtitle'),
      };
    }
  }, [activeTimeOfDay, user.name, isFaculty, t]);

  // AI Personalized Recommendations according to time of day
  const aiRecommendations = useMemo(() => {
    return getPersonalizedRecommendations(menuItems, user, activeTimeOfDay);
  }, [menuItems, user, activeTimeOfDay]);

  // Weather/Climate Recommendations
  const weatherRecommendations = useMemo(() => {
    return getWeatherRecommendedItems(menuItems, weather);
  }, [menuItems, weather]);

  const currentClimateObj = CLIMATE_TYPES.find(c => c.id === weather) || CLIMATE_TYPES[0];

  // Filtered & Sorted Menu Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query (matches English and Localized names & descriptions)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const trName = t(item.name).toLowerCase();
        const trDesc = t(item.description).toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query) || trName.includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query) || trDesc.includes(query);
        const matchesCat = item.category.toLowerCase().includes(query) || t(item.category).toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      // Dietary Side-by-Side filter
      if (dietarySelection === 'veg' && !item.isVeg) {
        return false;
      }
      if (dietarySelection === 'non_veg' && item.isVeg) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'available' && item.availability === 'out_of_stock') {
        return false;
      }
      if (availabilityFilter === 'few_left' && item.availability !== 'few_left') {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });
  }, [menuItems, selectedCategory, searchQuery, dietarySelection, availabilityFilter, sortBy, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Student / Faculty Hero Welcome & Live Crowd Overview */}
      <section className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/50 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Greeting & Time Badge */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                {isFaculty ? t('faculty_lounge') : timeGreeting.badge}
              </span>

              {/* Time of Day Simulation Switcher */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-[11px]">
                <span className="text-slate-500 px-1">{t('meal_time')}:</span>
                <button
                  onClick={() => setTimeOfDayOverride('morning')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    activeTimeOfDay === 'morning' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('morning')}
                </button>
                <button
                  onClick={() => setTimeOfDayOverride('afternoon')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    activeTimeOfDay === 'afternoon' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('afternoon')}
                </button>
                <button
                  onClick={() => setTimeOfDayOverride('night')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    activeTimeOfDay === 'night' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t('night')}
                </button>
                <button
                  onClick={() => setTimeOfDayOverride('auto')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] ${
                    timeOfDayOverride === 'auto' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Follow real device clock"
                >
                  {t('auto_clock')}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-100 tracking-tight">
              {timeGreeting.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              {isFaculty ? t('faculty_lounge_desc') : timeGreeting.subtitle}
            </p>
          </div>

          {/* Canteen Status Metrics + Live Wallet Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            
            {/* Live Wallet Balance Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" /> {t('campus_wallet')}
                </span>
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30"
                  title="Recharge wallet"
                >
                  {t('top_up')}
                </button>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-400 font-display">
                  ₹{user.walletBalance}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Instant 1-tap card payment
                </p>
              </div>
            </div>

            {/* Live Crowd Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t('live_crowd')}</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
              </div>
              <div className="mt-2">
                <span className={`text-base font-extrabold font-display ${
                  liveCrowd.crowdLevel === 'high' ? 'text-rose-400' : liveCrowd.crowdLevel === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {liveCrowd.badgeText}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {liveCrowd.peopleCount} {t('waiting')}
                </p>
              </div>
            </div>

            {/* Active Token Pill */}
            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">{t('active_token')}</span>
              <div className="mt-1">
                {activeStudentOrder ? (
                  <button
                    onClick={() => onOpenTracking(activeStudentOrder)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <div>
                      <span className="text-base font-extrabold text-amber-300 font-display">
                        #{activeStudentOrder.token_number}
                      </span>
                      <p className="text-[10px] text-slate-300 capitalize font-medium">
                        {activeStudentOrder.order_status} • {activeStudentOrder.counter}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 block mt-1">
                    {t('no_active_tokens')}
                  </span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* 2. Differentiator Banner: AI Rush-Hour Prediction & Smart Pickup Suggestion */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/50 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-extrabold text-sm text-indigo-200">
                  {t('smart_pickup_banner')}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-400/20 text-indigo-300 uppercase">
                  {t('ai_accuracy')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isRushMode 
                  ? t('peak_rush_alert')
                  : activeTimeOfDay === 'morning'
                  ? t('morning_rush_alert')
                  : activeTimeOfDay === 'afternoon'
                  ? t('afternoon_rush_alert')
                  : t('dinner_rush_alert')}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (cart.length > 0) {
                onOpenSlotModal();
              } else {
                onOpenCart();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 shrink-0"
          >
            <span>{cart.length > 0 ? t('review_slots') : t('order_recommended_slot')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* 2.5 Freshers Guide & Campus Navigation Map */}
      <section>
        <FreshersGuide />
      </section>

      {/* 3. ⭐ CLIMATE & WEATHER FOOD SPECIALS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base sm:text-lg text-slate-100">
                  {t('weather_special')}
                </h2>
                <span className="text-xs font-mono text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full font-bold">
                  {currentClimateObj.label} • {currentClimateObj.temp}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('weather_subtitle')}
              </p>
            </div>
          </div>

          {/* Inline Campus Climate Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            {CLIMATE_TYPES.map((c) => (
              <button
                key={c.id}
                onClick={() => setWeather(c.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  weather === c.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={c.note}
              >
                <span>{c.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {weatherRecommendations.map(item => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2.5 left-4 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-extrabold text-[9px] shadow uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 fill-white" />
                {item.weatherReason}
              </div>
              <FoodCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. AI Personalized Food Recommendations Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-100">
                {t('recommended_for_you')} ({activeTimeOfDay.toUpperCase()} SPECIALS)
              </h2>
              <p className="text-xs text-slate-400">
                AI personalized matches based on your {user.dietaryPreference} preference & campus popularity
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiRecommendations.map(item => (
            <div key={item.id} className="relative">
              <div className="absolute -top-2.5 left-4 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-[9px] shadow uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                {item.aiReason}
              </div>
              <FoodCard item={item} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Digital Menu Section with Full Search & Side-by-Side Dietary Filters */}
      <section className="space-y-5 pt-4">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-xl text-slate-100">
              {t('digital_menu')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('menu_subtitle')}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {t(cat.name)}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar: SIDE-BY-SIDE VEG & NON-VEG FILTERS */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Side-by-Side Dietary Button Group */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDietarySelection('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                dietarySelection === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('all_diet')}
            </button>

            <button
              onClick={() => setDietarySelection('veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                dietarySelection === 'veg'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></div>
              <span>{t('veg_only')}</span>
            </button>

            <button
              onClick={() => setDietarySelection('non_veg')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                dietarySelection === 'non_veg'
                  ? 'bg-rose-500 text-slate-950 shadow'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"></div>
              <span>{t('non_veg_only')}</span>
            </button>
          </div>

          {/* Availability & Sort Filters */}
          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Availability</option>
              <option value="available">In Stock Only</option>
              <option value="few_left">Few Left Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="popular">Campus Popularity</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated (⭐)</option>
            </select>
          </div>

        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <p className="text-3xl">🔍</p>
            <h3 className="font-display font-bold text-slate-200">No food items found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms, category filters, or dietary toggles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredItems.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </section>

      {/* 6. ⭐ DEDICATED PREVIOUS ORDERS / ORDER HISTORY SECTION */}
      <section className="space-y-4 pt-6 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl text-slate-100">
                {t('previous_orders')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('prev_orders_subtitle')}
              </p>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {studentOrderHistory.length} {t('orders_recorded')}
          </span>
        </div>

        {studentOrderHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
            No previous orders found. Place your first order to see history here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentOrderHistory.map(order => {
              const isCollected = order.order_status === 'collected';
              const isReady = order.order_status === 'ready';

              return (
                <div
                  key={order.order_id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-display font-black text-2xl text-amber-400 block">
                          #{order.token_number}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {order.order_id} • {order.pickup_time}
                        </span>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        isCollected
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : isReady
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {order.order_status}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-300">
                          <span>{item.quantity} × {t(item.name)}</span>
                          <span className="text-slate-400 font-mono font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Payment & Counter Info */}
                    <div className="flex items-center justify-between text-xs pt-3 text-slate-400">
                      <span>{t('paid_via')} {order.payment_status}</span>
                      <span className="font-bold text-slate-100 font-display text-base">
                        ₹{order.total_amount}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => reorderPreviousOrder(order)}
                      className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('reorder')}</span>
                    </button>

                    <button
                      onClick={() => onOpenTracking(order)}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>{t('view_token')}</span>
                    </button>

                    <button
                      onClick={() => onOpenFeedback && onOpenFeedback(order)}
                      className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{t('rate_order')}</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Wallet Recharge Top-Up Modal */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-display font-bold text-base text-slate-100">
                  {t('recharge')}
                </h3>
              </div>
              <button onClick={() => setShowRechargeModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">{t('current_balance')}</span>
              <span className="text-3xl font-black text-emerald-400 font-display">
                ₹{user.walletBalance}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                {t('select_recharge')}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => {
                      topUpWallet(amt);
                      setShowRechargeModal(false);
                    }}
                    className="py-2.5 rounded-xl bg-slate-950 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 font-bold text-xs transition-all"
                  >
                    + ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                topUpWallet(250);
                setShowRechargeModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md"
            >
              {t('add_via_upi')} (₹250)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

