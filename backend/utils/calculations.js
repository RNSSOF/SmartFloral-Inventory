// حساب تاريخ التلف المتوقع
function calculateDecayDate(entryDate, lifespanDays) {
  const date = new Date(entryDate);
  date.setDate(date.getDate() + lifespanDays);
  return date;
}

// حساب عدد الأيام المتبقية حتى التلف
function calculateDaysUntilDecay(decayDate) {
  const now = new Date();
  const timeDiff = decayDate - now;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
}

// الحصول على حالة الوردة بناءً على تاريخ التلف
function getFlowerStatus(decayDate) {
  const daysUntil = calculateDaysUntilDecay(decayDate);

  if (daysUntil <= 0) return 'expired';
  if (daysUntil <= 1) return 'critical';
  if (daysUntil <= 3) return 'warning';
  return 'fresh';
}

// حساب الخصم الديناميكي
function calculateDynamicDiscount(entryDate, expectedDecayDate, maxDiscount = 50) {
  const totalLifespan = (expectedDecayDate - entryDate) / (1000 * 60 * 60 * 24);
  const daysRemaining = calculateDaysUntilDecay(expectedDecayDate);
  const agePercentage = ((totalLifespan - daysRemaining) / totalLifespan) * 100;

  // كلما كبر العمر، زاد الخصم
  if (daysRemaining <= 0) return Math.min(maxDiscount, 100);
  if (daysRemaining <= 1) return Math.min(maxDiscount, 40);
  if (daysRemaining <= 3) return Math.min(maxDiscount * 0.6, 30);
  if (daysRemaining <= 7) return Math.min(maxDiscount * 0.3, 15);
  return 0;
}

// حساب السعر الجديد بناءً على الخصم
function calculateNewPrice(originalPrice, discountPercentage) {
  return originalPrice * (1 - discountPercentage / 100);
}

// حساب الربح/الخسارة
function calculateProfitLoss(originalPrice, salePrice, quantity) {
  const costPerUnit = originalPrice;
  const totalCost = costPerUnit * quantity;
  const totalRevenue = salePrice * quantity;
  return {
    totalCost,
    totalRevenue,
    profit: totalRevenue - totalCost,
    profitMargin: ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(2)
  };
}

module.exports = {
  calculateDecayDate,
  calculateDaysUntilDecay,
  getFlowerStatus,
  calculateDynamicDiscount,
  calculateNewPrice,
  calculateProfitLoss
};
