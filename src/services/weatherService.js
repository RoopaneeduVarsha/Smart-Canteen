// Weather & Climate Food Recommendation Intelligence

export const CLIMATE_TYPES = [
  { id: 'rainy', label: '🌧️ Monsoon / Rainy', temp: '22°C', note: 'Piping hot chai, crispy snacks & warm meals' },
  { id: 'sunny', label: '☀️ Sunny / Hot', temp: '33°C', note: 'Chilled iced coffee, coolers & refreshing bowls' },
  { id: 'cold', label: '❄️ Chilly / Winter', temp: '16°C', note: 'Steaming biryani, butter parathas & hot sizzlers' },
  { id: 'pleasant', label: '⛅ Pleasant Breeze', temp: '26°C', note: 'Burgers, rolls & campus power combos' },
];

export function getWeatherRecommendedItems(menuItems = [], climate = 'rainy') {
  return menuItems
    .filter(item => item.availability !== 'out_of_stock')
    .map(item => {
      let score = 0;
      let reason = '';

      if (climate === 'rainy') {
        if (item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('samosa')) {
          score = 95;
          reason = '🌧️ Rainy Day Essential: Hot Chai & Crispy Samosa';
        } else if (item.name.toLowerCase().includes('brownie') || item.name.toLowerCase().includes('dosa')) {
          score = 85;
          reason = '🌧️ Fresh & Piping Hot on Rainy Days';
        }
      } else if (climate === 'sunny') {
        if (item.name.toLowerCase().includes('cooler') || item.name.toLowerCase().includes('coffee') || item.category === 'beverages') {
          score = 95;
          reason = '☀️ Beat The Campus Heat: Chilled & Refreshing';
        } else if (item.category === 'desserts') {
          score = 80;
          reason = '☀️ Cool Down With Chilled Desserts';
        }
      } else if (climate === 'cold') {
        if (item.name.toLowerCase().includes('biryani') || item.name.toLowerCase().includes('thali') || item.name.toLowerCase().includes('paratha')) {
          score = 95;
          reason = '❄️ Steaming Hot Filling Meal For Cold Days';
        } else if (item.category === 'beverages') {
          score = 85;
          reason = '☕ Warm Cutting Tea';
        }
      } else {
        if (item.isPopular) {
          score = 90;
          reason = '⛅ Campus Favorite in Pleasant Weather';
        }
      }

      return {
        ...item,
        weatherScore: score,
        weatherReason: reason || '⛅ Great Choice Today',
      };
    })
    .filter(i => i.weatherScore > 0)
    .sort((a, b) => b.weatherScore - a.weatherScore)
    .slice(0, 3);
}

/**
 * Smart Meal Add-On Cross-Sell Recommender
 */
export function getSmartAddOnsForCart(cartItems = [], menuItems = []) {
  if (cartItems.length === 0) return [];

  const cartItemIds = new Set(cartItems.map(i => i.id));
  const hasBeverage = cartItems.some(i => i.category === 'beverages');
  const hasSnack = cartItems.some(i => i.category === 'snacks');
  const hasDessert = cartItems.some(i => i.category === 'desserts');

  const addOns = [];

  // If no beverage, suggest beverage
  if (!hasBeverage) {
    const bev = menuItems.find(m => m.category === 'beverages' && m.availability === 'available' && !cartItemIds.has(m.id));
    if (bev) addOns.push({ ...bev, addOnReason: '🥤 Pair with a chilled beverage' });
  }

  // If burger/meal without fries or snack
  if (!hasSnack) {
    const fries = menuItems.find(m => (m.id === 'item_5' || m.category === 'snacks') && m.availability === 'available' && !cartItemIds.has(m.id));
    if (fries) addOns.push({ ...fries, addOnReason: '🍟 Add crunchy Peri-Peri fries' });
  }

  // Suggest dessert
  if (!hasDessert) {
    const dessert = menuItems.find(m => m.category === 'desserts' && m.availability === 'available' && !cartItemIds.has(m.id));
    if (dessert) addOns.push({ ...dessert, addOnReason: '🍫 Sweet finish: Hot Brownie Sundae' });
  }

  return addOns.slice(0, 2);
}
