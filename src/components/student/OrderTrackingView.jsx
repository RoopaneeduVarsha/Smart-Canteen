import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ChefHat,
  Bell,
  Sparkles,
  Star,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  AlertCircle,
} from 'lucide-react';

export function OrderTrackingView({ order, onClose, onOpenFeedback }) {
  const { updateOrderStatus, t } = useCanteen();

  if (!order) return null;

  const statusSteps = [
    { key: 'placed', label: t('order_confirmed'), icon: ShieldCheck, desc: 'Payment verified & sent to kitchen' },
    { key: 'accepted', label: t('chef_accepted'), icon: CheckCircle2, desc: 'Chef acknowledged order' },
    { key: 'preparing', label: t('kitchen_preparing'), icon: ChefHat, desc: 'Fresh ingredients on the grill' },
    { key: 'ready', label: t('ready_pickup'), icon: Bell, desc: `Waiting at ${order.counter || 'Counter 2'}` },
    { key: 'collected', label: t('order_collected'), icon: Sparkles, desc: 'Enjoy your meal!' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.order_status);
  const isReady = order.order_status === 'ready';
  const isCollected = order.order_status === 'collected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/15 via-slate-900 to-orange-500/15 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            {order.order_id}
          </span>
        </div>

        {/* Scrollable Tracking Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Digital Token Hero Card */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 text-slate-950 text-center shadow-xl shadow-amber-500/20 overflow-hidden">
            
            {/* Background shimmer lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>

            <div className="relative z-10 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest bg-slate-950/20 px-3 py-1 rounded-full text-slate-950 inline-block">
                Digital Campus Token
              </span>

              <div className="font-display font-black text-5xl sm:text-6xl tracking-tight text-slate-950 drop-shadow">
                #{order.token_number}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-amber-400 font-bold text-xs shadow-md">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{order.counter || 'Counter 2'}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-emerald-400 font-bold text-xs shadow-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pickup: {order.pickup_time}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Real-Time Queue Status Callout */}
          {!isCollected && (
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
              isReady
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-3">
                {isReady ? (
                  <Bell className="w-5 h-5 text-emerald-400 animate-bounce" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {isReady
                      ? `🔔 ${t('ready_pickup')}`
                      : '👨‍🍳 Kitchen Queue Live Status'}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isReady
                      ? `${t('show_token_counter')} (${order.counter || 'Counter 2'})`
                      : `${order.queue_position || 1} order(s) ahead of you • On schedule for ${order.pickup_time}`}
                  </p>
                </div>
              </div>

              {isReady && (
                <button
                  onClick={() => {
                    updateOrderStatus(order.order_id, 'collected');
                    if (onOpenFeedback) onOpenFeedback(order);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all active:scale-95 shrink-0"
                >
                  {t('mark_collected')}
                </button>
              )}
            </div>
          )}

          {/* Animated 5-Step Order Progress Timeline */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider">
              {t('order_lifecycle')}
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="relative flex items-start gap-3.5">
                    {/* Dot */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-amber-500 border-amber-400 text-slate-950'
                          : 'bg-slate-900 border-slate-700 text-slate-600'
                      } ${isCurrent ? 'ring-4 ring-amber-500/20' : ''}`}
                    >
                      <Icon className="w-2.5 h-2.5 stroke-[3]" />
                    </div>

                    <div>
                      <p className={`font-bold text-xs ${isPassed ? 'text-slate-100' : 'text-slate-500'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <h4 className="font-display font-bold text-slate-300 mb-2">
              Items Ordered
            </h4>
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-slate-400">
                <span>{item.quantity} × {t(item.name)}</span>
                <span className="text-slate-200 font-medium font-display">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-slate-100">
              <span>{t('paid_via')} {order.payment_status}</span>
              <span className="text-amber-400 text-sm font-display">₹{order.total_amount}</span>
            </div>
          </div>

          {/* Feedback CTA if Collected */}
          {isCollected && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-center space-y-2">
              <p className="text-xs font-bold text-amber-300">
                {t('how_was_meal')}
              </p>
              <button
                onClick={() => onOpenFeedback(order)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md inline-flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t('rate_experience')}</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Pickup guaranteed at assigned counter
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
