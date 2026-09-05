import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  Plus,
  Banknote,
} from 'lucide-react';

export function PaymentModal({ isOpen, onClose, onPaymentSuccess }) {
  const { cart, cartTotal, selectedPickupSlot, user, placeOrder, topUpWallet, t } = useCanteen();

  const [paymentMethod, setPaymentMethod] = useState('Campus Card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const hasSufficientCampusBalance = user.walletBalance >= cartTotal;

  const handlePayNow = () => {
    if (paymentMethod === 'Campus Card' && !hasSufficientCampusBalance) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Create new order
      const newOrder = placeOrder({
        paymentMethod,
        pickupSlot: selectedPickupSlot,
      });

      // Blast celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
        });
      } catch {
        // ignore
      }

      setIsProcessing(false);
      onClose();
      onPaymentSuccess(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">
                {t('secure_checkout')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('digital_token_note')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Order Summary Pill */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">{t('final_payable')}</span>
              <span className="text-2xl font-extrabold text-amber-400 font-display">
                ₹{cartTotal}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 font-medium block">{t('recommended_pickup_slot')}</span>
              <span className="text-xs font-bold text-emerald-400 font-display bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-block mt-0.5">
                ⏰ {selectedPickupSlot?.time || '1:30 PM'}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              {t('select_payment_mode')}
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Campus Meal Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Campus Card')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'Campus Card'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span>{t('campus_card')}</span>
                  <span className="text-[10px] text-emerald-400 block font-bold">₹{user.walletBalance}</span>
                </div>
              </button>

              {/* Cash on Delivery (COD) */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'Cash on Delivery (COD)'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-left">
                  <span>{t('cash_on_delivery')}</span>
                  <span className="text-[10px] text-amber-400 block">Pay at Counter</span>
                </div>
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'UPI'
                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="text-left">
                  <span>{t('upi_qr')}</span>
                  <span className="text-[10px] text-indigo-400 block">GPay, PhonePe</span>
                </div>
              </button>

              {/* Debit/Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-semibold transition-all ${
                  paymentMethod === 'Card'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-300 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{t('card_payment')}</span>
              </button>

            </div>
          </div>

          {/* Cash on Delivery Details */}
          {paymentMethod === 'Cash on Delivery (COD)' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Banknote className="w-4 h-4 text-amber-400" />
                <span>💵 {t('pay_cash_counter')} (₹{cartTotal})</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {t('cod_explanation')}
              </p>
            </div>
          )}

          {/* Campus Card Details */}
          {paymentMethod === 'Campus Card' && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> {t('campus_wallet')}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{t('current_balance')}</span>
                  <span className="text-lg font-black text-emerald-400 font-display">₹{user.walletBalance}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Balance After Order</span>
                  <span className={`text-lg font-black font-display ${hasSufficientCampusBalance ? 'text-slate-200' : 'text-rose-400'}`}>
                    ₹{Math.max(0, user.walletBalance - cartTotal)}
                  </span>
                </div>
              </div>

              {!hasSufficientCampusBalance && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{t('insufficient_balance')} (Need ₹{cartTotal - user.walletBalance} more)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => topUpWallet(200)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3 h-3" /> +₹200 {t('top_up')}
                  </button>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="inline-block p-3 rounded-xl bg-white text-slate-950 shadow-md">
                <div className="w-28 h-28 bg-slate-900 rounded-lg p-2 flex flex-col justify-between items-center text-white">
                  <div className="flex justify-between w-full">
                    <div className="w-6 h-6 border-2 border-amber-400 rounded-sm"></div>
                    <div className="w-6 h-6 border-2 border-amber-400 rounded-sm"></div>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-amber-300 text-center">
                    ₹{cartTotal} • SMARTBITE
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="w-6 h-6 border-2 border-amber-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-sm m-auto"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                  <span
                    key={app}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === 'Card' && (
            <div className="space-y-2.5 text-xs">
              <input
                type="text"
                placeholder="Card Number (e.g. 4532 •••• •••• 8842)"
                defaultValue="4532 9901 2284 8842"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM/YY"
                  defaultValue="08/28"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
                <input
                  type="password"
                  placeholder="CVV"
                  defaultValue="882"
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handlePayNow}
            disabled={isProcessing || (paymentMethod === 'Campus Card' && !hasSufficientCampusBalance)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{paymentMethod === 'Cash on Delivery (COD)' ? `${t('confirm_order_cod')} (₹${cartTotal})` : `${t('pay_and_get_token')} (₹${cartTotal})`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

