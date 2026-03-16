import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useAuth } from '../context/useAuth';
import { api } from '../utils/api.jsx';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers.jsx';
import Image from '../components/Image';
import { constructImageUrl } from '../utils/imageUtils';
import Chatbot from '../components/Chatbot';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timeline statuses
  const getTimelineSteps = (status) => {
    const steps = [
      { status: 'pending', label: 'Order Placed', icon: FiPackage },
      { status: 'processing', label: 'Processing', icon: FiClock },
      { status: 'shipped', label: 'Shipped', icon: FiTruck },
      { status: 'delivered', label: 'Delivered', icon: FiCheckCircle },
    ];
    
    const statusIndex = steps.findIndex(step => step.status === status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= statusIndex,
      active: index === statusIndex
    }));
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrderDetails();
  }, [orderId, user]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await api.getOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '4px solid var(--gray-200)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '2rem 0', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2rem', border: '2px solid var(--danger)' }}>
          <FiPackage size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--danger)' }}>Order Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error || 'The order you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps(order.status);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--primary)',
            fontSize: '1rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
        >
          <FiArrowLeft size={20} />
          Back to Orders
        </button>
      </div>

      {/* Order Header */}
      <div className="card" style={{
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        color: 'white',
        border: 'none'
      }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
            Order #{order._id?.toString().slice(-8) || order.id}
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Placed on {formatDate(order.createdAt || order.date)}
          </p>
        </div>
      </div>

      {/* Timeline Status */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>
          Order Status
        </h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          marginBottom: '2rem'
        }}>
          {/* Timeline line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--gray-300)',
            zIndex: 0
          }} />
          
          {/* Timeline steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            position: 'relative',
            zIndex: 1
          }}>
            {timelineSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: step.completed ? 'var(--success)' : 'var(--gray-300)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    border: step.active ? '3px solid var(--primary)' : 'none'
                  }}>
                    <Icon size={20} />
                  </div>
                  <p style={{
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: step.active ? '600' : '500',
                    color: step.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'center',
                    maxWidth: '80px'
                  }}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--primary)'
        }}>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
            Current Status: <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{order.status}</span>
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
          Order Summary
        </h2>

        {/* Products */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
            Products ({order.products?.length || 0})
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            {order.products?.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)'
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--gray-200)'
                }}>
                  <Image
                    src={constructImageUrl(item.product?.image || item.image)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                    {item.name}
                  </h4>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'capitalize'
                  }}>
                    Material: {item.category || 'Standard'}
                  </p>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Price: {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600' }}>{formatPrice(order.subtotal)}</span>
            </div>
            
            {order.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <span>Tax:</span>
                <span style={{ fontWeight: '600' }}>{formatPrice(order.tax)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
              <span>Delivery Charge:</span>
              <span style={{ fontWeight: '600' }}>{formatPrice(order.shipping)}</span>
            </div>

            {order.deliveryDetails && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', paddingLeft: '1rem' }}>
                {order.deliveryDetails.baseCharge > 0 && (
                  <p style={{ margin: '0.25rem 0' }}>Base: {formatPrice(order.deliveryDetails.baseCharge)}</p>
                )}
                {order.deliveryDetails.distanceCharge > 0 && (
                  <p style={{ margin: '0.25rem 0' }}>
                    Distance: {formatPrice(order.deliveryDetails.distanceCharge)} ({order.deliveryDetails.distance?.toFixed(1)}km)
                  </p>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiMapPin size={24} />
          Delivery Address
        </h2>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '1.5rem',
          borderRadius: '8px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Full Address
              </p>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {order.shippingAddress?.address || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                City
              </p>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {order.shippingAddress?.city || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                State
              </p>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {order.shippingAddress?.state || order.shippingAddress?.postalCode || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Postal Code
              </p>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {order.shippingAddress?.postalCode || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Order Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Payment Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Payment Details
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Payment Method
              </p>
              <p style={{ margin: 0, fontSize: '1rem', textTransform: 'capitalize' }}>
                {order.paymentMethod?.replace('_', ' ') || 'Cash on Delivery'}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Payment Status
              </p>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                textTransform: 'capitalize',
                color: order.paymentStatus === 'paid' ? 'var(--success)' : 'var(--warning)'
              }}>
                {order.paymentStatus || 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Order Information
          </h2>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Order Number
              </p>
              <p style={{ margin: 0, fontSize: '1rem', fontFamily: 'monospace', fontWeight: '600' }}>
                #{order._id?.toString().slice(-8) || order.id}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Order Date
              </p>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {formatDate(order.createdAt || order.date)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default OrderTracking;
