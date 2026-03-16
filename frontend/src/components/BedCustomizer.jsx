import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiAlertCircle, FiCheck, FiShoppingCart } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';
import { useAuth } from '../context/useAuth';
import CustomizationPreview from '../components/CustomizationPreview';
import {
  CUSTOMIZATION_OPTIONS,
  calculatePriceModifier,
  validateCustomization,
  generateCustomizationSummary
} from '../utils/customizationConfig';
import { formatPrice } from '../utils/helpers';

/**
 * BedCustomizer Component
 * Complete interface for customizing bed/mattress products
 * Allows users to select size, color, material, and additional features
 * Includes real-time preview and dynamic pricing
 */
const BedCustomizer = ({ product, onCustomizationComplete }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError, showWarning } = useNotification();
  const { user } = useAuth();

  // Customization selections state
  const [selections, setSelections] = useState({
    size: null,
    color: null,
    material: null,
    features: [],
    customWidth: null,
    customLength: null
  });

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Calculate price
  const priceModifier = calculatePriceModifier(selections);
  const basePrice = product?.price || 0;
  const totalPrice = basePrice + priceModifier;

  /**
   * Handle size selection
   */
  const handleSizeChange = (sizeKey) => {
    setSelections(prev => ({
      ...prev,
      size: sizeKey,
      // Reset custom dimensions if switching from custom
      customWidth: sizeKey === 'custom' ? prev.customWidth : null,
      customLength: sizeKey === 'custom' ? prev.customLength : null
    }));
    setValidationErrors([]);
  };

  /**
   * Handle color selection
   */
  const handleColorChange = (colorKey) => {
    setSelections(prev => ({
      ...prev,
      color: colorKey
    }));
    setValidationErrors([]);
  };

  /**
   * Handle material selection
   */
  const handleMaterialChange = (materialKey) => {
    setSelections(prev => ({
      ...prev,
      material: materialKey
    }));
    setValidationErrors([]);
  };

  /**
   * Handle feature selection/deselection
   */
  const handleFeatureToggle = (featureKey) => {
    setSelections(prev => ({
      ...prev,
      features: prev.features.includes(featureKey)
        ? prev.features.filter(f => f !== featureKey)
        : [...prev.features, featureKey]
    }));
  };

  /**
   * Handle custom dimensions input
   */
  const handleCustomDimension = (dimension, value) => {
    const numValue = parseFloat(value) || null;
    setSelections(prev => ({
      ...prev,
      [dimension]: numValue && numValue > 0 ? numValue : null
    }));
  };

  /**
   * Handle add to cart with customization
   */
  const handleAddToCart = async () => {
    // Validate selections
    const validation = validateCustomization(selections);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showError('Please complete all required selections');
      return;
    }

    setIsAddingToCart(true);

    try {
      // Create customization summary
      const customizationSummary = generateCustomizationSummary(selections);

      // Create customized product object
      const customizedProduct = {
        ...product,
        id: product._id || product.id,
        productId: product._id || product.id,
        customization: {
          selections: selections,
          summary: customizationSummary,
          priceModifier: priceModifier,
          basePrice: basePrice,
          totalPrice: totalPrice
        },
        price: totalPrice, // Override price with customization total
        name: `${product.name} - Custom (${customizationSummary.size}, ${customizationSummary.color})`
      };

      // Add to cart
      await addToCart(customizedProduct, 1);
      showSuccess('Customized bed added to cart!');

      // Callback if provided
      if (onCustomizationComplete) {
        onCustomizationComplete(customizedProduct);
      }

      // Navigate to cart after short delay
      setTimeout(() => {
        navigate('/cart');
      }, 1500);
    } catch (error) {
      console.error('Error adding customized product to cart:', error);
      showError('Failed to add to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Handle buy now with customization
   */
  const handleBuyNow = async () => {
    // Validate selections
    const validation = validateCustomization(selections);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showError('Please complete all required selections');
      return;
    }

    // Create customization summary
    const customizationSummary = generateCustomizationSummary(selections);

    // Create customized product object
    const customizedProduct = {
      ...product,
      id: product._id || product.id,
      productId: product._id || product.id,
      quantity: 1,
      customization: {
        selections: selections,
        summary: customizationSummary,
        priceModifier: priceModifier,
        basePrice: basePrice,
        totalPrice: totalPrice
      },
      price: totalPrice,
      name: `${product.name} - Custom (${customizationSummary.size}, ${customizationSummary.color})`
    };

    try {
      navigate('/checkout', {
        state: {
          buyNowItem: customizedProduct
        }
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
      showError('Failed to proceed to checkout');
    }
  };

  if (!product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 80px)' }}>
      <div className="container">
        {/* Header */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4f46e5',
              fontSize: '1.5rem'
            }}
            title="Go back"
          >
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{
              margin: '0',
              fontSize: '1.8rem',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Customize Your {product.name}
            </h1>
            <p style={{
              margin: '0.5rem 0 0 0',
              fontSize: '0.95rem',
              color: '#6b7280'
            }}>
              Personalize your mattress with your preferred size, color, material, and features
            </p>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div style={{
            marginBottom: '1.5rem',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start'
          }}>
            <FiAlertCircle style={{
              color: '#dc2626',
              marginTop: '2px',
              flexShrink: 0
            }} />
            <div>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: '#991b1b',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}>
                Please complete your selection:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#7f1d1d'
              }}>
                {validationErrors.map((error, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
          marginBottom: '2rem'
        }}>
          {/* Left: Customization Options */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {/* Size Selection */}
            <div className="card" style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📏 Select Size
                <span style={{
                  background: selections.size ? '#10b981' : '#e5e7eb',
                  color: selections.size ? 'white' : '#9ca3af',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginLeft: 'auto'
                }}>
                  {selections.size ? <FiCheck size={14} /> : '○'}
                </span>
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {Object.entries(CUSTOMIZATION_OPTIONS.sizes).map(([key, size]) => (
                  <button
                    key={key}
                    onClick={() => handleSizeChange(key)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selections.size === key ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                      background: selections.size === key ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      if (selections.size !== key) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selections.size !== key) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <p style={{
                      margin: '0 0 0.25rem 0',
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '0.95rem'
                    }}>
                      {size.label}
                    </p>
                    {size.priceModifier !== 0 && (
                      <p style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        {size.priceModifier > 0 ? '+' : ''}₹{size.priceModifier.toLocaleString('en-IN')}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Dimensions */}
              {selections.size === 'custom' && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.75rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    fontSize: '0.875rem'
                  }}>
                    Enter Custom Dimensions (in cm)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <input
                      type="number"
                      placeholder="Width (cm)"
                      value={selections.customWidth || ''}
                      onChange={(e) => handleCustomDimension('customWidth', e.target.value)}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.95rem'
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Length (cm)"
                      value={selections.customLength || ''}
                      onChange={(e) => handleCustomDimension('customLength', e.target.value)}
                      style={{
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                  {selections.customWidth && selections.customLength && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.8rem',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <FiCheck size={14} /> {selections.customWidth} × {selections.customLength} cm
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="card" style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🎨 Select Color
                <span style={{
                  background: selections.color ? '#10b981' : '#e5e7eb',
                  color: selections.color ? 'white' : '#9ca3af',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginLeft: 'auto'
                }}>
                  {selections.color ? <FiCheck size={14} /> : '○'}
                </span>
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {Object.entries(CUSTOMIZATION_OPTIONS.colors).map(([key, color]) => (
                  <button
                    key={key}
                    onClick={() => handleColorChange(key)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selections.color === key ? '3px solid #4f46e5' : '2px solid #e5e7eb',
                      background: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}
                    onMouseEnter={e => {
                      if (selections.color !== key) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selections.color !== key) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: color.hex,
                      borderRadius: '6px',
                      border: '2px solid #ccc'
                    }} />
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <p style={{
                        margin: '0',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '0.95rem'
                      }}>
                        {color.label}
                      </p>
                      {color.priceModifier > 0 && (
                        <p style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          +₹{color.priceModifier}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="card" style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🛏️ Select Material
                <span style={{
                  background: selections.material ? '#10b981' : '#e5e7eb',
                  color: selections.material ? 'white' : '#9ca3af',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  marginLeft: 'auto'
                }}>
                  {selections.material ? <FiCheck size={14} /> : '○'}
                </span>
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {Object.entries(CUSTOMIZATION_OPTIONS.materials).map(([key, material]) => (
                  <button
                    key={key}
                    onClick={() => handleMaterialChange(key)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selections.material === key ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                      background: selections.material === key ? '#eef2ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      if (selections.material !== key) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                        e.currentTarget.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={e => {
                      if (selections.material !== key) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <p style={{
                      margin: '0 0 0.25rem 0',
                      fontWeight: '600',
                      color: '#1f2937',
                      fontSize: '0.95rem'
                    }}>
                      {material.label}
                    </p>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      {material.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      <span>Firmness: {material.firmness}</span>
                      {material.priceModifier !== 0 && (
                        <>
                          <span>•</span>
                          <span style={{ color: material.priceModifier > 0 ? '#059669' : '#dc2626' }}>
                            {material.priceModifier > 0 ? '+' : ''}₹{material.priceModifier.toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Features */}
            <div className="card" style={{
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#1f2937'
              }}>
                ✨ Additional Features (Optional)
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '0.75rem'
              }}>
                {Object.entries(CUSTOMIZATION_OPTIONS.features).map(([key, feature]) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      background: selections.features.includes(key) ? '#eef2ff' : 'white'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = selections.features.includes(key) ? '#eef2ff' : '#f9fafb';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = selections.features.includes(key) ? '#eef2ff' : 'white';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selections.features.includes(key)}
                      onChange={() => handleFeatureToggle(key)}
                      style={{
                        width: '20px',
                        height: '20px',
                        marginTop: '2px',
                        cursor: 'pointer',
                        accentColor: '#4f46e5'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: '0 0 0.25rem 0',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '0.95rem'
                      }}>
                        {feature.icon} {feature.label}
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '0.8rem',
                        color: '#6b7280'
                      }}>
                        {feature.description}
                      </p>
                    </div>
                    <p style={{
                      margin: '0',
                      fontWeight: '600',
                      color: '#10b981',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap'
                    }}>
                      +₹{feature.price.toLocaleString('en-IN')}
                    </p>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview and Summary */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            position: 'sticky',
            top: '20px'
          }}>
            {/* Preview */}
            <CustomizationPreview
              selections={selections}
              basePrice={basePrice}
              totalPrice={totalPrice}
            />

            {/* Selected Features Summary */}
            {selections.features.length > 0 && (
              <div className="card" style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                background: '#f0fdf4'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  ✅ Your Selected Features
                </h4>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {selections.features.map(featureKey => {
                    const feature = CUSTOMIZATION_OPTIONS.features[featureKey];
                    return (
                      <div
                        key={featureKey}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.875rem',
                          color: '#1f2937'
                        }}
                      >
                        <span>
                          {feature.icon} {feature.label}
                        </span>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          +₹{feature.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: isAddingToCart ? 0.7 : 1
                }}
                onMouseEnter={e => {
                  if (!isAddingToCart) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 20px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isAddingToCart ? (
                  <>⏳ Adding...</>
                ) : (
                  <>
                    <FiShoppingCart /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isAddingToCart}
                style={{
                  padding: '1rem',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isAddingToCart ? 0.7 : 1
                }}
                onMouseEnter={e => {
                  if (!isAddingToCart) {
                    e.currentTarget.style.background = '#eef2ff';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Help Text */}
            <p style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: 0
            }}>
              💡 Customize to your preference and add to cart. You can review your customization before checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedCustomizer;
