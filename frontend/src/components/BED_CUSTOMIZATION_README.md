# Bed Customization Feature Documentation

## Overview

The Bed Customization Feature allows customers to personalize their mattress/bed purchases with custom options including size, color, material, and additional features. The system provides real-time visual previews and dynamic pricing calculations.

## Architecture

### Files Structure

```
frontend/src/
├── utils/
│   └── customizationConfig.js          # Configuration for all customization options
├── components/
│   ├── BedCustomizer.jsx               # Main customization interface component
│   └── CustomizationPreview.jsx        # Visual preview component
├── pages/
│   └── BedCustomizationPage.jsx        # Page wrapper with product loading
└── App.jsx                              # Route configuration
```

## Component Details

### 1. customizationConfig.js

**Purpose**: Centralized configuration for all customization options and helper functions.

**Exports**:
- `CUSTOMIZATION_OPTIONS`: Main configuration object containing:
  - `sizes`: Predefined sizes (Single, Double, Queen, King) + Custom
  - `colors`: Available colors with hex codes and price modifiers
  - `materials`: Material types with descriptions and price adjustments
  - `features`: Additional features with individual pricing

**Key Functions**:
- `calculatePriceModifier(selections)`: Calculates total price adjustment based on selections
- `validateCustomization(selections)`: Validates that all required fields are filled
- `generateCustomizationSummary(selections)`: Creates a human-readable summary of selections

**Example Usage**:
```javascript
import { 
  CUSTOMIZATION_OPTIONS, 
  calculatePriceModifier, 
  validateCustomization 
} from '../utils/customizationConfig';

const modifier = calculatePriceModifier({
  size: 'queen',
  color: 'navy',
  material: 'memory-foam',
  features: ['cooling', 'orthopedic']
});

const total = basePrice + modifier; // 28000 + 12500 = ₹40,500
```

### 2. BedCustomizer Component

**Purpose**: Main customization interface where users select options and see live updates.

**Props**:
- `product` (required): Product object from API
- `onCustomizationComplete` (optional): Callback when customization is added to cart

**State Management**:
```javascript
{
  selections: {
    size: 'queen',           // Selected size key
    color: 'navy',           // Selected color key
    material: 'memory-foam', // Selected material key
    features: [],            // Array of selected feature keys
    customWidth: null,       // Custom dimension (if size === 'custom')
    customLength: null       // Custom dimension (if size === 'custom')
  }
}
```

**Features**:
- Real-time validation with error messages
- Dynamic price calculation
- Add to Cart functionality
- Buy Now with customization
- Responsive grid layout (2 columns on desktop)
- Sticky preview on right side

**Key Methods**:
- `handleSizeChange(sizeKey)`: Updates selected size
- `handleColorChange(colorKey)`: Updates selected color
- `handleMaterialChange(materialKey)`: Updates selected material
- `handleFeatureToggle(featureKey)`: Toggles additional features
- `handleAddToCart()`: Validates and adds customized product to cart
- `handleBuyNow()`: Proceeds to checkout with customization

### 3. CustomizationPreview Component

**Purpose**: Visual representation of the customized bed with real-time updates.

**Props**:
- `selections` (required): User's customization selections
- `basePrice` (required): Original product price
- `totalPrice` (required): Final price with modifiers

**Features**:
- 3D-like perspective rendering
- Dynamic color updates based on selection
- Material-specific shadow effects
- Detailed specifications display
- Price summary with modifier breakdown
- Empty state when no selections made

**Visual Effects**:
- Material-based shadows (firm materials have stronger shadows)
- Gradient background
- Color-coded material indicators
- Smooth transitions on updates

### 4. BedCustomizationPage Component

**Purpose**: Page wrapper that handles product fetching and error states.

**Features**:
- Automatic product loading from API
- Loading state with spinner
- Error handling with fallback UI
- Not found state
- Passes product data to BedCustomizer

## Customization Flow

### User Journey

1. **Browse Products** → Click "Customize This Bed" button on product detail page
2. **Select Options**:
   - Choose size (or enter custom dimensions)
   - Select color from color palette
   - Choose material with descriptions
   - Toggle optional features
3. **Real-Time Updates**: Preview updates as selections change
4. **Price Calculation**: Total price updates dynamically
5. **Add to Cart**: Save customized configuration
6. **Checkout**: Review customization before payment

### Data Flow

```
ProductDetail (Browse)
         ↓
BedCustomizationPage (Product Loading)
         ↓
BedCustomizer (User Selections)
         ├─→ CustomizationPreview (Visual Update)
         ├─→ Validation (customizationConfig)
         ├─→ Price Calculation (customizationConfig)
         └─→ Cart Context (Save to Cart)
```

## Price Modifiers

### Current Pricing Structure

**Sizes** (incremental from Single):
- Single: ₹0
- Double: +₹5,000
- Queen: +₹10,000
- King: +₹15,000
- Custom: +₹8,000

**Colors**:
- White: ₹0
- Cream/Beige/Gray: +₹1,000
- Navy/Charcoal: +₹1,500

**Materials**:
- Memory Foam: ₹0
- Spring: -₹2,000
- Latex: +₹5,000
- Hybrid: +₹8,000
- Gel Foam: +₹7,000

**Features** (cumulative):
- Orthopedic Support: +₹3,000
- Cooling Layer: +₹2,500
- Adjustable Base Compatible: +₹4,000
- Storage Bed: +₹5,000
- Waterproof Cover: +₹1,500
- Anti-Acari Treatment: +₹2,000
- Enhanced Ventilation: +₹1,800
- Premium Knit Cover: +₹3,500

### Example Price Calculation

Base Product Price: ₹20,000

Selected Customizations:
- Size (Queen): +₹10,000
- Color (Navy): +₹1,500
- Material (Memory Foam): ₹0
- Features (Cooling + Orthopedic): +₹5,500

**Total: ₹37,000**

## Cart Integration

### Customized Product Object Structure

```javascript
{
  ...productData,
  price: 37000,  // Updated with customization modifiers
  name: "Product Name - Custom (Queen, Navy Blue)",
  customization: {
    selections: { /* user selections object */ },
    summary: { /* human-readable summary */ },
    priceModifier: 17000,
    basePrice: 20000,
    totalPrice: 37000
  }
}
```

### How Customized Products are Stored

When added to cart, the customization data is preserved in the product object. This allows:
- Cart display to show customization details
- Checkout to verify customization
- Orders to record exact specifications
- Customers to modify customization before payment

## Responsive Design

### Desktop Layout
- 2-column grid
- Left: Customization options (size, color, material, features)
- Right: Sticky preview with price summary

### Tablet Layout
- Single column (stack)
- Customization options above preview
- Preview becomes non-sticky

### Mobile Layout
- Full width
- Accordion-style sections (can be collapsed)
- Touch-friendly buttons and inputs

## Validation Rules

### Required Selections
1. **Size**: Must be selected (or custom dimensions provided if custom selected)
2. **Color**: Must be selected
3. **Material**: Must be selected

### Optional Selections
- Additional Features: 0 or more can be selected

### Custom Dimensions Validation
- Both width and length must be entered
- Must be positive numbers (> 0)
- Unit is centimeters

## API Integration

### Product Fetching

```javascript
GET /api/products/:id
Response: {
  success: true,
  data: {
    product: {
      _id, name, description, price, image,
      category, stock, rating, ...
    }
  }
}
```

### Cart Endpoints (Existing)

The feature uses existing cart endpoints:
- `POST /api/cart/add`
- `PUT /api/cart/update/:productId`

Customized products are added with the full customization object attached.

## Accessibility Features

- Color-coded status indicators
- Keyboard navigation support
- Descriptive button titles
- Clear error messages
- High contrast preview
- Emoji indicators for quick scanning

## Future Enhancements

1. **Customization Templates**: Save and reuse past customizations
2. **Comparison**: Compare customized vs standard versions
3. **Recommendations**: AI-based feature suggestions
4. **3D Model Integration**: Interactive 3D bed visualization
5. **Material Swatches**: Physical sample ordering
6. **Warranty Customization**: Extended warranties for specific combinations
7. **Financing Options**: Split pricing across customization items

## Troubleshooting

### Issue: Preview not updating

**Solution**: Check that all required fields are filled in the selections state.

### Issue: Price not calculating correctly

**Solution**: Verify customizationConfig.js values match your pricing structure.

### Issue: Custom dimensions not working

**Solution**: Ensure size is set to 'custom' before entering dimensions.

### Issue: Features not adding to price

**Solution**: Check that features are properly toggled in the selections.features array.

## Configuration Guide

To customize the available options, edit `customizationConfig.js`:

```javascript
// Add new size
queen: {
  label: 'Queen (5ft × 6.5ft)',
  width: '5 ft',
  length: '6.5 ft',
  priceModifier: 10000,
  dimensions: { width: 5, length: 6.5, unit: 'ft' }
}

// Add new feature
newFeature: {
  label: 'Feature Name',
  description: 'Feature description',
  price: 1000,
  icon: '⚡'
}
```

## Performance Considerations

- Preview updates are optimized with CSS transitions
- Price calculations are lightweight and done on every selection change
- No unnecessary API calls during customization
- Validation happens before cart/checkout operations

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Not supported (uses modern JavaScript)

## Code Quality Standards

- Clear comments explaining complex logic
- Descriptive variable names
- Modular component architecture
- Consistent styling approach
- Error handling at component level
- Validation before critical operations
