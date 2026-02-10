# ProductDetail.jsx - Enhanced UI/UX Component Documentation

## 📋 Overview
An enterprise-grade product detail page built with React + Tailwind CSS featuring:
- **Modern responsive design** with gradient backgrounds
- **Advanced image handling** with lazy loading and fallback images
- **Real-time stock management** with status badges
- **Rich review system** with interactive star ratings
- **Smooth animations** and professional hover effects
- **Accessibility compliance** with ARIA attributes

---

## 🎨 Component Architecture

### 1️⃣ **ProductImage Component** (Image Handling)
```jsx
<ProductImage src={url} alt={name} onLoad={callback} onError={callback} />
```

**Features:**
- ✅ Lazy loading (`loading="lazy"` attribute)
- ✅ Fallback to placeholder image if original fails
- ✅ Loading spinner during image fetch
- ✅ Graceful error handling
- ✅ Smooth fade-in animation

**Fallback Image:** `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800`

**How It Works:**
```jsx
const handleImageError = useCallback(() => {
  console.warn(`Failed to load image: ${src}`);
  if (imageSrc !== fallbackImage) {
    setImageSrc(fallbackImage);  // Switch to fallback
  }
}, [src, imageSrc, onError]);
```

### 2️⃣ **StockBadge Component** (Stock Management)
Displays real-time stock status with color-coded indicators:

| Stock Status | Icon | Color | Range |
|---|---|---|---|
| **In Stock** | 🟢 | Green | > threshold |
| **Low Stock** | 🟡 | Yellow | < threshold |
| **Out of Stock** | 🔴 | Red | = 0 |

```jsx
<StockBadge stock={availableStock} threshold={10} />
```

**Usage:**
```jsx
// Shows: "🟢 In Stock (45 available)"
<StockBadge stock={45} threshold={10} />

// Shows: "🟡 Low Stock (5 left)"
<StockBadge stock={5} threshold={10} />

// Shows: "🔴 Out of Stock"
<StockBadge stock={0} threshold={10} />
```

### 3️⃣ **StarRating Component** (Review System)
Interactive star rating display with optional user interaction

**Props:**
```jsx
{
  rating: number,        // 0-5
  size: 'sm'|'md'|'lg',  // Icon size
  interactive: boolean,  // Allow user to rate
  onRate: function       // Callback when rated
}
```

---

## 📡 Data Flow & API Integration

### Stock Data Flow
```
Admin Dashboard Updates Stock
        ↓
Backend API: /api/products/{id}/stock
        ↓
apiService.getProductStock()
        ↓
setStock(data.quantity)  // Update state
        ↓
<StockBadge stock={stock} /> // Display to user
        ↓
Automatic re-render when admin updates
```

### API Service Implementation
Located at the top of the component:

```javascript
const apiService = {
  // Fetch product with all details
  getProduct: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
    return await response.json();
  },

  // Fetch current stock from inventory system
  getProductStock: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/stock`);
    return await response.json(); // { quantity: 45, lastUpdated: timestamp }
  },

  // Fetch product reviews
  getProductReviews: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`);
    return await response.json(); // Array of reviews
  },

  // Submit new review
  createReview: async (productId, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });
    return await response.json();
  }
};
```

### Fetch Stock Separately
Stock is fetched independently to allow real-time updates:

```javascript
useEffect(() => {
  const fetchStockData = async () => {
    try {
      setStockLoading(true);
      
      // Try dedicated stock API first
      const stockData = await apiService.getProductStock(id);
      
      if (stockData?.quantity !== undefined) {
        setStock(stockData.quantity);  // Real-time data
      } else if (product?.stock !== undefined) {
        setStock(product.stock);  // Fallback
      }
    } catch (err) {
      // Use product.stock field as final fallback
      setStock(product?.stock);
    } finally {
      setStockLoading(false);
    }
  };

  if (product) fetchStockData();
}, [product, id]);
```

---

## 🖼️ Image Handling Architecture

### Problem Solved
- ❌ Broken images leave blank spaces
- ❌ Slow loading impacts UX
- ❌ Missing images prevent purchase decisions

### Solution Implemented

**1. Lazy Loading**
```jsx
<img loading="lazy" ... />
```
Images load only when visible in viewport

**2. Fallback Images**
```jsx
const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
```
Auto-switch to fallback if original fails

**3. Loading Indicator**
```jsx
{isLoading && (
  <RefreshCw className="animate-spin" />
)}
```

**4. Error Handling**
```jsx
onError={handleImageError}  // Fallback to placeholder
```

### Image Flow
```
1. Attempt to load original image
   ↓ (Success) → Display with fade-in
   ↓ (Failure) → Switch to fallback image
   ↓ (Loading) → Show spinner
```

---

## 🎯 Key Features

### 1. **Responsive Design**
- ✅ Mobile-first approach
- ✅ Grid layout: 1 col (mobile) → 2 cols (desktop)
- ✅ Touch-friendly buttons and inputs
- ✅ Flexible spacing with Tailwind

### 2. **Performance Optimizations**
- ✅ `useCallback` for memoized handlers
- ✅ Lazy image loading
- ✅ Separate stock fetching (non-blocking)
- ✅ Minimal re-renders

### 3. **User Experience**
- ✅ Gradient backgrounds for visual appeal
- ✅ Smooth hover effects
- ✅ Loading states with spinners
- ✅ Success feedback (Added to Cart confirmation)
- ✅ Error boundaries with helpful messages

### 4. **Stock Integration**
- ✅ Real-time stock updates from API
- ✅ Color-coded status badges
- ✅ Quantity validation against available stock
- ✅ Disable purchase if out of stock

---

## 🔧 Configuration

### API Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```
Update this to match your backend URL

### Stock Threshold
```javascript
<StockBadge stock={availableStock} threshold={10} />
```
Products with < 10 items show "Low Stock" warning

### Fallback Image
```javascript
const fallbackImage = 'https://images.unsplash.com/...';
```
Replace with your own placeholder

---

## 📊 State Management

| State | Type | Purpose |
|---|---|---|
| `product` | Object | Product details |
| `stock` | Number | Current available quantity |
| `loading` | Boolean | Initial page load |
| `stockLoading` | Boolean | Stock data fetch |
| `quantity` | Number | User-selected quantity |
| `selectedImage` | Number | Active thumbnail index |
| `reviews` | Array | Product reviews |
| `activeTab` | String | Visible tab |
| `isInWishlist` | Boolean | Wishlist status |
| `addedToCart` | Boolean | Success feedback |

---

## 🔄 Data Update Flow (Admin → Customer)

```
1. Admin updates stock in dashboard
   ↓
2. Stock stored in database
   ↓
3. Product detail page polls /api/products/{id}/stock
   ↓
4. Stock state updates via setStock()
   ↓
5. Component re-renders with new stock badge
   ↓
6. Customer sees real-time availability
```

### Polling Implementation
Stock refetches when product loads. For real-time updates, add:

```javascript
// Auto-refresh stock every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (product) {
      apiService.getProductStock(id)
        .then(data => setStock(data.quantity));
    }
  }, 30000);  // 30 seconds
  
  return () => clearInterval(interval);
}, [product, id]);
```

---

## 🎨 UI Customization

### Colors
```tailwind
Gradients:
- from-slate-50 via-blue-50 to-indigo-50
- from-blue-600 to-indigo-600
- from-red-500 to-pink-500

Alerts:
- Green (in stock): bg-green-100 text-green-700
- Yellow (low): bg-yellow-100 text-yellow-700
- Red (out): bg-red-100 text-red-700
```

### Border Radius
- Small: `rounded-xl`
- Medium: `rounded-2xl`
- Large: `rounded-3xl`

### Shadows
- Base: `shadow-md`
- Hover: `shadow-lg`, `shadow-xl`
- Large: `shadow-2xl`

---

## 📱 Mobile Responsiveness

| Breakpoint | Layout |
|---|---|
| <640px | Single column |
| 640px-1024px | Single column (optimized) |
| >1024px | Two columns (image + info) |

---

## ⚡ Performance Tips

1. **Optimize Images**
   - Use WebP format when possible
   - Compress PNG/JPG
   - Specify width/height to prevent layout shift

2. **Lazy Load Reviews**
   ```javascript
   // Load reviews only when tab is clicked
   if (activeTab === 'reviews' && reviews.length === 0) {
     fetchReviews();
   }
   ```

3. **Debounce Stock Polling**
   - Update stock every 30-60 seconds, not on every change

4. **Cache Product Data**
   - Store in localStorage for 5 minutes
   - Reduce API calls

---

## 🧪 Testing Checklist

- [ ] Images load correctly
- [ ] Broken images show fallback
- [ ] Stock badge displays correct status
- [ ] Out of stock disables purchase
- [ ] Quantity selector validates against stock
- [ ] Reviews load and submit
- [ ] Wishlist toggle works
- [ ] Mobile responsive
- [ ] Tab navigation works
- [ ] Error states display correctly

---

## 🚀 Future Enhancements

1. **Image Gallery**
   - Lightbox zoom on image click
   - 360° product view

2. **Smart Stock**
   - Real-time WebSocket updates
   - Last item alerts

3. **Reviews**
   - Filter by rating
   - Helpful vote count
   - Vendor responses

4. **Recommendations**
   - Related products carousel
   - Recently viewed items

5. **Comparison**
   - Compare with other products
   - Side-by-side specs

---

## 📞 Support & Troubleshooting

### Images not loading?
1. Check image URL is valid
2. Verify CORS headers on backend
3. Use public image CDN
4. Check browser console for errors

### Stock not updating?
1. Verify API endpoint exists
2. Check stock API response format
3. Enable stock polling if needed
4. Check backend is running

### Reviews not submitting?
1. Verify authentication
2. Check API endpoint
3. Review browser console for errors
4. Check POST request format

---

**Last Updated:** December 23, 2024  
**Component Version:** 2.0 (Enhanced with Image & Stock Management)
