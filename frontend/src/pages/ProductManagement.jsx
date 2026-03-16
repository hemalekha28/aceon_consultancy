import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertCircle, FiCheckCircle, FiUploadCloud, FiTrendingUp, FiInfo, FiTag, FiBarChart2 } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';
import { constructImageUrl } from '../utils/imageUtils';
import BulkProductUpload from '../components/BulkProductUpload';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: ''
  });
  const [predictionData, setPredictionData] = useState(null);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, price, category, description, image, stock } = formData;

    if (!name.trim()) return 'Product name is required';
    if (!price || parseFloat(price) < 0) return 'Valid price is required';
    if (!category) return 'Category is required';
    if (!description.trim()) return 'Description is required';
    if (!image.trim()) return 'Image URL is required';
    if (!stock || parseInt(stock) < 0) return 'Valid stock quantity is required';

    // Basic URL validation - allow relative paths or filenames
    if (image.trim() && !image.startsWith('http') && !image.startsWith('https') && !image.startsWith('/')) {
      // It's likely a filename, which is fine
    } else if (image.trim() && (image.startsWith('http') || image.startsWith('https'))) {
      try {
        new URL(image);
      } catch {
        return 'Please enter a valid image URL';
      }
    } else if (!image.trim()) {
      return 'Image URL or filename is required';
    }


    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showNotification('error', validationError);
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, productData);
        showNotification('success', 'Product updated successfully!');
      } else {
        await api.addProduct(productData);
        showNotification('success', 'Product added successfully!');
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('error', error.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await api.deleteProduct(productId);
        await loadProducts();
        showNotification('success', 'Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('error', 'Failed to delete product. Please try again.');
      }
    }
  };

  const handlePredictPrice = async (productId) => {
    try {
      setLoadingPrediction(true);
      setShowPredictionModal(true);
      const data = await api.getPricePrediction(productId);
      setPredictionData(data.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      showNotification('error', 'Failed to fetch pricing prediction.');
      setShowPredictionModal(false);
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleApplyPredictedPrice = () => {
    if (!predictionData) return;
    
    const product = products.find(p => p._id === predictionData.product.id || p.id === predictionData.product.id);
    if (!product) return;

    // Open the existing edit modal with all fields and the NEW suggested price
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: predictionData.prediction.suggestedPrice.toString(),
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock.toString()
    });

    setShowPredictionModal(false);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      image: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    'latex',
    'coir',
    'memory-foam',
    'softy-foam',
    'spring'
  ];

  return (
    <div className="container">
      {/* Notification */}
      {notification.show && (
        <div
          className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '300px'
          }}
        >
          {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {notification.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Product Management</h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="btn btn-secondary"
            title="Upload multiple products at once"
          >
            <FiUploadCloud />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <FiPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', minWidth: '300px' }}
              />
              <FiSearch
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--gray-400)'
                }}
              />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <div style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>
                {searchQuery ? 'No products found matching your search.' : 'No products available. Add your first product!'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id || product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={constructImageUrl(product.image)}
                            alt={product.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: 'var(--border-radius)'
                            }}
                            onError={(e) => {
                              // Create a simple fallback image using canvas
                              const canvas = document.createElement('canvas');
                              canvas.width = 50;
                              canvas.height = 50;
                              const ctx = canvas.getContext('2d');
                              ctx.fillStyle = '#f0f0f0';
                              ctx.fillRect(0, 0, 50, 50);
                              ctx.fillStyle = '#666';
                              ctx.font = '10px Arial';
                              ctx.textAlign = 'center';
                              ctx.fillText('Product', 25, 30);
                              e.target.src = canvas.toDataURL();
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              ID: {product._id || product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {product.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td>
                        <span style={{
                          color: product.stock < 10 ? 'var(--danger)' : 'var(--gray-700)',
                          fontWeight: product.stock < 10 ? '600' : 'normal'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${(product.stock ?? 0) > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {(product.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-sm btn-secondary"
                            title="Edit Product"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handlePredictPrice(product._id || product.id)}
                            className="btn btn-sm btn-info"
                            style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                            title="Analyze Pricing"
                          >
                            <FiTrendingUp />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id || product.id, product.name)}
                            className="btn btn-sm btn-danger"
                            title="Delete Product"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  name="image"
                  className="form-input"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
                {formData.image && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting
                  ? (editingProduct ? 'Updating...' : 'Adding...')
                  : (editingProduct ? 'Update Product' : 'Add Product')
                }
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Pricing Prediction Modal */}
      {showPredictionModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <FiTrendingUp style={{ marginRight: '0.5rem' }} />
                AI Dynamic Pricing Analysis
              </h3>
              <button onClick={() => setShowPredictionModal(false)} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              {loadingPrediction ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
                  <p>Analyzing demand patterns, stock velocity, and competitor trends...</p>
                </div>
              ) : predictionData ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ 
                    background: 'var(--bg-secondary)', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-light)'
                  }}>
                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{predictionData.product.name}</h4>
                    <div className="grid grid-2" style={{ gap: '1rem' }}>
                      <div className="stat-card" style={{ padding: '1rem', background: 'white' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suggested Discount</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent)' }}>
                          {predictionData.prediction.suggestedDiscount}
                        </div>
                      </div>
                      <div className="stat-card" style={{ padding: '1rem', background: 'white' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Optimized Price</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                          {formatPrice(predictionData.prediction.suggestedPrice)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Market Index</div>
                      <div style={{ fontWeight: '700', color: parseFloat(predictionData.metrics.competitorIndex) > 1 ? '#ef4444' : '#10b981' }}>
                        {predictionData.metrics.competitorIndex}x
                      </div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Conv. Rate</div>
                      <div style={{ fontWeight: '700', color: '#6366f1' }}>{predictionData.metrics.conversionRate}</div>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Units Sold</div>
                      <div style={{ fontWeight: '700', color: '#334155' }}>{predictionData.metrics.totalSales}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <FiBarChart2 size={16} color="var(--primary)" />
                      AI Insights
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {predictionData.insights.map((insight, i) => (
                        <div key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'start', 
                          gap: '0.75rem', 
                          fontSize: '0.9rem', 
                          color: 'var(--text-secondary)',
                          padding: '0.5rem',
                          background: '#f8fafc',
                          borderRadius: '6px'
                        }}>
                          <FiInfo size={16} color="var(--accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ 
                    background: 'rgba(99, 102, 241, 0.05)', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    border: '1px dashed var(--accent)',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Estimated Volume Lift: <strong>{predictionData.prediction.potentialVolumeLift}</strong> if price is adjusted.
                    </p>
                  </div>
                </div>
              ) : (
                <p>No analysis data available.</p>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowPredictionModal(false)} className="btn btn-secondary">Close</button>
              {predictionData && (
                <button
                  onClick={handleApplyPredictedPrice}
                  className="btn btn-primary"
                >
                  Use Suggested Price
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkProductUpload
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            setShowBulkUpload(false);
            loadProducts();
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;