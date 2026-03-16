/**
 * Tax Rate Configuration based on Material Type and Size
 * Different mattress materials and sizes have different GST rates in India
 */

// Base tax rates (as percentages) for different material types
const BASE_TAX_RATES = {
  'latex': 5,           // Natural latex - 5% GST
  'coir': 5,            // Coir (coconut fiber) - 5% GST  
  'memory-foam': 12,    // Memory foam - 12% GST
  'softy-foam': 12,     // Softy foam - 12% GST
  'spring': 12,         // Spring mattresses - 12% GST
  'gel-foam': 12        // Gel foam - 12% GST
};

// Size-based tax adjustments (additional percentage points)
const SIZE_TAX_ADJUSTMENTS = {
  'single': 0,          // Single bed - no change
  'double': 0.5,        // Double bed - +0.5% (larger surface area)
  'queen': 1,           // Queen bed - +1% (more material)
  'king': 1.5,          // King bed - +1.5% (significantly more material)
  'custom': 1           // Custom size - +1% (variable labor)
};

/**
 * Get base tax rate for a specific material category
 * @param {string} category - Material category (latex, coir, memory-foam, softy-foam, spring)
 * @returns {number} Tax rate as a percentage (default 12% if unknown)
 */
export const getTaxRate = (category) => {
  if (!category) return 12; // Default fallback
  const normalizedCategory = category.toLowerCase().trim();
  return BASE_TAX_RATES[normalizedCategory] || 12;
};

/**
 * Get size-based tax adjustment
 * @param {string} size - Size (single, double, queen, king, custom)
 * @returns {number} Additional tax percentage points
 */
export const getSizeTaxAdjustment = (size) => {
  if (!size) return 0;
  const normalizedSize = size.toLowerCase().trim();
  return SIZE_TAX_ADJUSTMENTS[normalizedSize] || 0;
};

/**
 * Calculate effective tax rate based on material and size
 * @param {string} material - Material category
 * @param {string} size - Bed size
 * @returns {number} Total tax rate as a percentage
 */
export const getEffectiveTaxRate = (material, size) => {
  const baseTax = getTaxRate(material);
  const sizeAdjustment = getSizeTaxAdjustment(size);
  return baseTax + sizeAdjustment;
};

/**
 * Calculate tax amount based on subtotal, material, and size
 * @param {number} amount - Subtotal amount
 * @param {string} material - Material category
 * @param {string} size - Bed size (optional, for customized products)
 * @returns {number} Tax amount
 */
export const calculateTax = (amount, material, size) => {
  if (!amount || amount < 0) return 0;
  const effectiveRate = getEffectiveTaxRate(material, size) / 100;
  return Number((amount * effectiveRate).toFixed(2));
};

/**
 * Calculate taxes for multiple items with different materials and sizes
 * @param {Array} items - Array of cart items with price, quantity, category, and optional size
 * @returns {number} Total tax amount
 */
export const calculateTotalTax = (items) => {
  if (!Array.isArray(items) || items.length === 0) return 0;

  let totalTax = 0;
  
  items.forEach(item => {
    const itemTotal = (item.price || 0) * (item.quantity || 1);
    const itemTax = calculateTax(itemTotal, item.category, item.size || item.customization?.selections?.size);
    totalTax += itemTax;
  });

  return Number(totalTax.toFixed(2));
};

/**
 * Get tax breakdown for an item
 * @param {object} item - Cart item with price, quantity, category, and optional size
 * @returns {object} Tax breakdown details
 */
export const getTaxBreakdown = (item) => {
  const baseAmount = (item.price || 0) * (item.quantity || 1);
  const material = item.category || 'memory-foam';
  const size = item.size || item.customization?.selections?.size || 'queen';
  
  const baseTaxRate = getTaxRate(material);
  const sizeAdjustment = getSizeTaxAdjustment(size);
  const effectiveTaxRate = baseTaxRate + sizeAdjustment;
  const taxAmount = calculateTax(baseAmount, material, size);

  return {
    amount: baseAmount,
    material: material,
    size: size,
    baseTaxRate: baseTaxRate,
    sizeAdjustment: sizeAdjustment,
    effectiveTaxRate: effectiveTaxRate,
    taxAmount: taxAmount,
    total: baseAmount + taxAmount
  };
};

/**
 * Get all available tax rates (useful for display/documentation)
 * @returns {Object} Object with category as key and tax rate as value
 */
export const getAllTaxRates = () => {
  return { ...TAX_RATES };
};

/**
 * Determine the applicable tax rate based on cart items
 * If cart has mixed materials, returns the highest rate
 * Otherwise returns the rate for the single material type
 * @param {Array} items - Array of cart items
 * @returns {Object} { rate: number, isMixed: boolean }
 */
export const getApplicableTaxRate = (items) => {
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
