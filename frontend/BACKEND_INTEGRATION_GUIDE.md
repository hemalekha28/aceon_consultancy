# 🔌 Backend Integration Guide - ProductDetail Component

## Quick Start Integration

This guide shows how to connect the ProductDetail component with your backend API.

---

## 1️⃣ API Endpoints Required

Your backend should have these endpoints:

### A. Get Product Details
```
GET /api/products/{productId}
Response:
{
  _id: string,
  name: string,
  price: number,
  originalPrice?: number,
  discount?: number,
  rating: number,
  stock: number,
  category: string,
  description: string,
  images: string[],
  specifications: {
    [key]: string
  },
  taxIncluded: boolean
}
```

### B. Get Product Stock (Real-time)
```
GET /api/products/{productId}/stock
Response:
{
  quantity: number,
  lastUpdated: timestamp,
  lowStockThreshold: number
}
```

### C. Get Product Reviews
```
GET /api/products/{productId}/reviews
Response: [
  {
    _id: string,
    rating: number,
    title: string,
    comment: string,
    userId: { name: string },
    createdAt: date
  }
]
```

### D. Create Review
```
POST /api/products/{productId}/reviews
Headers: { Authorization: "Bearer {token}" }
Body:
{
  rating: number (1-5),
  title: string,
  comment: string
}
Response: { review object }
```

---

## 2️⃣ Enable API Calls (Uncomment Code)

In `ProductDetail.jsx`, find the data fetching section and uncomment the API calls:

### Uncomment Product Fetching:
```javascript
// CURRENT (Line ~188):
const mockProduct = { ... };
setProduct(mockProduct);

// CHANGE TO:
const productData = await apiService.getProduct(id);
setProduct(productData);
```

### Uncomment Stock Fetching:
```javascript
// CURRENT (Line ~228):
if (product?.stock !== undefined) {
  setStock(product.stock);
}

// CHANGE TO:
const stockData = await apiService.getProductStock(id);
if (stockData?.quantity !== undefined) {
  setStock(stockData.quantity);
} else if (product?.stock !== undefined) {
  setStock(product.stock);
}
```

### Uncomment Review Fetching:
```javascript
// CURRENT (Line ~205):
const mockReviews = [...];
setReviews(mockReviews);

// CHANGE TO:
const reviewsData = await apiService.getProductReviews(id);
setReviews(Array.isArray(reviewsData) ? reviewsData : []);
```

---

## 3️⃣ Update API Base URL

```javascript
// Line 23
const API_BASE_URL = 'http://localhost:5000/api';
// Change 5000 to your actual backend port if different
```

---

## 4️⃣ Implementation Example (Backend Routes)

### Express.js Example:
```javascript
// routes/products.js
router.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time stock endpoint
router.get('/api/products/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json({
      quantity: product.stock,
      lowStockThreshold: 10,
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reviews endpoint
router.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create review
router.post('/api/products/:id/reviews', auth, async (req, res) => {
  try {
    const review = new Review({
      productId: req.params.id,
      userId: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment
    });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

---

## 5️⃣ Stock Update Flow (Admin → Customer)

### Admin Updates Stock:
```javascript
// In admin dashboard
router.put('/api/products/:id/stock', auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.quantity },
      { new: true }
    );
    
    // Emit event to notify customers (WebSocket optional)
    io.emit('stock_updated', {
      productId: req.params.id,
      newStock: req.body.quantity
    });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### Customer Sees Live Update:
The component automatically detects stock changes:

```javascript
// Stock fetches every time component mounts
useEffect(() => {
  if (product) {
    fetchStockData();  // Updates when product loads
  }
}, [product, id]);
```

### For Real-time Updates (WebSocket):
```javascript
// Add to component (optional enhancement)
useEffect(() => {
  if (!id) return;
  
  // Connect to WebSocket
  const socket = io('http://localhost:5000');
  
  socket.on('stock_updated', (data) => {
    if (data.productId === id) {
      setStock(data.newStock);  // Instant update
    }
  });
  
  return () => socket.disconnect();
}, [id]);
```

---

## 6️⃣ Handle Authentication for Reviews

Add JWT token to review submission:

```javascript
// In handleReviewSubmit function:
const handleReviewSubmit = async (e) => {
  e.preventDefault();
  
  // Get token from localStorage (or context)
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Add token
      },
      body: JSON.stringify(reviewForm)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        alert('Please login to submit a review');
        return;
      }
      throw new Error('Failed to submit review');
    }
    
    const newReview = await response.json();
    setReviews([newReview, ...reviews]);
    setReviewForm({ rating: 0, title: '', comment: '' });
    setIsWritingReview(false);
  } catch (err) {
    console.error('Error:', err);
    alert('Failed to submit review');
  }
};
```

---

## 7️⃣ Error Handling

The component gracefully handles API failures:

```javascript
// If stock API fails, falls back to product.stock
try {
  const stockData = await apiService.getProductStock(id);
  setStock(stockData.quantity);
} catch (err) {
  setStock(product?.stock);  // Fallback
}

// If reviews API fails, shows empty reviews
try {
  const reviewsData = await apiService.getProductReviews(id);
  setReviews(reviewsData);
} catch {
  setReviews([]);  // Empty array on error
}

// If product API fails, shows error page
catch (err) {
  setError('Failed to load product. Please try again later.');
  // Render error state with retry button
}
```

---

## 8️⃣ Testing Your API Integration

### Test in Browser Console:
```javascript
// Test product fetch
fetch('http://localhost:5000/api/products/123')
  .then(r => r.json())
  .then(data => console.log(data));

// Test stock fetch
fetch('http://localhost:5000/api/products/123/stock')
  .then(r => r.json())
  .then(data => console.log(data));

// Test reviews fetch
fetch('http://localhost:5000/api/products/123/reviews')
  .then(r => r.json())
  .then(data => console.log(data));
```

### Test with cURL:
```bash
# Get product
curl http://localhost:5000/api/products/123

# Get stock
curl http://localhost:5000/api/products/123/stock

# Get reviews
curl http://localhost:5000/api/products/123/reviews

# Create review (with auth)
curl -X POST http://localhost:5000/api/products/123/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"rating":5,"title":"Great!","comment":"Amazing product"}'
```

---

## 9️⃣ Database Schema Example (MongoDB)

### Product Schema:
```javascript
const productSchema = new Schema({
  _id: ObjectId,
  name: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  rating: Number,
  stock: Number,
  category: String,
  description: String,
  images: [String],
  specifications: Map,
  taxIncluded: Boolean,
  createdAt: Date,
  updatedAt: Date
});
```

### Stock History (Optional):
```javascript
const stockHistorySchema = new Schema({
  productId: ObjectId,
  previousStock: Number,
  newStock: Number,
  reason: String, // 'sale', 'refund', 'restock'
  timestamp: Date
});
```

### Review Schema:
```javascript
const reviewSchema = new Schema({
  _id: ObjectId,
  productId: ObjectId,
  userId: ObjectId,
  rating: Number,
  title: String,
  comment: String,
  createdAt: Date,
  updatedAt: Date
});
```

---

## 🔟 Troubleshooting

| Issue | Solution |
|---|---|
| CORS Error | Add CORS headers to backend: `res.header('Access-Control-Allow-Origin', '*')` |
| 404 Not Found | Check API endpoint path matches your routes |
| Stock not updating | Verify stock endpoint returns `{ quantity: number }` |
| Reviews not loading | Check reviews endpoint and database |
| Token not working | Verify JWT format: `Bearer {token}` |
| Images not loading | Check image URLs are public and accessible |

---

## 📋 Pre-Integration Checklist

- [ ] Backend API server running on port 5000 (or configured)
- [ ] `/api/products/{id}` endpoint implemented
- [ ] `/api/products/{id}/stock` endpoint implemented
- [ ] `/api/products/{id}/reviews` endpoint implemented
- [ ] Review creation endpoint requires authentication
- [ ] CORS headers configured on backend
- [ ] Product database populated with sample data
- [ ] JWT authentication middleware in place
- [ ] Review database schema created
- [ ] Test all endpoints with cURL or Postman

---

## 🚀 Quick Start Commands

```bash
# 1. Start backend server
cd backend
npm install
npm start

# 2. Update API_BASE_URL in ProductDetail.jsx
# Change: const API_BASE_URL = 'http://localhost:5000/api';

# 3. Uncomment API calls in ProductDetail.jsx
# Around lines 188, 205, 228

# 4. Start frontend
cd frontend
npm install
npm run dev

# 5. Navigate to product detail page
# http://localhost:3001/product/123
```

---

**Status:** Ready for Integration  
**Last Updated:** December 23, 2024
