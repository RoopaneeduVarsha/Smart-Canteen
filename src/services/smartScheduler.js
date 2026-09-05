// Smart Pickup Scheduling Algorithm

/**
 * Calculates optimal pickup slots based on preparation time,
 * current queue load, and predicted rush windows.
 */
export function generateSmartPickupSlots(cartItems = [], activeQueueCount = 2, isRushMode = false) {
  const maxPrepTime = cartItems.length > 0
    ? Math.max(...cartItems.map(item => item.preparation_time || 8))
    : 8;

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const estimatedKitchenPrepMinutes = Math.min(30, maxPrepTime + Math.floor(totalItemsCount * 1.5));

  const now = new Date();
  
  // Calculate earliest ready time
  const earliestReadyTime = new Date(now.getTime() + (estimatedKitchenPrepMinutes + (activeQueueCount * 2)) * 60000);

  // Generate 5 successive 15-minute slot intervals
  const slots = [];
  
  // Round to next 5 or 10 min window
  let slotBaseTime = new Date(earliestReadyTime.getTime());
  const minutes = slotBaseTime.getMinutes();
  const remainder = minutes % 15;
  if (remainder !== 0) {
    slotBaseTime.setMinutes(minutes + (15 - remainder));
  }
  slotBaseTime.setSeconds(0);

  for (let i = 0; i < 5; i++) {
    const slotTime = new Date(slotBaseTime.getTime() + i * 15 * 60000);
    const hour = slotTime.getHours();
    const min = slotTime.getMinutes();
    const isPM = hour >= 12;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMin = min < 10 ? `0${min}` : min;
    const timeLabel = `${formattedHour}:${formattedMin} ${isPM ? 'PM' : 'AM'}`;

    // Determine crowd status for this slot
    let crowdLevel = 'low';
    let crowdColor = 'emerald';
    let crowdText = '🟢 Low Queue';
    let predictedWaitSeconds = 45;

    // Simulate peak rush slot for first 1-2 slots if rush is active
    if (i === 0 && (isRushMode || hour === 13 || hour === 12)) {
      crowdLevel = 'high';
      crowdColor = 'rose';
      crowdText = '🔴 High Rush (12+ ahead)';
      predictedWaitSeconds = 600;
    } else if (i === 1 && (isRushMode || hour === 13)) {
      crowdLevel = 'moderate';
      crowdColor = 'amber';
      crowdText = '🟡 Moderate (5 ahead)';
      predictedWaitSeconds = 240;
    } else if (i === 2) {
      crowdLevel = 'low';
      crowdColor = 'emerald';
      crowdText = '🟢 Low Queue (Optimal)';
      predictedWaitSeconds = 40;
    } else {
      crowdLevel = 'low';
      crowdColor = 'emerald';
      crowdText = '🟢 Fast Pickup (1 ahead)';
      predictedWaitSeconds = 20;
    }

    slots.push({
      id: `slot_${i}`,
      time: timeLabel,
      crowdLevel,
      crowdColor,
      crowdText,
      predictedWaitSeconds,
      timestamp: slotTime.toISOString(),
      isRecommended: i === (isRushMode ? 2 : 1), // Recommend slot that distributes peak
      isFastest: i === 0,
    });
  }

  const recommendedSlot = slots.find(s => s.isRecommended) || slots[1] || slots[0];

  const aiExplanation = isRushMode
    ? `Canteen is experiencing high lunchtime surge. Picking ${recommendedSlot.time} avoids 8+ people queue and saves ~12 minutes.`
    : `Kitchen prep completes in ~${estimatedKitchenPrepMinutes} mins. ${recommendedSlot.time} provides immediate fresh pickup at Counter 2.`;

  return {
    slots,
    recommendedSlot,
    estimatedKitchenPrepMinutes,
    aiExplanation,
  };
}
