// Food Wastage Reduction & Surplus Tracking Intelligence

export const INITIAL_PREPARED_BATCHES = [
  { id: 'prep_1', name: 'North Indian Thali Deluxe', preparedPortions: 60, costPerPortion: 45, price: 110, expiryTime: '04:30 PM' },
  { id: 'prep_2', name: 'Special Chicken Dum Biryani', preparedPortions: 70, costPerPortion: 60, price: 130, expiryTime: '04:00 PM' },
  { id: 'prep_3', name: 'South Indian Masala Dosa', preparedPortions: 80, costPerPortion: 20, price: 55, expiryTime: '12:30 PM' },
  { id: 'prep_4', name: 'Crispy Veg Burger', preparedPortions: 55, costPerPortion: 25, price: 60, expiryTime: '06:00 PM' },
  { id: 'prep_5', name: 'Paneer Tikka Roll', preparedPortions: 45, costPerPortion: 30, price: 75, expiryTime: '06:00 PM' },
  { id: 'prep_6', name: 'Steaming Idli Sambar', preparedPortions: 75, costPerPortion: 15, price: 45, expiryTime: '12:00 PM' },
];

export function computeFoodWastageStats(preparedBatches = INITIAL_PREPARED_BATCHES, orders = []) {
  // Compute sold counts from orders
  const soldMap = {};
  orders.forEach(order => {
    if (order.order_status !== 'cancelled') {
      order.items.forEach(item => {
        soldMap[item.name] = (soldMap[item.name] || 0) + item.quantity;
      });
    }
  });

  let totalPrepared = 0;
  let totalSold = 0;
  let totalRemainingSurplus = 0;
  let totalValuePrepared = 0;
  let totalValueRecovered = 0;
  let potentialWasteLoss = 0;

  const itemDetails = preparedBatches.map(batch => {
    const sold = Math.min(batch.preparedPortions, (soldMap[batch.name] || 0) + Math.floor(batch.preparedPortions * 0.65)); // seed baseline sales
    const remaining = Math.max(0, batch.preparedPortions - sold);
    const wastePercent = ((remaining / batch.preparedPortions) * 100).toFixed(1);
    const lossCost = remaining * batch.costPerPortion;

    totalPrepared += batch.preparedPortions;
    totalSold += sold;
    totalRemainingSurplus += remaining;
    totalValuePrepared += batch.preparedPortions * batch.price;
    totalValueRecovered += sold * batch.price;
    potentialWasteLoss += lossCost;

    return {
      ...batch,
      soldPortions: sold,
      remainingPortions: remaining,
      wastePercent,
      potentialLoss: lossCost,
      isAtRisk: remaining > 8,
    };
  });

  const overallWastageRate = totalPrepared > 0 ? ((totalRemainingSurplus / totalPrepared) * 100).toFixed(1) : 0;
  const wasteReductionScore = Math.max(0, 100 - Number(overallWastageRate)).toFixed(1);

  // AI Surplus Redistribution Recommendations
  const redistributionAlerts = itemDetails
    .filter(i => i.remainingPortions > 5)
    .map(i => ({
      item: i.name,
      remaining: i.remainingPortions,
      recommendation: `⚡ Apply Happy Hour 30% Flash Discount on ${i.remainingPortions} remaining ${i.name} portions to recover ₹${i.remainingPortions * (i.price * 0.7)} with 0% waste.`,
    }));

  return {
    totalPrepared,
    totalSold,
    totalRemainingSurplus,
    totalValuePrepared,
    totalValueRecovered,
    potentialWasteLoss,
    overallWastageRate,
    wasteReductionScore,
    itemDetails,
    redistributionAlerts,
  };
}
