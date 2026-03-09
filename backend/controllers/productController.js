const Product = require("../models/Product");
// Create Product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by IDs for comparison
const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    // Convert to array if single ID is passed
    const idArray = Array.isArray(ids) ? ids : ids.split(',');
    
    // Validate IDs format (basic ObjectId validation)
    const invalidIds = idArray.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: `Invalid product IDs: ${invalidIds.join(', ')}` });
    }

    // Fetch products by IDs
    const products = await Product.find({
      _id: { $in: idArray }
    }).select('_id name price rating numreviews stock brand description image category');

    // Return only products that were found
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.description = req.body.description || product.description;
  product.stock = req.body.stock || product.stock;

  const updated = await product.save();
  res.json(updated);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await product.deleteOne();
  res.json({ message: "Product deleted" });
};

// Bulk Create Products
const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;

    // Validation
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Products array is required and cannot be empty'
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload more than 100 products at once'
      });
    }

    const createdProducts = [];
    const errors = [];

    // Create each product
    for (let i = 0; i < products.length; i++) {
      try {
        const productData = {
          name: products[i].name?.trim(),
          description: products[i].description?.trim(),
          price: parseFloat(products[i].price),
          stock: parseInt(products[i].stock),
          category: products[i].category?.trim(),
          image: products[i].image, // Should be filename from upload
          size: products[i].size?.trim() || null,
          material: products[i].material?.trim() || null
        };

        // Validate required fields
        if (!productData.name) throw new Error('Product name is required');
        if (!productData.description) throw new Error('Product description is required');
        if (isNaN(productData.price) || productData.price < 0) throw new Error('Valid price is required');
        if (isNaN(productData.stock) || productData.stock < 0) throw new Error('Valid stock quantity is required');
        if (!productData.category) throw new Error('Product category is required');
        if (!productData.image) throw new Error('Product image is required');

        // Validate category enum
        const validCategories = ['latex', 'coir', 'memory-foam', 'softy-foam', 'spring'];
        if (!validCategories.includes(productData.category)) {
          throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }

        const createdProduct = await Product.create(productData);
        createdProducts.push({
          id: createdProduct._id,
          name: createdProduct.name,
          success: true
        });

      } catch (error) {
        errors.push({
          index: i,
          productName: products[i].name || 'Unknown',
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdProducts.length} products${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
      data: {
        created: createdProducts.length,
        failed: errors.length,
        createdProducts,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk upload',
      error: error.message
    });
  }
};

module.exports = { 
  createProduct, 
  getProducts, 
  getProductsByIds, 
  updateProduct, 
  deleteProduct,
  bulkCreateProducts
};
