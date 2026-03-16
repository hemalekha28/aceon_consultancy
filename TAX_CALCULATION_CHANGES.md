# Tax Calculation Implementation - Material-Based System

## Summary of Changes

The tax calculation system has been updated from a **fixed 8% tax rate** to a **material-based tax rate system** that accurately reflects GST regulations for different mattress materials.

---

## Tax Rate Structure

Different mattress materials now have different tax rates based on Indian GST guidelines:

| Material Type | Tax Rate | Category |
|---|---|---|
| **Latex** | 5% | Natural material (beneficial) |
| **Coir** | 5% | Natural material (coconut fiber) |
| **Memory Foam** | 12% | Processed material |
| **Softy Foam** | 12% | Processed synthetic material |
| **Spring** | 12% | Metal/composite products |

---

## Files Created/Modified

### 1. **Tax Calculation Utilities**

#### Frontend: `frontend/src/utils/taxCalculation.js` (NEW)
- `getTaxRate(category)` - Get tax rate for a specific material
- `calculateTax(amount, category)` - Calculate tax for a single item
- `calculateTotalTax(items)` - Calculate total tax for cart items
- `getApplicableTaxRate(items)` - Determine applicable rate (handles mixed materials)
- `getAllTaxRates()` - Returns all tax rates

#### Backend: `backend/utils/taxCalculation.js` (NEW)
- Same functions as frontend for server-side tax calculations
- Ensures consistency between frontend and backend

### 2. **Frontend Updates**

#### `frontend/src/components/Cart.jsx`
**Changed:**
```javascript
// OLD: Fixed 8% tax
const tax = subtotal * 0.08; // 8% tax

// NEW: Material-based tax
const tax = calculateTotalTax(cartItems); // Tax based on material types
```

Added import: `import { calculateTotalTax } from '../utils/taxCalculation';`

#### `frontend/src/pages/Checkout.jsx`
**Changed:**
```javascript
// OLD: Fixed 8% tax
const tax = subtotal * 0.08;

// NEW: Material-based tax
const tax = isBuyNow 
  ? calculateTotalTax([buyNowItem]) 
  : calculateTotalTax(checkoutItems); // Tax based on material types
```

Added import: `import { calculateTotalTax } from '../utils/taxCalculation';`

### 3. **Backend Model Updates**

#### `backend/models/Order.js`
**Added fields to Order schema:**
- `subtotal` - Total before tax and shipping
- `tax` - Material-type based tax amount
- `shipping` - Shipping fee
- `category` in products array - For tracking material type per product

**Updated schema structure:**
```javascript
subtotal: { type: Number, description: 'Total before tax and shipping' },
tax: { type: Number, description: 'Product tax based on material type' },
shipping: { type: Number, min: [0, 'Shipping cost cannot be negative'] },
total: { type: Number, description: 'Final total: subtotal + tax + shipping' }
```

### 4. **Backend Controller Updates**

#### `backend/controllers/orderController.js`
**Changes:**
- Import tax calculation utility: `const { calculateTotalTax } = require("../utils/taxCalculation");`
- Calculate subtotal from products
- Calculate tax based on product categories using `calculateTotalTax()`
- Calculate shipping: Free if subtotal > 50₹, otherwise 9.99₹
- Store all values in order: `subtotal`, `tax`, `shipping`, `total`
- Include tax details in email confirmation

#### `backend/controllers/paymentController.js`
**Changes:**
- Import tax calculation utility
- Updated `verifyPayment()` function to calculate and store:
  - Subtotal
  - Tax (based on product categories)
  - Shipping
  - Final total
- Send complete pricing breakdown in confirmation email

---

## How It Works

### Frontend Flow
1. User adds products to cart (each product has a `category`)
2. When viewing cart or checkout:
   - Subtotal = sum of (product price × quantity)
   - Tax = `calculateTotalTax(cartItems)` based on each product's material
   - Shipping = 0 if subtotal > 50₹, else 9.99₹
   - Total = Subtotal + Tax + Shipping

### Backend Flow
1. When order is created (COD or Payment):
   - Fetch products to get their categories
   - Calculate subtotal
   - Calculate tax using product categories
   - Calculate shipping
   - Store all four values in order document
   - Email confirmation includes full breakdown

### Mixed Material Orders
- If cart has items from different materials (e.g., Latex + Memory Foam)
- The system applies **the highest applicable tax rate** to the subtotal
- Example: Cart with Latex (5%) + Memory Foam (12%) items → applies 12% tax

---

## Examples

### Example 1: Single Latex Product
- Product: Latex Mattress - ₹10,000 (1x)
- Subtotal: ₹10,000
- Tax: ₹10,000 × 5% = ₹500
- Shipping: ₹0 (subtotal > 50)
- **Total: ₹10,500**

### Example 2: Memory Foam with Shipping
- Product: Memory Foam Mattress - ₹8,000 (1x)
- Subtotal: ₹8,000
- Tax: ₹8,000 × 12% = ₹960
- Shipping: ₹9.99 (subtotal < 50)
- **Total: ₹8,969.99**

### Example 3: Mixed Materials
- Latex Mattress: ₹5,000
- Memory Foam Mattress: ₹6,000
- Subtotal: ₹11,000
- Tax: ₹11,000 × 12% = ₹1,320 (applies higher rate)
- Shipping: ₹0 (subtotal > 50)
- **Total: ₹12,320**

---

## Database Considerations

Old orders only have `total` field. New orders have:
- `subtotal`
- `tax`
- `shipping`
- `total`

Backward compatibility is maintained - existing orders continue to work with just the `total` field.

---

## Configuration

To modify tax rates, update the `TAX_RATES` object in:
- `frontend/src/utils/taxCalculation.js`
- `backend/utils/taxCalculation.js`

Both files must be kept in sync for consistency.

---

## Testing Recommendations

1. **Test different material types** - Verify correct tax rates
2. **Test mixed carts** - Latex + Memory Foam should use 12% (higher rate)
3. **Test shipping threshold** - Orders with subtotal ≤ ₹50 should have ₹9.99 shipping
4. **Test email confirmation** - Should show subtotal, tax, shipping breakdown
5. **Test both COD and Razorpay** - Both should calculate taxes correctly

---

## Notes

- Tax is calculated at checkout/order creation time
- Tax rates are based on Indian GST guidelines
- The system is extensible - new material types can be added by updating the `TAX_RATES` object
- Email confirmations now show complete pricing breakdown
