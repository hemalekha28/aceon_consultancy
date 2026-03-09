import React, { useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiCheckCircle, FiAlertCircle, FiX, FiArrowLeft } from 'react-icons/fi';
import { api } from '../utils/api';
import '../styles/BulkProductUpload.css';

const BulkProductUpload = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('upload'); // 'upload', 'details', 'uploading', 'success'
  const [uploadedImages, setUploadedImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [successSummary, setSuccessSummary] = useState(null);
  const fileInputRef = useRef(null);

  const categories = ['latex', 'coir', 'memory-foam', 'softy-foam', 'spring'];

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 4000);
  };

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (files.length > 50) {
      showNotification('error', 'Maximum 50 images can be uploaded at once');
      return;
    }

    // Validate file types
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        showNotification('error', `${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        showNotification('error', `${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload images to server
      const response = await api.uploadProductImages(validFiles);

      if (response.success && response.data?.images) {
        const newImages = response.data.images;
        setUploadedImages([...uploadedImages, ...newImages]);

        // Initialize product form for each new image
        const newProducts = newImages.map(image => ({
          image: image.filename,
          originalFileName: image.originalName,
          previewUrl: image.filepath,
          name: '',
          price: '',
          stock: '',
          category: 'latex',
          description: '',
          size: '',
          material: ''
        }));

        setProducts([...products, ...newProducts]);
        showNotification('success', `${newImages.length} images uploaded successfully!`);

        if (newImages.length > 0) {
          setStep('details');
        }
      } else {
        showNotification('error', response.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      if (!newErrors[index]) newErrors[index] = {};
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validateProducts = () => {
    const newErrors = {};
    let hasErrors = false;

    products.forEach((product, index) => {
      const fieldErrors = {};

      // Validate required fields
      if (!product.name?.trim()) {
        fieldErrors.name = 'Product name is required';
        hasErrors = true;
      }

      if (!product.price || parseFloat(product.price) <= 0) {
        fieldErrors.price = 'Valid price is required';
        hasErrors = true;
      }

      if (!product.stock || parseInt(product.stock) < 0) {
        fieldErrors.stock = 'Valid stock quantity is required';
        hasErrors = true;
      }

      if (!product.description?.trim()) {
        fieldErrors.description = 'Product description is required';
        hasErrors = true;
      }

      if (!product.category) {
        fieldErrors.category = 'Category is required';
        hasErrors = true;
      }

      if (Object.keys(fieldErrors).length > 0) {
        newErrors[index] = fieldErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleRemoveProduct = (index) => {
    const newProducts = products.filter((_, i) => i !== index);
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setProducts(newProducts);
    setUploadedImages(newImages);

    // Clear errors for removed product
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    if (!validateProducts()) {
      showNotification('error', 'Please fix the errors above before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.bulkCreateProducts(products);

      if (response.success) {
        setSuccessSummary({
          created: response.data.created,
          failed: response.data.failed,
          createdProducts: response.data.createdProducts,
          errors: response.data.errors
        });
        setStep('success');
        showNotification('success', `✓ ${response.data.created} products uploaded successfully!`);
      } else {
        showNotification('error', response.message || 'Failed to upload products');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showNotification('error', error.message || 'Failed to submit products');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setUploadedImages([]);
    setProducts([]);
    setErrors({});
    setSuccessSummary(null);
  };

  const handleClose = () => {
    if (step === 'success' && onSuccess) {
      onSuccess();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bulk-upload-container">
      {/* Notification */}
      {notification.show && (
        <div className={`bulk-notification bulk-notification-${notification.type}`}>
          <div className="notification-content">
            {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{notification.message}</span>
          </div>
          <button
            className="notification-close"
            onClick={() => setNotification({ ...notification, show: false })}
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Modal */}
      <div className="bulk-upload-modal-overlay">
        <div className="bulk-upload-modal">
          {/* Header */}
          <div className="bulk-upload-header">
            <div className="header-content">
              <h2 className="modal-title">
                {step === 'upload' && '📸 Bulk Upload Products'}
                {step === 'details' && '📝 Product Details'}
                {step === 'success' && '✅ Upload Complete'}
              </h2>
              <p className="modal-subtitle">
                {step === 'upload' && 'Select multiple product images to get started'}
                {step === 'details' && `Fill in details for ${products.length} product${products.length === 1 ? '' : 's'}`}
                {step === 'success' && 'Your products have been successfully uploaded'}
              </p>
            </div>
            <button className="modal-close" onClick={handleClose}>
              <FiX />
            </button>
          </div>

          {/* Content */}
          <div className="bulk-upload-content">
            {step === 'upload' && (
              <div className="upload-section">
                <div className="upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <FiUpload size={40} />
                    <h3>Choose Images to Upload</h3>
                    <p>Click to select multiple images from your device</p>
                    <span className="file-hint">
                      Supports: JPG, PNG, GIF, WebP • Max 50 images • 5MB each
                    </span>
                  </button>
                </div>

                {uploading && (
                  <div className="uploading-status">
                    <div className="spinner"></div>
                    <p>Uploading images...</p>
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="uploaded-images-preview">
                    <h4>{uploadedImages.length} images ready for details</h4>
                    <div className="images-grid">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="image-thumb">
                          <img src={image.filepath} alt={`Uploaded ${index + 1}`} />
                          <span>{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="upload-actions">
                  {uploadedImages.length > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setStep('details')}
                    >
                      Continue to Details →
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 'details' && (
              <div className="details-section">
                <div className="products-form-list">
                  {products.map((product, index) => (
                    <div key={index} className="product-form-card">
                      <div className="product-form-header">
                        <div className="product-image-preview">
                          <img src={product.previewUrl} alt={product.name || `Product ${index + 1}`} />
                        </div>
                        <div className="product-index">
                          <span>Product {index + 1}</span>
                          {product.originalFileName && (
                            <small>{product.originalFileName}</small>
                          )}
                        </div>
                        <button
                          className="remove-product-btn"
                          onClick={() => handleRemoveProduct(index)}
                          title="Remove this product"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="product-form-body">
                        {/* Product Name */}
                        <div className="form-group">
                          <label className="form-label">
                            Product Name *
                            {errors[index]?.name && (
                              <span className="field-error">{errors[index].name}</span>
                            )}
                          </label>
                          <input
                            type="text"
                            className={`form-input ${errors[index]?.name ? 'input-error' : ''}`}
                            value={product.name}
                            onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                            placeholder="e.g., Premium Memory Foam Mattress 6x6"
                          />
                        </div>

                        {/* Price and Stock (2 cols) */}
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              Price (₹) *
                              {errors[index]?.price && (
                                <span className="field-error">{errors[index].price}</span>
                              )}
                            </label>
                            <input
                              type="number"
                              className={`form-input ${errors[index]?.price ? 'input-error' : ''}`}
                              value={product.price}
                              onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                              min="0"
                              step="100"
                              placeholder="0"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">
                              Stock Quantity *
                              {errors[index]?.stock && (
                                <span className="field-error">{errors[index].stock}</span>
                              )}
                            </label>
                            <input
                              type="number"
                              className={`form-input ${errors[index]?.stock ? 'input-error' : ''}`}
                              value={product.stock}
                              onChange={(e) => handleProductChange(index, 'stock', e.target.value)}
                              min="0"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Category and Material (2 cols) */}
                        <div className="form-row">
                          <div className="form-group">
                            <label className="form-label">
                              Material Type *
                              {errors[index]?.category && (
                                <span className="field-error">{errors[index].category}</span>
                              )}
                            </label>
                            <select
                              className={`form-input ${errors[index]?.category ? 'input-error' : ''}`}
                              value={product.category}
                              onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                            >
                              <option value="">Select a material</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>
                                  {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Size (Optional)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={product.size}
                              onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                              placeholder="e.g., 6x6, Queen"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                          <label className="form-label">
                            Description *
                            {errors[index]?.description && (
                              <span className="field-error">{errors[index].description}</span>
                            )}
                          </label>
                          <textarea
                            className={`form-input form-textarea ${errors[index]?.description ? 'input-error' : ''}`}
                            value={product.description}
                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                            placeholder="Describe the product features, comfort level, benefits, etc."
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'success' && successSummary && (
              <div className="success-section">
                <div className="success-icon">✓</div>
                <h3 className="success-title">All Done!</h3>

                <div className="success-stats">
                  <div className="stat-item">
                    <span className="stat-label">Successfully Created</span>
                    <span className="stat-value success-value">{successSummary.created}</span>
                  </div>
                  {successSummary.failed > 0 && (
                    <div className="stat-item">
                      <span className="stat-label">Failed</span>
                      <span className="stat-value error-value">{successSummary.failed}</span>
                    </div>
                  )}
                </div>

                {successSummary.createdProducts && successSummary.createdProducts.length > 0 && (
                  <div className="created-products-list">
                    <h4>Created Products:</h4>
                    <ul>
                      {successSummary.createdProducts.map((p, idx) => (
                        <li key={idx}>{p.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {successSummary.errors && successSummary.errors.length > 0 && (
                  <div className="errors-list">
                    <h4>Errors:</h4>
                    <ul>
                      {successSummary.errors.map((error, idx) => (
                        <li key={idx}>
                          <strong>{error.productName}</strong>: {error.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bulk-upload-footer">
            {step === 'details' && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep('upload')}
                >
                  <FiArrowLeft /> Back to Upload
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting || products.length === 0}
                >
                  {submitting ? 'Uploading...' : `Upload ${products.length} Product${products.length === 1 ? '' : 's'}`}
                </button>
              </>
            )}

            {step === 'success' && (
              <>
                <button className="btn btn-primary" onClick={handleReset}>
                  Upload More Products
                </button>
                <button className="btn btn-secondary" onClick={handleClose}>
                  Close
                </button>
              </>
            )}

            {step === 'upload' && (
              <button className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;
