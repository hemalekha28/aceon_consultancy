/**
 * Delivery Charge Calculation Based on Distance
 * Calculates shipping cost based on distance from warehouse to delivery location
 */

// Warehouse location - Hosur, Tamil Nadu
// ACEON Shop: Amman Nagar, 78/7, Denkanikottai Road, Hosur, Krishnagiri-635109, Tamil Nadu, India
export const WAREHOUSE_LOCATION = {
  lat: 12.7408,   // Hosur, Tamil Nadu
  lng: 77.8235,
  address: 'Amman Nagar, 78/7, Denkanikottai Road, Hosur, Krishnagiri-635109, Tamil Nadu, India',
  city: 'Hosur',
  state: 'Tamil Nadu',
  country: 'India'
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1 (warehouse)
 * @param {number} lon1 - Longitude of point 1 (warehouse)
 * @param {number} lat2 - Latitude of point 2 (delivery address)
 * @param {number} lon2 - Longitude of point 2 (delivery address)
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c); // Return rounded distance
};

/**
 * Delivery pricing tiers based on distance
 * Realistic pricing model for mattress/furniture delivery from Hosur, Tamil Nadu
 * 
 * Base rates account for:
 * - Professional packing & loading/unloading
 * - Doorstep delivery
 * - Insurance
 * - Regional transporters (AKR Express, V-XPRESS, etc.)
 */
const DELIVERY_PRICING = {
  // Distance-based pricing for furniture delivery
  // Based on market rates: ₹1,500-₹3,500 for queen/king beds from Hosur to nearby regions
  ranges: [
    { minDistance: 0, maxDistance: 10, baseCost: 500, costPerKm: 0, name: 'Local (0-10 km)' },
    { minDistance: 10, maxDistance: 25, baseCost: 800, costPerKm: 3, name: 'Same City (10-25 km)' },
    { minDistance: 25, maxDistance: 50, baseCost: 1200, costPerKm: 2, name: 'Metro Area (25-50 km)' },
    { minDistance: 50, maxDistance: 100, baseCost: 1500, costPerKm: 2.5, name: 'Regional (50-100 km)' },
    { minDistance: 100, maxDistance: 250, baseCost: 2000, costPerKm: 2, name: 'Inter-City (100-250 km)' },
    { minDistance: 250, maxDistance: 500, baseCost: 2500, costPerKm: 1.5, name: 'Long Distance (250-500 km)' },
    { minDistance: 500, maxDistance: Infinity, baseCost: 3500, costPerKm: 1, name: 'Extra Long Distance (500+ km)' }
  ],

  // Additional charges for special conditions
  loadingUnloading: 200,   // Professional loading/unloading
  nightDelivery: 100,      // Extra charge for night delivery
  remoteArea: 150,         // Extra charge for remote/hilly areas
  cod: 0,                  // COD is free (already included)
  expressDelivery: 300,    // Extra charge for next-day delivery
  
  // Value-based percentage (alternative calculation method)
  // 10% of item value, minimum ₹500, maximum ₹3000 per item
  valueBasedPercentage: 0.10,
  valueBasedMin: 500,
  valueBasedMax: 3000
};

/**
 * Calculate delivery charge based on distance
 * @param {number} distance - Distance in kilometers
 * @param {object} options - Additional options
 * @param {boolean} options.isNightDelivery - Is night delivery
 * @param {boolean} options.isRemoteArea - Is remote area
 * @param {boolean} options.isExpress - Is express delivery
 * @returns {object} { charges, breakdown, distance, deliveryDays }
 */
export const calculateDeliveryCharge = (
  distance,
  options = { isNightDelivery: false, isRemoteArea: false, isExpress: false }
) => {
  if (!distance || distance < 0) {
    return {
      charges: 0,
      breakdown: { base: 0, distance: 0, special: 0 },
      distance: 0,
      deliveryDays: 'Unknown'
    };
  }

  // Find applicable pricing tier
  const pricingTier = DELIVERY_PRICING.ranges.find(
    range => distance >= range.minDistance && distance <= range.maxDistance
  );

  if (!pricingTier) {
    return {
      charges: 0,
      breakdown: { base: 0, distance: 0, special: 0 },
      distance: distance,
      deliveryDays: 'Unknown'
    };
  }

  // Calculate base delivery charge
  const baseCost = pricingTier.baseCost;
  const distanceCost = Math.max(0, (distance - pricingTier.minDistance) * pricingTier.costPerKm);
  const subtotal = baseCost + distanceCost;

  // Add special charges
  let specialCharges = 0;
  if (options.isNightDelivery) specialCharges += DELIVERY_PRICING.nightDelivery;
  if (options.isRemoteArea) specialCharges += DELIVERY_PRICING.remoteArea;
  if (options.isExpress) specialCharges += DELIVERY_PRICING.expressDelivery;

  // Calculate delivery days based on distance
  let deliveryDays = 'Within 24 hours';
  if (distance > 100) deliveryDays = '3-5 days';
  else if (distance > 50) deliveryDays = '2-3 days';
  else if (distance > 25) deliveryDays = '1-2 days';

  if (options.isExpress) deliveryDays = 'Next day';

  return {
    charges: Math.round(subtotal + specialCharges),
    breakdown: {
      base: baseCost,
      distance: Math.round(distanceCost),
      special: specialCharges
    },
    distance: distance,
    range: pricingTier.name,
    deliveryDays: deliveryDays
  };
};

/**
 * Calculate delivery charge from warehouse to delivery coordinates
 * @param {object} deliveryCoordinates - { lat, lng } of delivery location
 * @param {object} options - Additional delivery options
 * @returns {object} Delivery charge details
 */
export const getDeliveryCharge = (deliveryCoordinates, options = {}) => {
  if (!deliveryCoordinates || !deliveryCoordinates.lat || !deliveryCoordinates.lng) {
    return {
      charges: 0,
      breakdown: { base: 0, distance: 0, special: 0 },
      distance: 0,
      deliveryDays: 'Unknown',
      error: 'Invalid delivery coordinates'
    };
  }

  // Calculate distance from warehouse
  const distance = calculateDistance(
    WAREHOUSE_LOCATION.lat,
    WAREHOUSE_LOCATION.lng,
    deliveryCoordinates.lat,
    deliveryCoordinates.lng
  );

  // Calculate delivery charge
  return calculateDeliveryCharge(distance, options);
};

/**
 * Get delivery estimate text
 * @param {number} distance - Distance in km
 * @returns {string} Estimated delivery text
 */
export const getDeliveryEstimate = (distance) => {
  if (distance <= 10) return '📍 Deliver today (Local area)';
  if (distance <= 25) return '📦 Deliver in 1-2 days (Same city)';
  if (distance <= 50) return '📦 Deliver in 2-3 days (Metro area)';
  if (distance <= 100) return '📦 Deliver in 3-5 days (Regional)';
  if (distance <= 250) return '🚚 Deliver in 5-7 days (Inter-city)';
  if (distance <= 500) return '🚚 Deliver in 7-10 days (Long distance)';
  return '✈️ Deliver in 10-15 days (Extra long distance)';
};

/**
 * Calculate delivery charge based on item value (alternative method)
 * Uses 10% of item value, common for furniture like mattresses
 * @param {number} itemPrice - Price of the item in ₹
 * @returns {object} { deliveryCharge, method, description }
 */
export const calculateDeliveryChargeByValue = (itemPrice) => {
  if (!itemPrice || itemPrice <= 0) {
    return {
      deliveryCharge: DELIVERY_PRICING.valueBasedMin,
      method: 'value-based',
      description: 'Minimum delivery charge'
    };
  }

  const valueBasedCharge = Math.round(itemPrice * DELIVERY_PRICING.valueBasedPercentage);
  const deliveryCharge = Math.min(
    Math.max(valueBasedCharge, DELIVERY_PRICING.valueBasedMin),
    DELIVERY_PRICING.valueBasedMax
  );

  return {
    deliveryCharge: deliveryCharge,
    method: 'value-based',
    percentage: DELIVERY_PRICING.valueBasedPercentage * 100,
    description: `${DELIVERY_PRICING.valueBasedPercentage * 100}% of item price (₹${itemPrice})`
  };
};

/**
 * Compare delivery charges - distance-based vs value-based
 * Returns the more economical option
 * @param {number} distance - Distance in km
 * @param {number} itemPrice - Price of item in ₹
 * @returns {object} Comparison with recommended method
 */
export const compareDeliveryMethods = (distance, itemPrice) => {
  const distanceBased = calculateDeliveryCharge(distance);
  const valueBased = calculateDeliveryChargeByValue(itemPrice);

  return {
    distanceBased: {
      charge: distanceBased.charges,
      method: 'Distance-based',
      distance: distance,
      description: `Based on ${distance}km distance`
    },
    valueBased: {
      charge: valueBased.deliveryCharge,
      method: 'Value-based',
      itemPrice: itemPrice,
      description: valueBased.description
    },
    recommended: distanceBased.charges <= valueBased.deliveryCharge ? 'distanceBased' : 'valueBased',
    recommendedCharge: Math.min(distanceBased.charges, valueBased.deliveryCharge)
  };
};

export default {
  calculateDistance,
  calculateDeliveryCharge,
  getDeliveryCharge,
  getDeliveryEstimate,
  calculateDeliveryChargeByValue,
  compareDeliveryMethods,
  WAREHOUSE_LOCATION,
  DELIVERY_PRICING
};
