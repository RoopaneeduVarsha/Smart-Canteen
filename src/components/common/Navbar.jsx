import React, { useState, useRef, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  ShoppingBag,
  Bell,
  Users,
  Clock,
  Sparkles,
  ChefHat,
  BarChart3,
  GraduationCap,
  BookOpen,
  ChevronDown,
  X,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Wallet,
  Check,
} from 'lucide-react';

export function Navbar({ onOpenCart, onOpenOrders }) {
  const {
    currentRole,
    setCurrentRole,
    language,
    setLanguage,
    t,
    user,
    cart,
    liveCrowd,
    notifications,
    activeStudentOrder,
  } = useCanteen();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleMenuRef = useRef(null);
  const langMenuRef = useRef(null);
  const notifsMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) setShowRoleMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) setShowLangMenu(false);
      if (notifsMenuRef.current && !notifsMenuRef.current.contains(e.target)) setShowNotifs(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const crowdStyles = {
    high: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      dot: 'bg-rose-400',
    },
    moderate: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-400',
    },
    low: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
    },
  };

  const currentCrowd = crowdStyles[liveCrowd.crowdLevel] || crowdStyles.low;

  const roles = [
    {
      id: 'student',
      title: t('student') || 'Student Portal',
      subtitle: 'Live menus, queue forecast & smart pre-ordering',
      icon: GraduationCap,
      color: 'from-amber-500 to-orange-500',
      tag: 'Campus Feed',
    },
    {
      id: 'faculty',
      title: t('faculty') || 'Faculty Lounge',
      subtitle: 'Priority express ordering & faculty thalis',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      tag: 'Priority Express',
    },
    {
      id: 'staff',
      title: t('staff') || 'Kitchen Staff',
      subtitle: 'Live token queue & 100-order batch sessions',
      icon: ChefHat,
      color: 'from-orange-500 to-rose-500',
      tag: 'Kitchen Ops',
    },
    {
      id: 'admin',
      title: t('admin') || 'Admin Analytics',
      subtitle: 'Food wastage tracker & revenue metrics',
      icon: BarChart3,
      color: 'from-teal-500 to-emerald-500',
      tag: 'Analytics & Waste',
    },
  ];

  const languages = [
    { code: 'en', label: 'English', short: 'ENG' },
    { code: 'hi', label: 'हिंदी', short: 'HIN' },
    { code: 'te', label: 'తెలుగు', short: 'TEL' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'KAN' },
  ];

  const currentRoleObj = roles.find((r) => r.id === currentRole) || roles[0];
  const currentLangObj = languages.find((l) => l.code === language) || languages[0];
  const CurrentRoleIcon = currentRoleObj.icon;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* 1. Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-xl font-bold text-slate-950 shrink-0">
              🍱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-white bg-clip-text text-transparent">
                  {t('brand_name')}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-full">
                  Smart Canteen
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* 2. Sleek Dashboard / Portal Switcher Dropdown (Replaces 4 bulky horizontal tabs) */}
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-sm"
              title="Switch Dashboard Portal"
            >
              <div className={`p-1 rounded-lg bg-gradient-to-br ${currentRoleObj.color} text-slate-950`}>
                <CurrentRoleIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-display font-bold text-xs sm:text-sm">
                {currentRoleObj.title}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Portal Selection Dropdown */}
            {showRoleMenu && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                    Switch Campus Portal
                  </span>
                </div>
                <div className="space-y-1">
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          setCurrentRole(r.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-3 ${
                          isActive
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl bg-gradient-to-br ${r.color} text-slate-950 shrink-0 mt-0.5 shadow-sm`}>
                            <Icon className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-display font-bold text-xs sm:text-sm text-slate-100">
                                {r.title}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">
                                {r.tag}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                              {r.subtitle}
                            </p>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Right Utility Actions (Clean, spaced, uncrowded) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Compact Live Crowd Indicator */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${currentCrowd.bg}`}
              title="Live Canteen Queue Status"
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentCrowd.dot}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentCrowd.dot}`}></span>
              </span>
              <span>{liveCrowd.badgeText}</span>
              <span className="text-slate-500 font-normal">•</span>
              <span className="text-slate-400 font-normal">~{liveCrowd.estimatedWaitMin}m</span>
            </div>

            {/* Active Token Pill Shortcut */}
            {(currentRole === 'student' || currentRole === 'faculty') && activeStudentOrder && (
              <button
                onClick={onOpenOrders}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all text-xs font-semibold animate-pulse"
                title="View Active Digital Token"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>#{activeStudentOrder.token_number}</span>
              </button>
            )}

            {/* Multi-Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentLangObj.short}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in">
                  <div className="space-y-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                          language === l.code
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{l.label}</span>
                        {language === l.code && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative" ref={notifsMenuRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-4 z-50 backdrop-blur-xl animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="font-display font-bold text-sm text-slate-200 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" /> Notifications
                    </h4>
                    <button
                      onClick={() => setShowNotifs(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex gap-3 items-start hover:border-slate-700 transition-all"
                      >
                        <div className="mt-0.5">
                          {n.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : n.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-200">{n.title}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button */}
            {(currentRole === 'student' || currentRole === 'faculty') && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">{t('cart')}</span>
                {totalCartItems > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-extrabold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            )}

            {/* Profile Avatar Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-amber-400/40 object-cover"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-200 leading-none">{user.name}</p>
                <p className="text-[10px] text-amber-400 font-medium capitalize mt-0.5">
                  {currentRole === 'faculty' ? 'Faculty' : currentRole === 'student' ? `₹${user.walletBalance}` : currentRole === 'staff' ? 'Kitchen Staff' : 'Admin'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
