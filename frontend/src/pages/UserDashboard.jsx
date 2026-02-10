import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingCart, FiHeart, FiPackage, FiEdit, FiEye, FiMessageSquare, FiStar } from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { api } from "../utils/api";
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import Chatbot from '../components/Chatbot';
import Image from '../components/Image';
import { constructImageUrl } from '../utils/imageUtils';

const MIN_REVIEW_LENGTH = 20;

const UserDashboard = () => {
  const { user, updateProfile, setUser } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
    isSubmitting: false
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Load data in a specific order to prioritize what's most important
      const [ordersData, profileDataResponse] = await Promise.all([
        api.getUserOrders().catch(() => []), // Return empty array if fails
        api.getProfile().catch(() => ({}))   // Return empty object if fails
      ]);

      // Set initial data
      setOrders(ordersData || []);

      // Update profile data if available
      const profileSource = profileDataResponse?.data?.user || profileDataResponse?.user;
      if (profileSource) {
        setProfileData(prev => ({
          ...prev,
          name: profileSource.name || prev.name,
          email: profileSource.email || prev.email,
          phone: profileSource.phone || prev.phone,
          address: profileSource.address || prev.address
        }));
      }

      // Load secondary data (reviews and reviewable products)
      try {
        const [reviewableData, reviewsData] = await Promise.all([
          api.getReviewableProducts().catch(() => []),
          api.getUserReviews().catch(() => [])
        ]);

        setReviewableProducts(reviewableData || []);
        setUserReviews(reviewsData || []);
      } catch (error) {
        console.error('Error loading secondary data:', error);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditing(false);
        setProfileData({
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          address: result.user.address || ''
        });
        setUser(result.user);
        showNotification('Profile updated successfully!', 'success');
      } else {
        showNotification(result.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showNotification('An unexpected error occurred', 'error');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '300px';
    notification.style.padding = '12px 16px';
    notification.style.borderRadius = '6px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '8px';
    notification.style.transition = 'all 0.3s ease-in-out';

    const icon = document.createElement('span');
    icon.textContent = type === 'success' ? '✓' : '!';
    icon.style.fontWeight = 'bold';
    icon.style.fontSize = '16px';

    const messageText = document.createElement('span');
    messageText.textContent = message;

    notification.appendChild(icon);
    notification.appendChild(messageText);

    if (type === 'success') {
      notification.style.backgroundColor = '#d1fae5';
      notification.style.color = '#065f46';
      notification.style.borderLeft = '4px solid #10b981';
    } else {
      notification.style.backgroundColor = '#fee2e2';
      notification.style.color = '#b91c1c';
      notification.style.borderLeft = '4px solid #ef4444';
    }

    document.body.appendChild(notification);

    // Auto-remove the notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (reviewForm.isSubmitting) return;

    try {
      // Validate form
      const trimmedComment = reviewForm.comment.trim();

      // Show error if comment is too short
      if (trimmedComment.length < MIN_REVIEW_LENGTH) {
        showNotification(`Review must be at least ${MIN_REVIEW_LENGTH} characters long`, 'error');
        return;
      }

      // Check if we have all required data
      if (!reviewModal?.product?._id || !reviewModal?.orderId) {
        showNotification('Missing required information. Please try again.', 'error');
        return;
      }

      // Set loading state
      setReviewForm(prev => ({ ...prev, isSubmitting: true }));

      // Log the review data for debugging
      console.log(reviewModal.isEditing ? 'Updating review:' : 'Submitting review:', {
        productId: reviewModal.product._id,
        orderId: reviewModal.orderId,
        rating: reviewForm.rating,
        comment: trimmedComment,
        ...(reviewModal.isEditing && { reviewId: reviewModal.reviewId })
      });

      let response;
      if (reviewModal.isEditing) {
        // Update existing review
        response = await api.updateReview(reviewModal.reviewId, {
          rating: reviewForm.rating,
          comment: trimmedComment
        });
      } else {
        // Create new review
        response = await api.createReview({
          productId: reviewModal.product._id,
          orderId: reviewModal.orderId,
          rating: reviewForm.rating,
          comment: trimmedComment
        });
      }

      console.log('Review submission response:', response);

      // Check for successful response - handle both direct data and response.data
      const responseData = response?.data || response;
      if (!responseData || responseData.success === false) {
        throw new Error(responseData?.message || 'Failed to submit review');
      }

      // Show success message
      showNotification(
        reviewModal.isEditing
          ? 'Review updated successfully!'
          : 'Thank you for your review!'
      );

      // Close the modal and reset the form
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '', isSubmitting: false });

      // Refresh the reviews and reviewable products
      try {
        const [reviewsResponse, reviewableResponse] = await Promise.all([
          api.getUserReviews(),
          api.getReviewableProducts()
        ]);

        // Handle the responses - check both direct response and response.data
        const reviewsData = Array.isArray(reviewsResponse)
          ? reviewsResponse
          : (Array.isArray(reviewsResponse?.data) ? reviewsResponse.data : []);

        const reviewableData = Array.isArray(reviewableResponse)
          ? reviewableResponse
          : (Array.isArray(reviewableResponse?.data) ? reviewableResponse.data : []);

        setUserReviews(reviewsData);
        setReviewableProducts(reviewableData);
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
        // Don't show error to user for refresh failure
      }

    } catch (error) {
      console.error('Review submission error:', {
        error,
        response: error.response,
        message: error.message
      });

      let errorMessage = 'Failed to submit review. Please try again.';

      if (error.response) {
        // Server responded with an error status
        errorMessage = error.response.data?.message ||
          error.response.statusText ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      // Always reset the submitting state
      setReviewForm(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStarClick = (rating) => {
    setReviewForm(prev => ({
      ...prev,
      rating
    }));
  };

  const renderStarRating = (rating, size = 20, interactive = false, onStarClick) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const StarIcon = star <= rating ? AiFillStar : AiOutlineStar;
          return (
            <button
              key={star}
              type="button"
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onClick={() => interactive && onStarClick(star)}
              onMouseEnter={() => interactive && onStarClick(star)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                color: star <= rating ? '#F59E0B' : '#9CA3AF'
              }}
            >
              <StarIcon size={size} />
            </button>
          );
        })}
      </div>
    );
  };

  const openEditReviewModal = (review) => {
    setReviewModal({
      product: review.product,
      orderId: review.order,
      reviewId: review._id,
      isEditing: true
    });
    setReviewForm({
      rating: review.rating,
      comment: review.comment,
      isSubmitting: false
    });
  };

  const openReviewModal = (product, orderId) => {
    setReviewModal({
      product,
      orderId,
      isEditing: false
    });
    setReviewForm({
      rating: 5,
      comment: '',
      isSubmitting: false
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <AiFillStar
          key={i}
          className="text-yellow-400"
          size={16}
        />
      ) : (
        <AiOutlineStar
          key={i}
          className="text-gray-300"
          size={16}
        />
      )
    ));
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const renderReviewableProduct = useCallback((item) => (
    <div
      key={`${item.orderId}-${item.product._id}`}
      className="card hover:shadow-md transition-all duration-300"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: '1.25rem'
      }}
    >
      <div style={{ padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '0.5rem',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '2.8em'
        }}>
          {item.product.name}
        </h4>

        <div style={{ marginTop: 'auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            color: '#64748b'
          }}>
            <span>Qty: {item.quantity}</span>
            <span style={{
              fontWeight: '600',
              color: '#1e293b',
              fontSize: '1.125rem'
            }}>
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#64748b',
            paddingTop: '0.5rem',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span>Ordered on {formatDate(item.orderDate)}</span>
          </div>

          <button
            onClick={() => openReviewModal(item.product, item.orderId)}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            <FiStar size={16} />
            Write a Review
          </button>
        </div>
      </div>
    </div>
  ), []);

  const renderLoadingSkeleton = useCallback((count = 3) => (
    <div className="grid grid-1 md:grid-2 lg:grid-3" style={{ gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card"
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            height: '100%',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{
            paddingTop: '75%',
            position: 'relative',
            backgroundColor: '#f1f5f9',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }} />
          <div style={{ padding: '1.25rem' }}>
            <div style={{
              height: '1.25rem',
              backgroundColor: '#f1f5f9',
              marginBottom: '0.75rem',
              borderRadius: '0.25rem',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '40%',
                height: '1rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.25rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }} />
              <div style={{
                width: '30%',
                height: '1.25rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.25rem',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }} />
            </div>
            <div style={{
              height: '2.5rem',
              backgroundColor: '#f1f5f9',
              borderRadius: '0.375rem',
              marginTop: '1rem',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }} />
          </div>
        </div>
      ))}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  ), []);

  const renderUserReview = (review) => (
    <div key={review._id} className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{review.product?.name || 'Product'}</h4>
            <button
              onClick={() => openEditReviewModal(review)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
            >
              <FiEdit size={14} />
              Edit
            </button>
          </div>
          <div className="flex items-center my-1">
            {renderStars(review.rating)}
          </div>
          <p className="text-gray-600">{review.comment}</p>
          <p className="text-sm text-gray-500 mt-2">
            {review.updatedAt !== review.createdAt
              ? `Updated on ${new Date(review.updatedAt).toLocaleDateString()}`
              : `Reviewed on ${new Date(review.createdAt).toLocaleDateString()}`}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'var(--gradient-blue-dark)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: 'var(--shadow-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: '700',
            color: 'white'
          }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p style={{
            margin: 0,
            fontSize: '1rem',
            opacity: 0.9,
            color: 'white'
          }}>
            Here's an overview of your account activity
          </p>
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
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{
          background: 'var(--gradient-blue-dark)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <FiShoppingCart size={28} color="white" />
            </div>
          </div>
          <span className="stat-number" style={{ color: 'white', fontSize: '2.5rem' }}>{orders.length}</span>
          <span className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Orders</span>
        </div>

        <div className="stat-card" style={{
          background: 'var(--gradient-blue-indigo)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-danger)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <FiPackage size={28} color="white" />
            </div>
          </div>
          <span className="stat-number" style={{ color: 'white', fontSize: '2.5rem' }}>{getCartItemsCount()}</span>
          <span className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Items in Cart</span>
        </div>

        <div className="stat-card" style={{
          background: 'var(--gradient-blue-vibrant)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-accent)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <FiHeart size={28} color="white" />
            </div>
          </div>
          <span className="stat-number" style={{ color: 'white', fontSize: '2.5rem' }}>{wishlist.length}</span>
          <span className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Wishlist Items</span>
        </div>

        <div className="stat-card" style={{
          background: 'var(--gradient-blue-medium)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
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
              <FiUser size={28} color="white" />
            </div>
          </div>
          <span className="stat-number" style={{ color: 'white', fontSize: '2.5rem' }}>{formatPrice(totalSpent)}</span>
          <span className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Total Spent</span>
        </div>

        <div className="stat-card" style={{
          background: 'var(--gradient-blue-light)',
          color: 'var(--text-primary)',
          border: 'none',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'rgba(31, 41, 55, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FiStar size={28} color="var(--text-primary)" />
            </div>
          </div>
          <span className="stat-number" style={{ color: 'var(--text-primary)', fontSize: '2.5rem' }}>{userReviews.length}</span>
          <span className="stat-label" style={{ color: 'var(--text-secondary)' }}>Reviews Written</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Profile Information */}
        <div className="card" style={{
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border-light)',
          transition: 'var(--transition-base)'
        }}>
          <div className="card-header" style={{
            background: 'var(--gradient-blue-dark)',
            color: 'white',
            borderBottom: 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUser size={20} />
                Profile Information
              </h3>
              <button
                onClick={() => {
                  if (editing) {
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || ''
                    });
                  }
                  setEditing(!editing);
                }}
                className="btn btn-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <FiEdit />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="card-body">
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={profileData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-textarea"
                    rows="3"
                    value={profileData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Save Changes
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Name
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.name || 'Not provided'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Email
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.email}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Phone
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.phone || 'Not provided'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Address
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.address || 'Not provided'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border-light)',
          transition: 'var(--transition-base)'
        }}>
          <div className="card-header" style={{
            background: 'var(--gradient-blue-indigo)',
            color: 'white',
            borderBottom: 'none'
          }}>
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiPackage size={20} />
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link
                to="/cart"
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <FiShoppingCart size={18} />
                View Cart ({getCartItemsCount()} items)
              </Link>

              <Link
                to="/wishlist"
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <FiHeart size={18} />
                My Wishlist ({wishlist.length} items)
              </Link>

              <Link
                to="/products"
                className="btn btn-success"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                <FiPackage size={18} />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="card" style={{
        marginTop: '2rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)'
      }}>
        <div className="card-header" style={{
          background: 'var(--gradient-blue-medium)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShoppingCart size={20} />
            Order History
          </h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <FiPackage size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
                You haven't placed any orders yet.
              </p>
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="table" style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0'
              }}>
                <thead>
                  <tr style={{
                    background: 'var(--gradient-blue-light)',
                    borderBottom: '2px solid var(--border-light)'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Order ID</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Date</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Items</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Total</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Status</th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        transition: 'var(--transition-base)',
                        background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--gray-100)';
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>#{order.id}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{formatDate(order.date)}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{order.items.length} item(s)</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--secondary)', fontSize: '1.1rem' }}>{formatPrice(order.total)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge badge-${getStatusColor(order.status)}`} style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button className="btn btn-sm btn-secondary" style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}>
                          <FiEye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Products to Review */}
      <div className="card" style={{
        marginTop: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <div className="card-header" style={{
          background: 'var(--gradient-blue-vibrant)',
          color: 'white',
          borderBottom: 'none',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FiMessageSquare size={24} color="white" />
          <h3 style={{ margin: 0, fontWeight: '600', color: 'white' }}>Products to Review</h3>
          {reviewableProducts.length > 0 && (
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              marginLeft: 'auto',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              {reviewableProducts.length} {reviewableProducts.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>
        <div className="card-body" style={{ padding: reviewableProducts.length === 0 ? '2rem 1.5rem' : '1.5rem' }}>
          {reviewableProducts.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiMessageSquare size={40} color="#94a3b8" />
              </div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '0.5rem'
              }}>
                No Products to Review
              </h4>
              <p style={{
                color: '#64748b',
                maxWidth: '400px',
                margin: '0 auto 1.5rem',
                lineHeight: '1.5'
              }}>
                You don't have any products to review right now. Your reviewable products will appear here after your orders are delivered.
              </p>
              <Link to="/orders" className="btn btn-primary">
                View Order History
              </Link>
            </div>
          ) : (
            <div className="grid grid-1 md:grid-2 lg:grid-3" style={{ gap: '1.25rem' }}>
              {loading ? renderLoadingSkeleton(3) : reviewableProducts.map(renderReviewableProduct)}
            </div>
          )}
        </div>
      </div>

      {/* My Reviews */}
      <div className="card" style={{
        marginTop: '2rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)'
      }}>
        <div className="card-header" style={{
          background: 'var(--gradient-blue-light)',
          color: 'var(--text-primary)',
          borderBottom: 'none',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <FiStar size={24} color="var(--text-primary)" />
          <h3 style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>My Reviews</h3>
          {userReviews.length > 0 && (
            <span style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              marginLeft: 'auto',
              border: '1px solid var(--border-light)'
            }}>
              {userReviews.length} {userReviews.length === 1 ? 'review' : 'reviews'}
            </span>
          )}
        </div>
        <div className="card-body" style={{ padding: userReviews.length === 0 ? '2rem 1.5rem' : '1.5rem' }}>
          {userReviews.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 1rem',
                backgroundColor: 'var(--accent-50)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FiStar size={40} color="var(--accent)" />
              </div>
              <h4 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
              }}>
                No Reviews Yet
              </h4>
              <p style={{
                color: 'var(--text-secondary)',
                maxWidth: '400px',
                margin: '0 auto 1.5rem',
                lineHeight: '1.5'
              }}>
                Your reviews will appear here once you submit them. Share your thoughts to help other shoppers!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {userReviews.map((review) => {
                // Calculate how long ago the review was written
                const reviewDate = new Date(review.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now - reviewDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                let timeAgo = '';

                if (diffDays < 1) {
                  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
                  timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
                } else if (diffDays < 30) {
                  timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
                } else if (diffDays < 365) {
                  const months = Math.floor(diffDays / 30);
                  timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
                } else {
                  const years = Math.floor(diffDays / 365);
                  timeAgo = `${years} ${years === 1 ? 'year' : 'years'} ago`;
                }

                return (
                  <div
                    key={review._id}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '0.5rem',
                      padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1px solid var(--border-light)',
                      transition: 'var(--transition-base)',
                      ':hover': {
                        boxShadow: 'var(--shadow-md)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', width: '100%' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          flexShrink: 0,
                          borderRadius: '0.375rem',
                          overflow: 'hidden',
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-primary)'
                        }}>
                          <Image
                            src={constructImageUrl(review.product?.image)}
                            alt={review.product?.name || 'Product'}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              padding: '0.25rem'
                            }}
                          />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.25rem',
                            gap: '1rem'
                          }}>
                            <h4 style={{
                              margin: 0,
                              fontSize: '1rem',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {review.product?.name || 'Product'}
                            </h4>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              flexShrink: 0,
                              backgroundColor: 'var(--accent-50)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px'
                            }}>
                              {renderStars(review.rating)}
                              <span style={{
                                marginLeft: '0.75rem',
                                fontSize: '0.875rem',
                                color: '#4f46e5',
                                fontWeight: '500'
                              }}>
                                {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating - 1]}
                              </span>
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              flexShrink: 0,
                              backgroundColor: 'var(--accent-50)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '9999px'
                            }}>
                              {renderStars(review.rating)}
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                color: 'var(--accent-dark)',
                                marginLeft: '0.25rem'
                              }}>
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <p style={{
                            margin: '0.5rem 0 0',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.5'
                          }}>
                            {review.comment}
                          </p>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '0.75rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)'
                          }}>
                            <span>Reviewed on {formatDate(review.createdAt)}</span>
                            <span>•</span>
                            <span>{timeAgo}</span>
                            <div style={{ flex: 1 }}></div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Edit button clicked for review:', review);
                                openEditReviewModal(review);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#4f46e5',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <FiEdit size={14} />
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.3s ease-in-out',
            opacity: 1
          }}
          onClick={() => !reviewForm.isSubmitting && setReviewModal(null)}
        >
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              transform: 'translateY(0)',
              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
              opacity: 1,
              position: 'relative'
            }}
          >
            <div className="modal-header" style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                Write a Review
              </h3>
              <button
                onClick={() => !reviewForm.isSubmitting && setReviewModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  transition: 'all 0.2s',
                  backgroundColor: 'transparent'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                disabled={reviewForm.isSubmitting}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div className="flex items-start space-x-4 mb-6">
                <div style={{
                  width: '80px',
                  height: '80px',
                  flexShrink: 0,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  position: 'relative'
                }}>
                  <img
                    src={constructImageUrl(reviewModal.product.image)}
                    alt={reviewModal.product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '0.5rem',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.svg';
                    }}
                    loading="lazy"
                  />
                </div>
                <div>
                  <h4 style={{
                    margin: '0 0 0.25rem',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    {reviewModal.product.name}
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    Share your honest opinion about this product
                  </p>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    Your Rating
                    <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                  </label>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '0.5rem'
                    }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => handleStarClick(star)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            transform: reviewForm.rating >= star ? 'scale(1.1)' : 'scale(1)'
                          }}
                          disabled={reviewForm.isSubmitting}
                        >
                          {star <= reviewForm.rating ? (
                            <AiFillStar size={32} color="#F59E0B" />
                          ) : (
                            <AiOutlineStar size={32} color="#E2E8F0" />
                          )}
                        </button>
                      ))}
                      <span style={{
                        marginLeft: '0.75rem',
                        fontSize: '0.875rem',
                        color: '#4f46e5',
                        fontWeight: '500'
                      }}>
                        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewForm.rating - 1]}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      padding: '0 0.5rem'
                    }}>
                      <span>Not good</span>
                      <span>Perfect</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#334155'
                  }}>
                    Your Review
                    <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewFormChange}
                      style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '0.75rem',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        color: '#1e293b',
                        backgroundColor: reviewForm.isSubmitting ? '#f8fafc' : 'white',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        resize: 'vertical',
                        lineHeight: '1.5'
                      }}
                      placeholder="Share details about your experience with this product. What did you like or dislike?"
                      required
                      maxLength={500}
                      disabled={reviewForm.isSubmitting}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#818cf8';
                        e.target.style.boxShadow = '0 0 0 3px rgba(129, 140, 248, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: reviewForm.comment.length >= 500 ? '#ef4444' : '#64748b'
                    }}>
                      <span>Minimum 20 characters</span>
                      <span>
                        <span style={{
                          fontWeight: reviewForm.comment.length >= 450 ? '600' : '400',
                          color: reviewForm.comment.length >= 450 ? (reviewForm.comment.length >= 500 ? '#ef4444' : '#f59e0b') : 'inherit'
                        }}>
                          {reviewForm.comment.length}
                        </span>
                        /500
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <button
                    type="button"
                    onClick={() => !reviewForm.isSubmitting && setReviewModal(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'white',
                      color: '#334155',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: reviewForm.isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: reviewForm.isSubmitting ? 0.7 : 1,
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '100px'
                    }}
                    disabled={reviewForm.isSubmitting}
                    onMouseOver={(e) => !reviewForm.isSubmitting && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseOut={(e) => !reviewForm.isSubmitting && (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      padding: '0.5rem 1.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: reviewForm.isSubmitting || reviewForm.comment.trim().length < MIN_REVIEW_LENGTH ? 'not-allowed' : 'pointer',
                      opacity: reviewForm.isSubmitting || reviewForm.comment.trim().length < MIN_REVIEW_LENGTH ? 0.6 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '120px'
                    }}
                    disabled={reviewForm.isSubmitting || reviewForm.comment.trim().length < MIN_REVIEW_LENGTH}
                  >
                    {reviewForm.isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;