// AI Personalized Food Recommendation Engine

export function getPersonalizedRecommendations(menuItems = [], userProfile = {}, timeOfDayOverride = 'auto') {
  const now = new Date();
  const currentHour = now.getHours();

  let effectiveTime = timeOfDayOverride;
  if (effectiveTime === 'auto') {
    if (currentHour >= 5 && currentHour < 12) {
      effectiveTime = 'morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      effectiveTime = 'afternoon';
    } else {
      effectiveTime = 'night';
    }
  }

  const isVegetarian = userProfile.dietaryPreference === 'vegetarian';
  const preferredCats = userProfile.preferredCategories || ['snacks', 'beverages'];

  const scoredItems = menuItems
    .filter(item => item.availability !== 'out_of_stock')
    .map(item => {
      let score = 0;
      let reason = 'Campus Favorite';

      // Dietary match
      if (isVegetarian && item.isVeg) {
        score += 20;
      }

      // Preference match
      if (preferredCats.includes(item.category)) {
        score += 20;
        reason = `Matches your preference for ${item.category}`;
      }

      // Time-of-Day Specific Boosts
      if (effectiveTime === 'morning') {
        if (item.category === 'breakfast' || item.mealTime === 'morning') {
          score += 45;
          reason = '🌅 Fresh Morning Breakfast Special';
        } else if (item.category === 'beverages') {
          score += 25;
          reason = '☕ Morning Energizer';
        }
      } else if (effectiveTime === 'afternoon') {
        if (item.category === 'meals' || item.mealTime === 'afternoon') {
          score += 45;
          reason = '☀️ Wholesome Afternoon Lunch Special';
        } else if (item.category === 'beverages') {
          score += 25;
          reason = '🥤 Afternoon Refreshment';
        }
      } else if (effectiveTime === 'night') {
        if (item.category === 'dinner' || item.mealTime === 'night') {
          score += 45;
          reason = '🌙 Night Dinner & Late-Bite Special';
        } else if (item.category === 'desserts' || item.category === 'snacks') {
          score += 30;
          reason = '🍕 Late-Night Canteen Craving';
        }
      }

      // Rating boost
      score += (item.rating || 4.5) * 5;

      // Popularity boost
      if (item.isPopular) {
        score += 15;
      }

      return {
        ...item,
        aiScore: score,
        aiReason: reason,
      };
    });

  // Sort descending by AI match score
  scoredItems.sort((a, b) => b.aiScore - a.aiScore);

  return scoredItems.slice(0, 4);
}
