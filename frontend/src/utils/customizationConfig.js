/**
 * Customization Configuration
 * Centralized configuration for bed/mattress customization options
 * Includes sizes, colors, materials, and additional features with pricing
 */

export const CUSTOMIZATION_OPTIONS = {
  // Size options with base price adjustments
  sizes: {
    single: {
      label: 'Single (3ft × 6ft)',
      width: '3 ft',
      length: '6 ft',
      priceModifier: 0, // No additional cost
      dimensions: { width: 3, length: 6, unit: 'ft' }
    },
    double: {
      label: 'Double (4.5ft × 6ft)',
      width: '4.5 ft',
      length: '6 ft',
      priceModifier: 5000, // ₹5000 more than single
      dimensions: { width: 4.5, length: 6, unit: 'ft' }
    },
    queen: {
      label: 'Queen (5ft × 6.5ft)',
      width: '5 ft',
      length: '6.5 ft',
      priceModifier: 10000, // ₹10000 more than single
      dimensions: { width: 5, length: 6.5, unit: 'ft' }
    },
    king: {
      label: 'King (6ft × 6.5ft)',
      width: '6 ft',
      length: '6.5 ft',
      priceModifier: 15000, // ₹15000 more than single
      dimensions: { width: 6, length: 6.5, unit: 'ft' }
    },
    custom: {
      label: 'Custom Dimensions',
      width: 'custom',
      length: 'custom',
      priceModifier: 8000, // Additional cost for custom
      dimensions: { width: null, length: null, unit: 'cm' }
    }
  },

  // Color options - Extended palette with 15+ options
  colors: {
    // Neutral & Whites
    white: {
      label: 'Bright White',
      hex: '#FFFFFF',
      rgb: { r: 255, g: 255, b: 255 },
      priceModifier: 0,
      category: 'neutral'
    },
    cream: {
      label: 'Cream',
      hex: '#FFFDD0',
      rgb: { r: 255, g: 253, b: 208 },
      priceModifier: 500,
      category: 'neutral'
    },
    ivory: {
      label: 'Ivory',
      hex: '#FFFFF0',
      rgb: { r: 255, g: 255, b: 240 },
      priceModifier: 500,
      category: 'neutral'
    },
    
    // Warm Earth Tones
    beige: {
      label: 'Beige',
      hex: '#F5F5DC',
      rgb: { r: 245, g: 245, b: 220 },
      priceModifier: 800,
      category: 'earth'
    },
    taupe: {
      label: 'Taupe',
      hex: '#B38B6D',
      rgb: { r: 179, g: 139, b: 109 },
      priceModifier: 1000,
      category: 'earth'
    },
    tan: {
      label: 'Tan',
      hex: '#D2B48C',
      rgb: { r: 210, g: 180, b: 140 },
      priceModifier: 900,
      category: 'earth'
    },
    chocolate: {
      label: 'Chocolate Brown',
      hex: '#6B4423',
      rgb: { r: 107, g: 68, b: 35 },
      priceModifier: 1200,
      category: 'earth'
    },
    
    // Cool Grays & Silvers
    lightgray: {
      label: 'Light Gray',
      hex: '#D3D3D3',
      rgb: { r: 211, g: 211, b: 211 },
      priceModifier: 800,
      category: 'gray'
    },
    gray: {
      label: 'Medium Gray',
      hex: '#A9A9A9',
      rgb: { r: 169, g: 169, b: 169 },
      priceModifier: 1000,
      category: 'gray'
    },
    slate: {
      label: 'Slate Gray',
      hex: '#708090',
      rgb: { r: 112, g: 128, b: 144 },
      priceModifier: 1100,
      category: 'gray'
    },
    charcoal: {
      label: 'Charcoal Black',
      hex: '#36454F',
      rgb: { r: 54, g: 69, b: 79 },
      priceModifier: 1300,
      category: 'gray'
    },
    
    // Cool Blues & Jewel Tones
    navy: {
      label: 'Navy Blue',
      hex: '#000080',
      rgb: { r: 0, g: 0, b: 128 },
      priceModifier: 1500,
      category: 'jewel'
    },
    deepblue: {
      label: 'Deep Blue',
      hex: '#003366',
      rgb: { r: 0, g: 51, b: 102 },
      priceModifier: 1600,
      category: 'jewel'
    },
    teal: {
      label: 'Teal',
      hex: '#008080',
      rgb: { r: 0, g: 128, b: 128 },
      priceModifier: 1400,
      category: 'jewel'
    },
    
    // Jewel & Accent Colors
    sage: {
      label: 'Sage Green',
      hex: '#9CAF88',
      rgb: { r: 156, g: 175, b: 136 },
      priceModifier: 1200,
      category: 'jewel'
    },
    blush: {
      label: 'Blush Pink',
      hex: '#F0A9D5',
      rgb: { r: 240, g: 169, b: 213 },
      priceModifier: 1300,
      category: 'jewel'
    },
    lavender: {
      label: 'Lavender',
      hex: '#E6E6FA',
      rgb: { r: 230, g: 230, b: 250 },
      priceModifier: 1100,
      category: 'jewel'
    }
  },

  // Material options
  materials: {
    'memory-foam': {
      label: 'Memory Foam',
      description: 'Conforms to body shape for optimal support',
      priceModifier: 0,
      firmness: 'medium',
      benefits: ['Body contouring', 'Pressure relief', 'Temperature sensitive']
    },
    latex: {
      label: 'Natural Latex',
      description: 'Eco-friendly and hypoallergenic',
      priceModifier: 5000,
      firmness: 'firm',
      benefits: ['Eco-friendly', 'Hypoallergenic', 'Excellent support']
    },
    'spring': {
      label: 'Spring',
      description: 'Traditional bouncy support system',
      priceModifier: -2000,
      firmness: 'firm',
      benefits: ['Air circulation', 'Traditional bounce', 'Cost-effective']
    },
    'hybrid': {
      label: 'Hybrid',
      description: 'Combination of foam and springs',
      priceModifier: 8000,
      firmness: 'medium-firm',
      benefits: ['Best of both worlds', 'Pressure relief + Support', 'Balanced']
    },
    'gel-foam': {
      label: 'Gel Memory Foam',
      description: 'Cool memory foam with gel infusion',
      priceModifier: 7000,
      firmness: 'medium',
      benefits: ['Cooling technology', 'Temperature regulation', 'Body support']
    }
  },

  // Additional features/add-ons
  features: {
    orthopedic: {
      label: 'Orthopedic Support',
      description: 'Extra firm support for back & spine alignment',
      price: 3000,
      icon: '🦴'
    },
    cooling: {
      label: 'Cooling Layer',
      description: 'Temperature-regulating top layer',
      price: 2500,
      icon: '❄️'
    },
    adjustable: {
      label: 'Adjustable Base Compatible',
      description: 'Can be used with adjustable bed frames',
      price: 4000,
      icon: '⚙️'
    },
    storage: {
      label: 'Storage Bed',
      description: 'Built-in under-bed storage drawers',
      price: 5000,
      icon: '🗃️'
    },
    waterproof: {
      label: 'Waterproof Cover',
      description: 'Protective waterproof mattress cover',
      price: 1500,
      icon: '💧'
    },
    antiAcari: {
      label: 'Anti-Acari Treatment',
      description: 'Dust mite resistant treatment',
      price: 2000,
      icon: '🛡️'
    },
    ventilation: {
      label: 'Enhanced Ventilation',
      description: 'Improved air flow channels',
      price: 1800,
      icon: '💨'
    },
    premium: {
      label: 'Premium Knit Cover',
      description: 'High-quality fabric cover',
      price: 3500,
      icon: '✨'
    }
  }
};

/**
 * Get size configuration by key
 */
export const getSizeConfig = (sizeKey) => CUSTOMIZATION_OPTIONS.sizes[sizeKey];

/**
 * Get color configuration by key
 */
export const getColorConfig = (colorKey) => CUSTOMIZATION_OPTIONS.colors[colorKey];

/**
 * Get material configuration by key
 */
export const getMaterialConfig = (materialKey) => CUSTOMIZATION_OPTIONS.materials[materialKey];

/**
 * Get feature configuration by key
 */
export const getFeatureConfig = (featureKey) => CUSTOMIZATION_OPTIONS.features[featureKey];

/**
 * Calculate total price modifier from selections
 */
export const calculatePriceModifier = (selections) => {
  let modifier = 0;

  // Add size modifier
  if (selections.size) {
    modifier += getSizeConfig(selections.size)?.priceModifier || 0;
  }

  // Add color modifier
  if (selections.color) {
    modifier += getColorConfig(selections.color)?.priceModifier || 0;
  }

  // Add material modifier
  if (selections.material) {
    modifier += getMaterialConfig(selections.material)?.priceModifier || 0;
  }

  // Add features total price
  if (selections.features && selections.features.length > 0) {
    selections.features.forEach(featureKey => {
      modifier += getFeatureConfig(featureKey)?.price || 0;
    });
  }

  return modifier;
};

/**
 * Generate customization summary for cart/checkout
 */
export const generateCustomizationSummary = (selections) => {
  const summary = {
    size: selections.size ? getSizeConfig(selections.size)?.label : 'Not selected',
    color: selections.color ? getColorConfig(selections.color)?.label : 'Not selected',
    material: selections.material ? getMaterialConfig(selections.material)?.label : 'Not selected',
    features: selections.features?.map(f => getFeatureConfig(f)?.label) || []
  };

  return summary;
};

/**
 * Validate customization selections
 * @returns {object} { isValid: boolean, errors: string[] }
 */
export const validateCustomization = (selections) => {
  const errors = [];

  if (!selections.size) {
    errors.push('Please select a size');
  } else if (selections.size === 'custom') {
    if (!selections.customWidth || !selections.customLength) {
      errors.push('Please enter custom dimensions');
    }
    if (selections.customWidth <= 0 || selections.customLength <= 0) {
      errors.push('Custom dimensions must be positive numbers');
    }
  }

  if (!selections.color) {
    errors.push('Please select a color');
  }

  if (!selections.material) {
    errors.push('Please select a material');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
