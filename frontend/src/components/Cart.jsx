import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useAuth } from '../context/authContext';
import { formatPrice } from '../utils/helpers';
import Image from '../components/Image';
import { constructImageUrl } from '../utils/imageUtils';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();



  // Helper function to get consistent product ID
  const getProductId = (item) => {
    // For database items, use productId field, for local items use _id or id
    if (item.productId) {
      return item.productId.toString();
    }
    return (item._id || item.id)?.toString();
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;

    const productId = getProductId(item);
    console.log('Updating quantity for product:', productId, 'to:', newQuantity);

    // Validate productId before API call
    if (!productId || productId === 'undefined') {
      console.error('Invalid product ID:', productId, 'for item:', item);
      return;
    }

    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (item) => {
    const productId = getProductId(item);
    console.log('Removing product:', productId);

    // Validate productId before API call
    if (!productId || productId === 'undefined') {
      console.error('Invalid product ID:', productId, 'for item:', item);
      return;
    }

    removeFromCart(productId);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0', minHeight: '60vh' }}>
        <div className="card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--gradient-blue-light)',
          border: 'none',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            background: 'var(--gradient-blue-indigo)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <FiShoppingBag size={48} color="white" />
          </div>
          <h2 style={{
            marginBottom: '1rem',
            color: '#1f2937',
            fontSize: '2rem',
            fontWeight: '700'
          }}>Your cart is empty</h2>
          <p style={{
            marginBottom: '2rem',
            color: '#6b7280',
            fontSize: '1.125rem'
          }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="btn btn-primary btn-lg"
            style={{
              background: 'var(--gradient-blue-indigo)',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontWeight: '600',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Header Banner */}
      <div style={{
        background: 'var(--gradient-blue-indigo)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <FiShoppingBag size={28} color="white" />
            </div>
            <div>
              <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: '700', color: 'white' }}>Shopping Cart</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>
          <button
            onClick={clearCart}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <FiTrash2 />
            Clear Cart
          </button>
        </div>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
      </div>

      <div className="grid grid-3" style={{ gap: '2rem' }}>
        {/* Cart Items */}
        <div style={{ gridColumn: '1 / 3' }}>
          <div className="card" style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="card-header" style={{
              background: 'var(--gradient-blue-medium)',
              color: 'white',
              borderBottom: 'none'
            }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiShoppingBag size={20} color="white" />
                Cart Items ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>
            </div>
            <div className="card-body">

              {cartItems.map((item, index) => {
                const productId = getProductId(item);

                // Skip items without valid IDs and log warning
                if (!productId || productId === 'undefined') {
                  console.warn('Skipping cart item with invalid ID:', item);
                  return null;
                }

                // Use productId as key, fallback to index if needed
                const itemKey = productId || `item-${index}`;

                return (
                  <div key={itemKey} className="cart-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
                    marginBottom: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <Link to={`/product/${productId}`}>
                      <Image
                        src={constructImageUrl(item.image) || '/placeholder-product.svg'}
                        alt={item.name}
                        className="cart-item-image"
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                    </Link>

                    <div className="cart-item-info" style={{ flex: 1 }}>
                      <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
                        <h4 className="cart-item-title" style={{
                          fontWeight: 600,
                          marginBottom: '0.25rem',
                          color: '#0F172A'
                        }}>{item.name}</h4>
                      </Link>
                      <p style={{ fontSize: '0.875rem', color: '#737373', margin: '0.25rem 0' }}>
                        Category: {item.category}
                      </p>
                      <div className="cart-item-price" style={{
                        background: 'var(--gradient-blue-dark)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 600
                      }}>
                        {formatPrice(item.price)} each
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="quantity-controls" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid #4169E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s',
                          color: '#4169E1'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#4169E1';
                          e.target.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FFFFFF';
                          e.target.style.color = '#4169E1';
                        }}
                      >
                        <FiMinus />
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                        className="quantity-input"
                        style={{
                          width: '60px',
                          textAlign: 'center',
                          border: '2px solid #4169E1',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          background: '#FFFFFF'
                        }}
                      />

                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid #4169E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s',
                          color: '#4169E1'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#4169E1';
                          e.target.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FFFFFF';
                          e.target.style.color = '#4169E1';
                        }}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="btn btn-danger btn-sm"
                        title="Remove item from cart"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card" style={{
            position: 'sticky',
            top: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="card-header" style={{
              background: 'var(--gradient-blue-light)',
              color: 'white',
              borderBottom: 'none'
            }}>
              <h3 style={{ margin: 0, color: 'white' }}>Order Summary</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Shipping:</span>
                  <div style={{ textAlign: 'right' }}>
                    <span>{formatPrice(shipping)}</span>
                    {shipping === 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                        Free shipping!
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax:</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <hr />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '600' }}>
                  <span>Total:</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {subtotal < 50 && (
                  <div className="alert alert-warning">
                    <small>Add {formatPrice(50 - subtotal)} more for free shipping!</small>
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleProceedToCheckout}
                  className="btn btn-primary btn-full btn-lg"
                  style={{
                    background: 'var(--gradient-blue-indigo)',
                    border: 'none',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
                <Link
                  to="/products"
                  className="btn btn-secondary btn-full"
                  style={{
                    background: 'var(--gradient-blue-medium)',
                    border: 'none',
                    color: 'white',
                    padding: '0.875rem 1.5rem',
                    borderRadius: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px rgba(79, 172, 254, 0.2)',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(79, 172, 254, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 172, 254, 0.2)';
                  }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;