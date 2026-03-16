/**
 * BED CUSTOMIZATION QUICK REFERENCE
 * 
 * Fast lookup guide for the bed customization system
 */

// ============================================================================
// FILE LOCATIONS & IMPORTS
// ============================================================================

// Configuration
import { CUSTOMIZATION_OPTIONS, calculatePriceModifier } from '@/utils/customizationConfig';

// Components
import BedCustomizer from '@/components/BedCustomizer';
import CustomizationPreview from '@/components/CustomizationPreview';

// Pages
import BedCustomizationPage from '@/pages/BedCustomizationPage';

// Routes
// Route: /customize/:id → BedCustomizationPage
// In ProductDetail: onClick={() => navigate(`/customize/${product._id}`)}


// ============================================================================
// CUSTOMIZATION SELECTIONS OBJECT STRUCTURE
// ============================================================================

const selections = {
  size: 'queen',              // 'single' | 'double' | 'queen' | 'king' | 'custom'
  color: 'navy',              // Any color key from CUSTOMIZATION_OPTIONS.colors
  material: 'memory-foam',    // Any material key from CUSTOMIZATION_OPTIONS.materials
  features: ['cooling', 'orthopedic'],  // Array of feature keys
  customWidth: null,          // Only if size === 'custom' (cm)
  customLength: null          // Only if size === 'custom' (cm)
};


// ============================================================================
// USING CUSTOMIZATION CONFIG
// ============================================================================

// Get available sizes
const sizes = CUSTOMIZATION_OPTIONS.sizes;
// { single, double, queen, king, custom }

// Get available colors
const colors = CUSTOMIZATION_OPTIONS.colors;
// { white, cream, beige, gray, navy, charcoal }

// Get available materials
const materials = CUSTOMIZATION_OPTIONS.materials;
// { 'memory-foam', 'latex', 'spring', 'hybrid', 'gel-foam' }

// Get available features
const features = CUSTOMIZATION_OPTIONS.features;
// { orthopedic, cooling, adjustable, storage, waterproof, antiAcari, ventilation, premium }

// Get specific option config
const queenSize = getSizeConfig('queen');
// { label, width, length, priceModifier, dimensions }

const navyColor = getColorConfig('navy');
// { label, hex, rgb, priceModifier }

const memoryFoamMaterial = getMaterialConfig('memory-foam');
// { label, description, priceModifier, firmness, benefits }

const coolingFeature = getFeatureConfig('cooling');
// { label, description, price, icon }


// ============================================================================
// PRICE CALCULATION EXAMPLES
// ============================================================================

// Basic calculation
const basePrice = 20000;  // ₹20,000

const selections1 = {
  size: 'queen',          // +₹10,000
  color: 'navy',          // +₹1,500
  material: 'memory-foam', // ₹0
  features: []            // ₹0
};

const modifier1 = calculatePriceModifier(selections1);
// 10000 + 1500 + 0 + 0 = 11500

const total1 = basePrice + modifier1;
// 20000 + 11500 = ₹31,500


// With features
const selections2 = {
  size: 'king',           // +₹15,000
  color: 'charcoal',      // +₹1,500
  material: 'hybrid',     // +₹8,000
  features: ['cooling', 'orthopedic', 'premium'] // ₹2,500 + ₹3,000 + ₹3,500
};

const modifier2 = calculatePriceModifier(selections2);
// 15000 + 1500 + 8000 + 2500 + 3000 + 3500 = 33500

const total2 = basePrice + modifier2;
// 20000 + 33500 = ₹53,500


// ============================================================================
// VALIDATION
// ============================================================================

import { validateCustomization } from '@/utils/customizationConfig';

const validation = validateCustomization(selections);

if (!validation.isValid) {
  console.log('Errors:', validation.errors);
  // Example errors:
  // ["Please select a size", "Please select a color"]
}

// Use in component
const { isValid, errors } = validateCustomization(selections);

if (!isValid) {
  showError('Please complete all required selections');
  setValidationErrors(errors);
  return;
}


// ============================================================================
// GENERATING CUSTOMIZATION SUMMARY
// ============================================================================

import { generateCustomizationSummary } from '@/utils/customizationConfig';

const summary = generateCustomizationSummary(selections);

/**
 * Returns:
 * {
 *   size: "Queen (5ft × 6.5ft)",
 *   color: "Navy Blue",
 *   material: "Memory Foam",
 *   features: ["Cooling Layer", "Orthopedic Support", "Premium Knit Cover"]
 * }
 */


// ============================================================================
// CREATING CUSTOMIZED PRODUCT OBJECT
// ============================================================================

const baseProduct = {
  _id: '123',
  name: 'Premium Mattress',
  price: 20000,
  description: '...'
};

const selections = {
  size: 'queen',
  color: 'navy',
  material: 'memory-foam',
  features: ['cooling']
};

const customizationSummary = generateCustomizationSummary(selections);
const priceModifier = calculatePriceModifier(selections);
const totalPrice = baseProduct.price + priceModifier;

// Object to add to cart
const customizedProduct = {
  ...baseProduct,
  price: totalPrice,  // IMPORTANT: Override base price
  name: `${baseProduct.name} - Custom (${customizationSummary.size}, ${customizationSummary.color})`,
  customization: {
    selections: selections,
    summary: customizationSummary,
    priceModifier: priceModifier,
    basePrice: baseProduct.price,
    totalPrice: totalPrice
  }
};

// Now add to cart
await addToCart(customizedProduct, 1);


// ============================================================================
// COMPONENT PROPS
// ============================================================================

// BedCustomizer Component
interface BedCustomizerProps {
  product: Product;                           // Required: Full product object from API
  onCustomizationComplete?: (customized: CustomizedProduct) => void;  // Optional: Callback
}

// CustomizationPreview Component
interface CustomizationPreviewProps {
  selections: Selections;                      // Required: User selections
  basePrice: number;                          // Required: Original product price
  totalPrice: number;                         // Required: Final price with modifiers
}


// ============================================================================
// MODIFYING CUSTOMIZATION OPTIONS
// ============================================================================

// To add a new size:
export const CUSTOMIZATION_OPTIONS = {
  sizes: {
    // ... existing sizes ...
    super_king: {
      label: 'Super King (7ft × 6.5ft)',
      width: '7 ft',
      length: '6.5 ft',
      priceModifier: 20000,
      dimensions: { width: 7, length: 6.5, unit: 'ft' }
    }
  }
  // ... rest of config
};

// To add a new feature:
export const CUSTOMIZATION_OPTIONS = {
  features: {
    // ... existing features ...
    extraFirm: {
      label: 'Extra Firm Support',
      description: 'Maximum firmness for back support',
      price: 3500,
      icon: '💪'
    }
  }
  // ... rest of config
};

// To adjust prices:
export const CUSTOMIZATION_OPTIONS = {
  materials: {
    'memory-foam': {
      // ... existing config ...
      priceModifier: 500  // Changed from 0
    }
  }
  // ... rest of config
};


// ============================================================================
// HANDLING CUSTOMIZATION IN CART/CHECKOUT
// ============================================================================

// Detect customized product in cart
const isCustomized = item.customization !== undefined;

if (isCustomized) {
  // Display customization info
  console.log('Size:', item.customization.summary.size);
  console.log('Price Modifier:', item.customization.priceModifier);
}

// In Cart Display
{cartItems.map(item => (
  <div key={item.id}>
    <p>{item.name}</p>
    {item.customization && (
      <div className="customization-details">
        <p>📏 Size: {item.customization.summary.size}</p>
        <p>🎨 Color: {item.customization.summary.color}</p>
        <p>🛏️ Material: {item.customization.summary.material}</p>
        {item.customization.summary.features.length > 0 && (
          <p>✨ Features: {item.customization.summary.features.join(', ')}</p>
        )}
        <p>Price: ₹{item.price.toLocaleString('en-IN')}</p>
      </div>
    )}
  </div>
))}

// In Checkout - Show customization summary
const customizationDetails = order.products[0].customization;
if (customizationDetails) {
  // Display order customization
}


// ============================================================================
// ERROR HANDLING
// ============================================================================

// Try-catch for Add to Cart
try {
  const validation = validateCustomization(selections);
  if (!validation.isValid) {
    throw new Error('Invalid selections: ' + validation.errors.join(', '));
  }

  const customizedProduct = createCustomizedProduct(product, selections);
  await addToCart(customizedProduct, 1);
  
} catch (error) {
  console.error('Customization error:', error);
  showError(error.message || 'Failed to add customized product to cart');
}

// Show validation errors to user
const { errors } = validateCustomization(selections);
if (errors.length > 0) {
  return (
    <div className="error-messages">
      {errors.map((error, idx) => (
        <p key={idx}>{error}</p>
      ))}
    </div>
  );
}


// ============================================================================
// FEATURE FLAGS / CONDITIONALS
// ============================================================================

// Show customize button only for bed/mattress products
const isBedProduct = ['latex', 'coir', 'memory-foam', 'softy-foam', 'spring']
  .includes(product.category);

if (isBedProduct) {
  return <button onClick={() => navigate(`/customize/${product._id}`)}>
    ✨ Customize This Bed
  </button>;
}

// Show custom dimensions input only when custom size selected
{selections.size === 'custom' && (
  <input 
    placeholder="Width (cm)"
    value={selections.customWidth}
    onChange={(e) => handleCustomDimension('customWidth', e.target.value)}
  />
)}


// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * ✓ All size options load correctly
 * ✓ All color options display with correct colors
 * ✓ All materials show with descriptions
 * ✓ All features can be toggled
 * ✓ Custom dimensions input works
 * ✓ Price updates in real-time
 * ✓ Preview updates on each selection
 * ✓ Validation catches missing fields
 * ✓ Custom dimensions validation works
 * ✓ Add to Cart creates correct object
 * ✓ Customization persists in cart
 * ✓ Customization shows in checkout
 * ✓ Mobile layout is responsive
 * ✓ Feature icons display correctly
 * ✓ Material descriptions are helpful
 * ✓ Error messages are clear
 * ✓ Empty states show proper messaging
 */
