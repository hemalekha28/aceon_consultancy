/**
 * Tax Rate Configuration based on Material Type
 * Different mattress materials have different GST rates in India
 */

// Tax rates (as percentages) for different material types
const TAX_RATES = {
  'latex': 5,           // Natural latex - 5% GST
  'coir': 5,            // Coir (coconut fiber) - 5% GST  
  'memory-foam': 12,    // Memory foam - 12% GST
  'softy-foam': 12,     // Softy foam - 12% GST
  'spring': 12          // Spring mattresses - 12% GST
};

/**
 * Get tax rate for a specific material category
 * @param {string} category - Material category (latex, coir, memory-foam, softy-foam, spring)
 * @returns {number} Tax rate as a percentage (default 12% if unknown)
 */
const getTaxRate = (category) => {
  if (!category) return 12; // Default fallback
  const normalizedCategory = category.toLowerCase().trim();
  return TAX_RATES[normalizedCategory] || 12;
};

/**
 * Calculate tax amount based on subtotal and material category
 * @param {number} amount - Subtotal amount
 * @param {string} category - Material category
 * @returns {number} Tax amount
 */
const calculateTax = (amount, category) => {
  if (!amount || amount < 0) return 0;
  const rate = getTaxRate(category) / 100;
  return Number((amount * rate).toFixed(2));
};

/**
 * Calculate taxes for multiple items with different categories
 * @param {Array} items - Array of cart items with price, quantity, and category
 * @returns {number} Total tax amount
 */
const calculateTotalTax = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;

  let totalTax = 0;
  
  items.forEach(item => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    const itemTax = calculateTax(itemTotal, item.category);
    totalTax += itemTax;
  });

  return Number(totalTax.toFixed(2));
};

/**
 * Get all available tax rates (useful for display/documentation)
 * @returns {Object} Object with category as key and tax rate as value
 */
const getAllTaxRates = () => {
  return { ...TAX_RATES };
};

/**
 * Determine the applicable tax rate based on order items
 * If order has mixed materials, returns the highest rate
 * Otherwise returns the rate for the single material type
 * @param {Array} items - Array of order items with category
 * @returns {Object} { rate: number, isMixed: boolean }
 */
const getApplicableTaxRate = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { rate: 12, isMixed: false };
  }

  const categories = new Set(items.map(item => (item.category || '').toLowerCase()));
  
  if (categories.size === 0) {
    return { rate: 12, isMixed: false };
  }

  if (categories.size === 1) {
    const category = Array.from(categories)[0];
    return { rate: getTaxRate(category), isMixed: false };
  }

  // Multiple categories - return the highest applicable tax rate
  const rates = Array.from(categories).map(cat => getTaxRate(cat));
  const maxRate = Math.max(...rates);
  return { rate: maxRate, isMixed: true };
};

module.exports = {
  getTaxRate,
  calculateTax,
  calculateTotalTax,
  getAllTaxRates,
  getApplicableTaxRate,
  TAX_RATES
};
