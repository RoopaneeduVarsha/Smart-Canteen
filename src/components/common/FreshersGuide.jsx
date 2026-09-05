import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  HelpCircle,
  Compass,
  Sparkles,
  ShoppingBag,
  CreditCard,
  QrCode,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Globe,
  Wallet,
  Utensils,
  History,
  Leaf,
  Layers,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';

export function FreshersGuide() {
  const { t, currentRole } = useCanteen();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' | 'map' | 'tips'

  const isFaculty = currentRole === 'faculty';

  const steps = [
    {
      num: '01',
      title: t('guide_step1_title') || 'Check Live Crowd & Rush',
      desc: t('guide_step1_desc') || 'Look at the top Live Crowd metric to see current queue levels and avoid peak cafeteria rush hours.',
      icon: Users,
      badge: 'Live Forecast',
      color: 'from-amber-500 to-orange-500',
    },
    {
      num: '02',
      title: t('guide_step2_title') || 'Filter Veg / Non-Veg & Meal Time',
      desc: t('guide_step2_desc') || 'Use the 🟢 Pure Veg or 🔴 Non-Veg side-by-side buttons. Switch time between Morning, Lunch, and Night specials.',
      icon: Utensils,
      badge: 'Dietary Filters',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      num: '03',
      title: t('guide_step3_title') || 'Smart Add-Ons & Occasion Coupons',
      desc: t('guide_step3_desc') || 'Add meals to cart, pair companion drinks/sides, and apply coupon codes like BIRTHDAY50 or CAMPUSFEST.',
      icon: ShoppingBag,
      badge: 'Savings & Combos',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      num: '04',
      title: t('guide_step4_title') || 'Pick AI Smart Pickup Slot & Pay',
      desc: t('guide_step4_desc') || 'Select AI recommended pickup time. Pay via Campus Meal Card, UPI QR, Card, or Cash on Delivery (Pay at Counter).',
      icon: CreditCard,
      badge: 'Zero Queue Wait',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      num: '05',
      title: t('guide_step5_title') || 'Track Digital Token & Collect',
      desc: t('guide_step5_desc') || 'Get your instant Digital Token. When status turns "Ready for Pickup", collect from your assigned counter!',
      icon: QrCode,
      badge: 'Instant Token',
      color: 'from-rose-500 to-pink-500',
    },
  ];

  const appMap = [
    {
      title: isFaculty ? '👩‍🏫 Faculty Priority Lounge' : '🎓 Student / Faculty Portal',
      location: 'Main Dashboard (Homepage)',
      desc: 'Browse digital menus, view weather specials, check wallet balance, and track live canteen queue.',
      icon: Compass,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    {
      title: '🌐 Multi-Language Selector',
      location: 'Top Navigation Bar (Right)',
      desc: 'Switch between English, हिंदी (Hindi), తెలుగు (Telugu), and ಕನ್ನಡ (Kannada) anytime in real time.',
      icon: Globe,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    },
    {
      title: '💳 Campus Wallet Top-Up',
      location: 'Header & Dashboard Banner',
      desc: 'Click "+ Top Up" to add balance instantly with Mock UPI for 1-tap rapid checkouts.',
      icon: Wallet,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    {
      title: '📜 Previous Orders & Reorder',
      location: 'Bottom of Homepage Feed',
      desc: 'View old digital tokens, reorder your favorite meals in 1-click, and submit chef feedback.',
      icon: History,
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    },
    {
      title: '👨‍🍳 Kitchen Staff Dashboard',
      location: 'Role Switcher in Header',
      desc: 'Kitchen staff manages live incoming orders, 100-order batch preparation sessions, and stock restocks.',
      icon: Utensils,
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    },
    {
      title: '🌿 Admin & Food Waste Analytics',
      location: 'Role Switcher in Header',
      desc: 'Campus supervisors track food prepared vs sold, prevent food wastage, and trigger happy-hour deals.',
      icon: Leaf,
      color: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
    },
  ];

  const quickTips = [
    {
      tip: 'Pre-order 15 mins before break bell',
      detail: 'Avoid the 1:00 PM rush by scheduling your pickup slot for 1:15 PM.',
    },
    {
      tip: 'Turn on "Notify When Ready"',
      detail: 'If your favorite dish is sold out, tap the bell icon to get notified when freshly cooked.',
    },
    {
      tip: 'Cash on Delivery Available',
      detail: 'Don\'t have online balance? Choose "Cash on Delivery" and pay at the pickup counter.',
    },
    {
      tip: 'Climate-Adapted Specials',
      detail: 'Toggle between Monsoon Rainy, Sunny, and Winter to see AI-recommended hot or chilled foods.',
    },
  ];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden transition-all duration-300">
      
      {/* Header Bar */}
      <div className="p-5 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-black text-base sm:text-lg text-slate-100">
                {t('guide_title') || "Campus Fresher's Guide & App Navigation Map"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wide">
                {t('guide_badge') || 'New Student & Faculty Guide'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('guide_subtitle') || 'Learn how to skip long canteen queues, schedule smart pickups, and discover all features.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tabs */}
          {isExpanded && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('steps')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'steps'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('guide_tab_steps') || '5-Step Flow'}
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'map'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('guide_tab_map') || 'App Feature Map'}
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'tips'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('guide_tab_tips') || 'Pro Tips'}
              </button>
            </div>
          )}

          {/* Minimize / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold"
            title={isExpanded ? 'Collapse Guide' : 'Expand Guide'}
          >
            {isExpanded ? (
              <>
                <span className="hidden md:inline">{t('collapse') || 'Hide'}</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="hidden md:inline">{t('how_to_use') || 'How to Use'}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: 5-STEP ORDERING ROADMAP */}
          {activeTab === 'steps' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.num}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-black text-xl text-indigo-400">
                          {step.num}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {step.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-xl bg-gradient-to-br ${step.color} text-slate-950 shadow-md shrink-0`}>
                          <Icon className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <h4 className="font-display font-bold text-xs text-slate-100 leading-snug">
                          {step.title}
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Ready to try</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: APPLICATION & FEATURE MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appMap.map((app, idx) => {
                  const Icon = app.icon;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border ${app.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-xs text-slate-100">
                              {app.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 block font-mono">
                              📍 {app.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {app.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PRO TIPS & SHORTCUTS */}
          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Lightbulb className="w-4 h-4 fill-amber-400" />
                    <h4 className="font-bold text-xs text-slate-100">{tip.tip}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {tip.detail}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
