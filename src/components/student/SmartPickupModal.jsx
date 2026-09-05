import React, { useState, useEffect } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { generateSmartPickupSlots } from '../../services/smartScheduler';
import {
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

export function SmartPickupModal({ isOpen, onClose, onProceedToPayment }) {
  const {
    cart,
    orders,
    isRushMode,
    selectedPickupSlot,
    setSelectedPickupSlot,
    orderNotes,
    setOrderNotes,
    t,
  } = useCanteen();

  const [schedulerData, setSchedulerData] = useState(null);

  // Recalculate slots whenever cart or rush mode changes
  useEffect(() => {
    if (isOpen) {
      const pendingQueue = orders.filter(o => ['placed', 'accepted', 'preparing'].includes(o.order_status)).length;
      const data = generateSmartPickupSlots(cart, pendingQueue, isRushMode);
      setSchedulerData(data);
      if (!selectedPickupSlot || !data.slots.some(s => s.id === selectedPickupSlot.id)) {
        setSelectedPickupSlot(data.recommendedSlot);
      }
    }
  }, [isOpen, cart, orders, isRushMode]);

  if (!isOpen || !schedulerData) return null;

  const { slots, recommendedSlot, estimatedKitchenPrepMinutes, aiExplanation } = schedulerData;

  const handleSelectSlot = (slot) => {
    setSelectedPickupSlot(slot);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25 text-slate-950">
              <Sparkles className="w-6 h-6 fill-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-100">
                  {t('pickup_scheduler_title')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-wide">
                  {t('rush_load_balancer')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI optimizes kitchen prep & campus rush curves to eliminate physical waiting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* AI Live Rush Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-md">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  {t('recommended_pickup_slot')}: {recommendedSlot.time}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('est_kitchen_prep')}</span>
              <span className="text-sm font-bold text-slate-100 font-display flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ~{estimatedKitchenPrepMinutes} mins
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('canteen_crowd')}</span>
              <span className={`text-sm font-bold font-display flex items-center justify-center gap-1 mt-0.5 ${
                isRushMode ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                <Flame className="w-3.5 h-3.5" />
                {isRushMode ? 'High Rush' : 'Moderate'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">{t('wait_reduction')}</span>
              <span className="text-sm font-bold text-emerald-400 font-display flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                ~85% Faster
              </span>
            </div>
          </div>

          {/* Selectable Pickup Slots */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center justify-between">
              <span>{t('select_desired_slot')}</span>
              <span className="text-[11px] text-slate-500 lowercase font-normal">Click any slot to adjust</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {slots.map(slot => {
                const isSelected = selectedPickupSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-base text-slate-100">
                          {slot.time}
                        </span>
                        {slot.isRecommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-tight shadow">
                            ⭐ AI Best
                          </span>
                        )}
                        {slot.isFastest && !slot.isRecommended && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 uppercase">
                            Earliest
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-1">
                        {slot.crowdText}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Order Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              {t('kitchen_notes')}
            </label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={t('notes_placeholder')}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[11px] text-slate-400 block">Selected Slot</span>
            <span className="text-sm font-bold text-amber-400 font-display">
              {selectedPickupSlot ? selectedPickupSlot.time : 'Choose a slot'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedToPayment();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <span>{t('confirm_and_pay')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
