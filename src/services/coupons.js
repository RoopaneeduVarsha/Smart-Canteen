// Special Occasion & Combo Coupons System

export const AVAILABLE_COUPONS = [
  {
    code: 'BIRTHDAY50',
    title: '🎂 Student Birthday Special',
    description: 'Flat 50% discount on entire cart up to ₹80!',
    discountType: 'percentage',
    discountValue: 50,
    maxDiscount: 80,
    minCartValue: 60,
    tag: '🎂 Birthday',
    color: 'from-pink-500 to-rose-500',
    expiresIn: 'Limited Special',
  },
  {
    code: 'CAMPUSFEST',
    title: '🎉 College Fest Week Celebration',
    description: 'Flat 25% discount across all campus food items!',
    discountType: 'percentage',
    discountValue: 25,
    maxDiscount: 60,
    minCartValue: 80,
    tag: '🎉 Fest Special',
    color: 'from-amber-500 to-orange-500',
    expiresIn: 'Ends in 2 days',
  },
  {
    code: 'EXAMBOOST',
    title: '📚 Exam Week Brain Fuel',
    description: 'Flat ₹30 off on meals and beverages above ₹90',
    discountType: 'flat',
    discountValue: 30,
    minCartValue: 90,
    tag: '📚 Exam Boost',
    color: 'from-indigo-500 to-purple-500',
    expiresIn: 'Active Today',
  },
  {
    code: 'COMBOBITE',
    title: '🔥 Smart Combo Meal Saver',
    description: 'Flat ₹40 off when ordering any combo pack',
    discountType: 'flat',
    discountValue: 40,
    minCartValue: 100,
    tag: '🔥 Combo Deal',
    color: 'from-emerald-500 to-teal-500',
    expiresIn: 'Daily Deal',
  },
];

export function evaluateCoupon(code, cartTotal = 0, cartItems = []) {
  if (!code) return { valid: false, discount: 0, message: '' };

  const cleanCode = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find(c => c.code === cleanCode);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid coupon code.' };
  }

  if (cartTotal < (coupon.minCartValue || 0)) {
    return {
      valid: false,
      discount: 0,
      message: `Min order value of ₹${coupon.minCartValue} required for ${coupon.code}.`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.min(coupon.maxDiscount || Infinity, Math.round((cartTotal * coupon.discountValue) / 100));
  } else if (coupon.discountType === 'flat') {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, cartTotal);

  return {
    valid: true,
    discount,
    coupon,
    message: `Applied ${coupon.code}! Saved ₹${discount}.`,
  };
}
