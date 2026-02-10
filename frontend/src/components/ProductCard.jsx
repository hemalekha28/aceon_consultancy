import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiBarChart2 } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { useNotification } from '../context/notificationContext';
import { useCompare } from '../context/compareContext';
import { formatPrice } from '../utils/helpers';
import Image from '../components/Image';
import { constructImageUrl } from '../utils/imageUtils';

// Fallback image component
const FallbackImage = () => (
  <div className="fallback-image">
    <div className="fallback-icon">
      <FiShoppingCart size={32} />
    </div>
  </div>
);

const ProductCard = ({ product, showActions = true }) => {
  const { addToCart, isInCart, getItemQuantityInCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showInfo } = useNotification();
  const { addToCompare, isInCompare, removeFromCompare, canAddMore } = useCompare();
  const navigate = useNavigate();

  // Check if product is in wishlist
  const isWishlisted = isInWishlist(product._id);

  // Check if product is in cart
  const inCart = isInCart(product._id);
  const cartQuantity = getItemQuantityInCart(product._id);

  // Check if product is in compare
  const inCompare = isInCompare(product._id);

  // Fallback image from public directory
  const fallbackImageUrl = '/assets/no-image-placeholder.svg';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isWishlisted) {
        removeFromWishlist(product._id);
        showInfo(`Removed "${product.name}" from wishlist`);
      } else {
        addToWishlist(product);
        showSuccess(`Added "${product.name}" to wishlist!`);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (inCompare) {
        removeFromCompare(product._id);
      } else {
        addToCompare(product);
      }
    } catch (error) {
      console.error('Error updating compare:', error);
    }
  };

  // Get category name
  const getCategoryName = () => {
    if (!product.category) return '';
    return typeof product.category === 'string'
      ? product.category
      : product.category.name || '';
  };

  const categoryName = getCategoryName();

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" fill="currentColor" opacity="0.5" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} fill="none" />);
    }

    return stars;
  };

  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="image-container">
        <Link to={`/product/${product._id}`}>
          <div className="image-wrapper">
            <Image
              src={constructImageUrl(product.image) || fallbackImageUrl}
              alt={product.name}
              className="product-image"
              fallback={fallbackImageUrl}
            />
          </div>
        </Link>

        {/* Badges */}
        {inCart && (
          <div className="in-cart-badge">
            <FiCheck size={14} />
            In Cart ({cartQuantity})
          </div>
        )}

        {inCompare && (
          <div className="in-compare-badge">
            <FiBarChart2 size={14} />
            Comparing
          </div>
        )}

        {product.stock === 0 && (
          <div className="out-of-stock">Out of Stock</div>
        )}

        {showActions && (
          <>
            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              className={`compare-btn ${inCompare ? 'active' : ''}`}
              onClick={handleCompareToggle}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              disabled={!canAddMore && !inCompare}
            >
              <FiBarChart2 size={20} />
            </button>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {categoryName && <div className="category">{categoryName}</div>}

        <h3 className="product-name">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        <div className="price">{formatPrice(product.price)}</div>

        {product.rating > 0 && (
          <div className="rating">
            <div className="stars">
              {renderStars(product.rating)}
            </div>
            <span className="review-count">({product.numreviews || 0})</span>
          </div>
        )}

        {showActions && (
          <button
            className={`add-to-cart-btn ${!product.stock ? 'out-of-stock' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.stock}
          >
            <FiShoppingCart size={18} />
            {product.stock ? (inCart ? 'In Cart' : 'Add to Cart') : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;