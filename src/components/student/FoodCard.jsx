import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Clock, Star, Plus, Check, AlertCircle, Sparkles, Flame, Bell, BellCheck } from 'lucide-react';

export function FoodCard({ item }) {
  const { cart, addToCart, notifySubscriptions, subscribeToItemAvailability, t } = useCanteen();

  const cartItem = cart.find(i => i.id === item.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = item.availability === 'out_of_stock';
  const isFewLeft = item.availability === 'few_left';
  const isSubscribed = notifySubscriptions.includes(item.id);

  const availabilityBadges = {
    available: {
      text: `🟢 ${t('in_stock')}`,
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    few_left: {
      text: `🟡 ${t('few_left')}`,
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    out_of_stock: {
      text: `🔴 ${t('sold_out')}`,
      style: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
  };

  const badge = availabilityBadges[item.availability] || availabilityBadges.available;

  return (
    <div className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5 backdrop-blur-md">
      
      {/* Food Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md p-1.5 rounded-lg border border-slate-800">
          <div className={`w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          </div>
        </div>

        {/* Popular / Best Seller Badge */}
        {item.isPopular && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[10px] shadow-lg shadow-amber-500/20">
            <Flame className="w-3 h-3 fill-slate-950" /> {t('campus_bestseller')}
          </div>
        )}

        {/* Availability Pill */}
        <div className="absolute bottom-2.5 left-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md ${badge.style}`}>
            {badge.text}
          </span>
        </div>

        {/* Prep Time */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-[10px] backdrop-blur-md font-medium">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{item.preparation_time}m {t('prep_time')}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-amber-400 transition-colors">
              {t(item.name)}
            </h3>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{item.rating}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {t(item.description)}
          </p>
        </div>

        {/* Price & Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 block leading-none font-medium">{t('price')}</span>
            <span className="text-lg font-extrabold text-slate-100 font-display">
              ₹{item.price}
            </span>
          </div>

          {isOutOfStock ? (
            <button
              onClick={() => subscribeToItemAvailability(item.id, item.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                isSubscribed
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                  : 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 active:scale-95'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isSubscribed ? 'Alert Set' : t('notify_me')}</span>
            </button>
          ) : (
            <button
              onClick={() => addToCart(item)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                quantityInCart > 0
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {quantityInCart > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t('added')} ({quantityInCart})</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{t('add')}</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
