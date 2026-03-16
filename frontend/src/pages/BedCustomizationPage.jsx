import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';
import BedCustomizer from '../components/BedCustomizer';

/**
 * BedCustomizationPage Component
 * Page wrapper for bed customization feature
 * Handles product loading and customization flow
 */
const BedCustomizationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch product data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!isMounted) return;

        if (data.success && data.data.product) {
          setProduct(data.data.product);
        } else {
          setError(data.message || 'Failed to load product');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        if (isMounted) {
          setError('Failed to load product. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle customization completion
  const handleCustomizationComplete = (customizedProduct) => {
    console.log('Customized product:', customizedProduct);
    // Additional logic if needed (e.g., analytics tracking)
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2rem',
            marginBottom: '1rem',
            color: '#667eea',
            animation: 'spin 1s linear infinite'
          }}>
            <FiLoader size={48} />
          </div>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading customization options...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#fee2e2',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            color: '#dc2626'
          }}>
            <FiAlertCircle size={48} />
          </div>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: '#991b1b',
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            Oops! Something went wrong
          </h3>
          <p style={{
            margin: '0 0 1.5rem 0',
            color: '#7f1d1d',
            fontSize: '0.95rem'
          }}>
            {error}
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
            onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // No product found
  if (!product) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: '#fef3c7',
          borderRadius: '12px',
          border: '1px solid #fcd34d',
          maxWidth: '400px'
        }}>
          <h3 style={{
            margin: '0 0 0.5rem 0',
            color: '#92400e',
            fontSize: '1.1rem',
            fontWeight: '700'
          }}>
            Product not found
          </h3>
          <p style={{
            margin: '0 0 1.5rem 0',
            color: '#78350f',
            fontSize: '0.95rem'
          }}>
            The product you're trying to customize doesn't exist.
          </p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#d97706'}
            onMouseLeave={e => e.currentTarget.style.background = '#f59e0b'}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // Render customizer
  return (
    <BedCustomizer
      product={product}
      onCustomizationComplete={handleCustomizationComplete}
    />
  );
};

export default BedCustomizationPage;
