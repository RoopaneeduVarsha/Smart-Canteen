import React, { useState, useMemo } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { AVAILABLE_COUPONS } from '../../services/coupons';
import { getSmartAddOnsForCart } from '../../services/weatherService';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Gift,
  PlusCircle,
} from 'lucide-react';

export function CartDrawer({ isOpen, onClose, onProceedToSlot }) {
  const {
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
    menuItems,
    isRushMode,
    t,
  } = useCanteen();

  const [couponInput, setCouponInput] = useState('');

  // Compute Smart Add-On Recommendations for items currently in cart
  const smartAddOns = useMemo(() => {
    return getSmartAddOnsForCart(cart, menuItems);
  }, [cart, menuItems]);

  if (!isOpen) return null;

  const totalItemsCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const maxPrepTime = cart.length > 0 ? Math.max(...cart.map(c => c.preparation_time || 8)) : 8;

  const handleApply = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput);
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Background click backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between h-full z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">
                {t('cart')}
              </h3>
              <p className="text-xs text-slate-400">
                {totalItemsCount} {t('items_selected')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-3xl">
                🍱
              </div>
              <h4 className="font-display font-bold text-base text-slate-200">
                {t('cart_hungry')}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                {t('cart_empty_sub')}
              </p>
            </div>
          ) : (
            <>
              {/* AI Prep Time Notice */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-medium">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('est_kitchen_prep')}</span>
                </div>
                <span className="font-bold text-amber-400 font-display text-sm">
                  ~{maxPrepTime} mins
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-200 truncate">
                        {t(item.name)}
                      </h4>
                      <p className="text-xs text-amber-400 font-semibold font-display">
                        ₹{item.price}
                      </p>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-rose-400" /> : <Minus className="w-3 h-3" />}
                      </button>

                      <span className="text-xs font-bold text-slate-100 w-5 text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* ⭐ SMART MEAL ADD-ON RECOMMENDATIONS */}
              {smartAddOns.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/50 via-slate-950 to-slate-950 border border-indigo-500/30 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t('smart_add_ons')}</span>
                  </div>

                  <div className="space-y-2">
                    {smartAddOns.map(addOn => (
                      <div
                        key={addOn.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={addOn.image} alt={addOn.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-200 truncate">{t(addOn.name)}</p>
                            <span className="text-[10px] text-indigo-300 block">{addOn.addOnReason}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => addToCart(addOn)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ ₹{addOn.price}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ⭐ SPECIAL OCCASION & COMBO COUPONS SECTION */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" /> {t('special_coupons')}
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block font-mono">
                        🎉 {appliedCoupon.code} {t('coupon_applied')}
                      </span>
                      <span className="text-[11px] text-emerald-400">
                        {t('discount')}: ₹{discountAmount}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleApply} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t('enter_coupon')}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 uppercase font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                      >
                        {t('apply_code')}
                      </button>
                    </form>

                    {/* Quick Coupon Chips */}
                    <div className="space-y-1.5 pt-1">
                      {AVAILABLE_COUPONS.map(c => (
                        <button
                          key={c.code}
                          onClick={() => applyCouponCode(c.code)}
                          className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left flex items-center justify-between transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-amber-300">{c.code}</span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {c.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{c.description}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 underline">{t('tap_to_apply')}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-4">
            
            {/* Bill breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>{t('items_subtotal')}</span>
                <span className="text-slate-200 font-medium font-display">₹{cartSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>{t('discount')} ({appliedCoupon?.code})</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('campus_subsidy')}</span>
                <span className="text-emerald-400 font-medium">{t('free')}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-slate-100 font-display">
                <span>{t('final_payable')}</span>
                <span className="text-amber-400 text-lg">₹{cartTotal}</span>
              </div>
            </div>

            {/* AI Checkout CTA */}
            <button
              onClick={() => {
                onClose();
                onProceedToSlot();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 active:scale-98"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{t('checkout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('digital_token_note')}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

