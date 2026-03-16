const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Interaction = require('../models/Interaction');
const { protect, admin } = require('../middlewares/auth');
const upload = require('../middlewares/uploadMulter');
const { bulkCreateProducts } = require('../controllers/productController');

const router = express.Router();

// ====================
// NLP Intent Map
// ====================
const INTENT_MAP = [
  // Pain / orthopedic
  { patterns: ['back pain','backache','spine','spinal','orthopedic','orthopaedic','lumbar','posture','sore back','back support'], category: null, keywords: ['ortho','firm','coir'], label: '🩺 Back Pain Relief', boost: 'ortho' },
  { patterns: ['hip pain','hip','shoulder pain','shoulder','joint pain','pressure point'], category: null, keywords: ['soft','foam','latex'], label: '💆 Pressure Relief', boost: 'soft' },

  // Sleep position
  { patterns: ['side sleeper','side sleep','sleep on side'], category: null, keywords: ['soft','foam','latex'], label: '😴 For Side Sleepers', boost: 'soft' },
  { patterns: ['back sleeper','sleep on back','flat sleep'], category: null, keywords: ['firm','coir','ortho','spring'], label: '😌 For Back Sleepers', boost: 'firm' },
  { patterns: ['stomach sleeper','sleep on stomach','front sleep'], category: null, keywords: ['firm','coir'], label: '😪 For Stomach Sleepers', boost: 'firm' },

  // Temperature
  { patterns: ['hot sleep','sleep hot','cool','cooling','summer','sweat','temperature'], category: 'spring', keywords: ['spring','latex'], label: '❄️ Cooling & Breathable', boost: 'spring' },
  { patterns: ['cold sleep','sleep cold','warm mattress','winter'], category: 'softy-foam', keywords: ['foam','soft'], label: '🔥 Heat Retaining', boost: 'foam' },

  // Material intent
  { patterns: ['latex','natural latex','rubber','organic'], category: 'latex', keywords: ['latex'], label: '🌿 Natural Latex', boost: 'latex' },
  { patterns: ['memory foam','foam mattress','memory'], category: 'memory-foam', keywords: ['memory','foam'], label: '🧠 Memory Foam', boost: 'foam' },
  { patterns: ['spring','coil','innerspring','pocket spring'], category: 'spring', keywords: ['spring'], label: '🌀 Spring / Innerspring', boost: 'spring' },
  { patterns: ['coir','coconut','firm coir'], category: 'coir', keywords: ['coir','firm'], label: '🥥 Coir / Firm', boost: 'coir' },
  { patterns: ['soft foam','softy','plush','cloud','squishy'], category: 'softy-foam', keywords: ['soft','foam','plush'], label: '☁️ Soft & Plush', boost: 'soft' },

  // Budget
  { patterns: ['cheap','budget','affordable','low price','economical','under 10000','under 15000'], category: null, keywords: [], label: '💰 Budget Friendly', priceMax: 15000 },
  { patterns: ['luxury','premium','best quality','top quality','high end'], category: null, keywords: [], label: '👑 Luxury / Premium', priceMin: 50000 },
  { patterns: ['mid range','middle','moderate price'], category: null, keywords: [], label: '💳 Mid-Range', priceMin: 15000, priceMax: 35000 },

  // Body type
  { patterns: ['heavy','overweight','plus size','large body','obese','100kg','90kg'], category: null, keywords: ['firm','coir','ortho','spring'], label: '💪 Heavy Duty Support', boost: 'firm' },
  { patterns: ['lightweight','slim','thin','light body'], category: null, keywords: ['soft','foam','latex'], label: '🌸 Light & Soft', boost: 'soft' },

  // Partner
  { patterns: ['partner','couple','two person','share bed','motion isolation','disturb'], category: null, keywords: ['foam','latex'], label: '👫 Motion Isolation', boost: 'foam' },

  // Durability
  { patterns: ['durable','long lasting','last long','years'], category: 'latex', keywords: ['latex','coir'], label: '🛡️ Long Lasting', boost: 'latex' },

  // Generic quality
  { patterns: ['best','top rated','popular','recommended'], category: null, keywords: [], label: '⭐ Top Rated', sortBy: 'rating' },
];

function parseIntent(rawQuery) {
  const q = rawQuery.toLowerCase().trim();
  const matched = [];
  for (const intent of INTENT_MAP) {
    if (intent.patterns.some(p => q.includes(p))) {
      matched.push(intent);
    }
  }
  return matched;
}

// ====================
// Smart Search
// ====================
router.get('/smart-search', async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    if (!rawQuery) return res.json({ success: true, data: { products: [], intents: [], query: '' } });

    const intents = parseIntent(rawQuery);
    const intentLabels = [];
    let products = [];

    if (intents.length > 0) {
      // ── Tier 1: Collect signals ─────────────────────────────────────
      let preferredCategories = [];
      let boostKeywords = [];
      let priceFilter = {};
      let sortByRating = false;

      for (const intent of intents) {
        if (intent.label) intentLabels.push(intent.label);
        if (intent.category) preferredCategories.push(intent.category);
        if (intent.boost) boostKeywords.push(intent.boost);
        if (intent.priceMax !== undefined) priceFilter.$lte = Math.min(priceFilter.$lte || Infinity, intent.priceMax);
        if (intent.priceMin !== undefined) priceFilter.$gte = Math.max(priceFilter.$gte || 0, intent.priceMin);
        if (intent.sortBy === 'rating') sortByRating = true;
      }

      // ── Tier 1a: Try keyword match in name/description ───────────────
      if (boostKeywords.length > 0) {
        const orClauses = boostKeywords.flatMap(k => [
          { name: { $regex: k, $options: 'i' } },
          { description: { $regex: k, $options: 'i' } },
        ]);
        const filter1 = { $or: orClauses };
        if (Object.keys(priceFilter).length) filter1.price = priceFilter;
        products = await Product.find(filter1).sort({ rating: -1 }).limit(8);
      }

      // ── Tier 1b: Category match if keyword gave < 2 results ──────────
      if (products.length < 2 && preferredCategories.length > 0) {
        const filter2 = { category: { $in: preferredCategories } };
        if (Object.keys(priceFilter).length) filter2.price = priceFilter;
        const extra = await Product.find(filter2).sort({ rating: -1 }).limit(8);
        const seen = new Set(products.map(p => p._id.toString()));
        products = [...products, ...extra.filter(p => !seen.has(p._id.toString()))].slice(0, 8);
      }

      // ── Tier 1c: Price-only filter (for budget/luxury intents) ────────
      if (products.length < 2 && Object.keys(priceFilter).length > 0) {
        const extra = await Product.find({ price: priceFilter }).sort({ rating: -1 }).limit(8);
        const seen = new Set(products.map(p => p._id.toString()));
        products = [...products, ...extra.filter(p => !seen.has(p._id.toString()))].slice(0, 8);
      }

      // ── Tier 1d: Top rated fallback if still nothing ──────────────────
      if (products.length === 0 || sortByRating) {
        const topRated = await Product.find({}).sort({ rating: -1 }).limit(8);
        if (products.length === 0) {
          products = topRated;
        } else if (sortByRating) {
          products = products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
      }

    } else {
      // ── Tier 2: Plain text search (no intent matched) ─────────────────
      products = await Product.find({
        $or: [
          { name: { $regex: rawQuery, $options: 'i' } },
          { description: { $regex: rawQuery, $options: 'i' } },
          { category: { $regex: rawQuery, $options: 'i' } },
        ]
      }).sort({ rating: -1 }).limit(8);
    }

    // ── Tier 3: Universal fallback — always return something ─────────────
    if (products.length === 0) {
      products = await Product.find({}).sort({ rating: -1 }).limit(6);
    }

    res.json({
      success: true,
      data: {
        products,
        intents: [...new Set(intentLabels)],
        query: rawQuery,
      }
    });
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ success: false, message: 'Search error' });
  }
});
// ====================
// Dynamic Pricing Predictor (Admin Only)
// ====================
router.get('/price-predictor/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // 1. Gather Demand Data (Views)
    const viewCount = await Interaction.countDocuments({ product: product._id, type: 'view' });
    
    // 2. Gather Previous Sales
    const orders = await Order.find({ 'products.product': product._id });
    const salesCount = orders.reduce((acc, order) => {
      const item = order.products.find(p => p.product.toString() === product._id.toString());
      return acc + (item ? item.quantity : 0);
    }, 0);

    // 3. Seasonality Logic
    const currentMonth = new Date().getMonth(); // 0-11
    const isHolidaySeason = [9, 10, 11, 0].includes(currentMonth); // Oct-Jan

    // 4. Competitor Price Simulation (Dummy)
    const competitorPrice = product.price * (0.9 + Math.random() * 0.2); // +/- 10%

    // 5. Prediction Logic
    let discountPercent = 0;
    const insights = [];

    // Inventory strategy
    if (product.stock > 50 && salesCount < 5) {
      discountPercent += 15;
      insights.push('High inventory depth with low sales velocity detected.');
    } else if (product.stock > 20 && salesCount < 10) {
      discountPercent += 5;
      insights.push('Surplus stock relative to recent sales performance.');
    }

    // Conversion optimization
    const conversionRate = viewCount > 0 ? (salesCount / viewCount) : 0;
    if (conversionRate < 0.02 && viewCount > 50) {
      discountPercent += 10;
      insights.push('High interest (views) but low conversion. Price optimization recommended.');
    }

    // Competitive positioning
    if (product.price > competitorPrice) {
      discountPercent += 5;
      insights.push(`Average market price for similar products is lower (≈ ₹${competitorPrice.toFixed(0)}).`);
    }

    // Seasonal boost
    if (isHolidaySeason) {
      discountPercent += 5;
      insights.push('Active holiday window: suggest tactical discount to capture seasonal traffic.');
    }

    // Final calculations
    discountPercent = Math.min(discountPercent, 35); // Cap at 35%
    if (discountPercent === 0) discountPercent = 5; // Minimal nudge if no strong signals
    
    const suggestedPrice = product.price * (1 - discountPercent / 100);

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          category: product.category
        },
        prediction: {
          currentPrice: product.price,
          suggestedDiscount: `${discountPercent}%`,
          suggestedPrice: Math.round(suggestedPrice),
          potentialVolumeLift: '20-25%'
        },
        metrics: {
          totalViews: viewCount,
          totalSales: salesCount,
          stockLevel: product.stock,
          competitorIndex: (product.price / competitorPrice).toFixed(2),
          conversionRate: (conversionRate * 100).toFixed(2) + '%'
        },
        insights
      }
    });

  } catch (error) {
    console.error('Price predictor error:', error);
    res.status(500).json({ success: false, message: 'Pricing analysis failed' });
  }
});


// ====================
// Get All Products (with pagination + search + filter)
// ====================
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['latex', 'coir', 'memory-foam', 'softy-foam', 'spring']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products' });
  }
});


// ====================
// Get Products by IDs (for comparison)
// ====================
router.get('/by-ids', async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ success: false, message: 'Product IDs are required' });
    }

    // Convert to array if single ID is passed
    const idArray = Array.isArray(ids) ? ids : ids.split(',');

    // Validate IDs format (basic ObjectId validation)
    const invalidIds = idArray.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid product IDs: ${invalidIds.join(', ')}` });
    }

    // Fetch products by IDs
    const products = await Product.find({
      _id: { $in: idArray }
    }).select('_id name price rating numreviews stock brand description image category');

    // Return only products that were found
    res.json({ success: true, data: { products } });
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    res.status(500).json({ success: false, message: 'Error fetching products by IDs' });
  }
});

// ====================
// Get Single Product
// ====================
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Log view interaction asynchronously (don't block the response)
    const Interaction = require('../models/Interaction');
    Interaction.create({
      product: product._id,
      user: req.user?._id, // Might be null for guests
      type: 'view'
    }).catch(err => console.error('Error logging interaction:', err));

    res.json({ success: true, data: { product } });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(500).json({ success: false, message: 'Error fetching product' });
  }
});

// ====================
// Create Product (Admin Only)
// ====================
router.post('/', protect, admin, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image').notEmpty().withMessage('Product image is required'),
  body('category').isIn(['latex', 'coir', 'memory-foam', 'softy-foam', 'spring']).withMessage('Invalid category'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const product = await Product.create(req.body);

    res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Error creating product: ' + error.message });
  }
});

// ====================
// Update Product (Admin Only)
// ====================
router.put('/:id', protect, admin, [
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('image').optional().notEmpty().withMessage('Product image cannot be empty'),
  body('category').optional().isIn(['latex', 'coir', 'memory-foam', 'softy-foam', 'spring']).withMessage('Invalid category'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: { product } });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Error updating product: ' + error.message });
  }
});
// Add this to your backend routes


// ====================
// Delete Product (Admin Only)
// ====================
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
});

// ====================
// Bulk Upload Images (Admin Only)
// ====================
router.post('/upload/images', protect, admin, upload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded'
      });
    }

    const imageData = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      filepath: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({
      success: true,
      message: `${imageData.length} images uploaded successfully`,
      data: {
        images: imageData
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

// ====================
// Bulk Create Products (Admin Only)
// ====================
router.post('/bulk/create', protect, admin, async (req, res) => {
  try {
    await bulkCreateProducts(req, res);
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create products',
      error: error.message
    });
  }
});

module.exports = router;
