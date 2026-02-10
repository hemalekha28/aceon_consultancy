import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiLoader, FiAlertCircle, FiMinus, FiPlus, FiShoppingBag, FiTag, FiAward, FiPackage } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useWishlist } from '../context/wishlistContext';
import { useAuth } from '../context/authContext';
import { useNotification } from '../context/notificationContext';
import ProductImage from '../components/ProductImage';
import StockBadge from '../components/StockBadge';
import ReviewsSection from '../components/ReviewsSection';
import { formatPrice } from '../utils/helpers';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { cart, addToCart: addToCartContext, getItemQuantityInCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useNotification();

  // Single API call to fetch product data
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!isMounted) return;

        if (data.success) {
          const productData = data.data.product;
          setProduct(productData);
          setQuantity(1);

          // Load reviews if available
          if (productData.reviews) {
            setReviews(productData.reviews);
          }
        } else {
          throw new Error(data.message || 'Failed to load product');
        }
      } catch (err) {
        console.error('Error loading product:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load product');
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

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    const maxAvailable = product?.stock || 0;
    const cartQuantity = getItemQuantityInCart ? getItemQuantityInCart(product?._id) : 0;
    const availableQuantity = Math.max(0, maxAvailable - cartQuantity);

    if (newQuantity < 1 || newQuantity > availableQuantity) return;
    setQuantity(newQuantity);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    const productId = product._id || product.id;
    if (!productId) {
      showNotification('Invalid product', 'error');
      return;
    }

    if (product.stock <= 0) {
      showNotification('This product is out of stock', 'error');
      return;
    }

    try {
      await addToCartContext({
        ...product,
        id: productId,
        productId: productId
      }, quantity);

      showSuccess('Added to cart!');
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showError(err.message || 'Failed to add to cart');
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!product) return;

    if (product.stock <= 0) {
      showError('This product is out of stock');
      return;
    }

    setIsBuyingNow(true);
    try {
      // Pass product directly to checkout via state
      // This prevents adding it to the cart, allowing for a "single item checkout" flow
      navigate('/checkout', {
        state: {
          buyNowItem: {
            ...product,
            id: product._id,
            productId: product._id,
            quantity: quantity
          }
        }
      });
    } catch (err) {
      console.error('Failed to process buy now:', err);
      showError('Failed to process order');
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Calculate stock information
  const productId = product?._id || product?.id;
  const cartQuantity = getItemQuantityInCart ? getItemQuantityInCart(productId) : 0;
  const productStock = Number(product?.stock) || 0;
  const availableQuantity = Math.max(0, productStock - cartQuantity);
  const inStock = availableQuantity > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="product-loading">
        <FiLoader className="animate-spin" />
        <span>Loading product details...</span>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-error">
        <FiAlertCircle className="product-error-icon" />
        <h2>{error || 'Product not found'}</h2>
        <p className="product-error-message">We couldn't find the product you're looking for.</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-retry"
        >
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        <FiArrowLeft /> Back to Products
      </button>

      {/* Main product content */}
      <div className="product-card">
        {/* Product images */}
        <div className="product-image-container">
          <ProductImage product={product} selectedImageIndex={selectedImage} />
        </div>

        {/* Product info */}
        <div className="product-info">
          <span className="product-category">{product.category || 'Uncategorized'}</span>
          <h1 className="product-title">{product.name}</h1>

          {/* Price and stock status */}
          <div className="product-price">
            <span className="price-current">{formatPrice(product.price)}</span>
            <StockBadge stock={availableQuantity} />
          </div>

          {/* Description */}
          <div className="product-description">
            <p>{product.description || 'No description available.'}</p>
          </div>

          {/* Quantity selector */}
          <div className="quantity-selector">
            <label>Quantity</label>
            <div className="quantity-control">
              <button
                type="button"
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <FiMinus />
              </button>
              <input
                type="number"
                className="quantity-input"
                value={quantity}
                readOnly
              />
              <button
                type="button"
                className="quantity-btn"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableQuantity}
              >
                <FiPlus />
              </button>
              <span className="quantity-available">
                {availableQuantity} {availableQuantity === 1 ? 'item' : 'items'} available
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="product-actions">
            <button
              className={`btn-add-to-cart ${!inStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : inStock ? (
                <>
                  <FiShoppingCart />
                  <span>Add to Cart</span>
                </>
              ) : (
                <span>Out of Stock</span>
              )}
            </button>

            <button
              className={`btn-buy-now ${!inStock ? 'disabled' : ''}`}
              onClick={handleBuyNow}
              disabled={!inStock || isBuyingNow}
            >
              {isBuyingNow ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Buy Now</span>
              )}
            </button>

            <button
              className={`btn-wishlist ${isInWishlist(product?._id || product?.id) ? 'active' : ''}`}
              onClick={() => {
                const pid = product?._id || product?.id;
                if (!pid) return;

                const isCurrentlySaved = isInWishlist(pid);
                if (isCurrentlySaved) {
                  removeFromWishlist(pid);
                  showSuccess('Removed from wishlist');
                } else {
                  addToWishlist(product);
                  showSuccess('Added to wishlist');
                }
              }}
            >
              <FiHeart
                fill={isInWishlist(product?._id || product?.id) ? 'currentColor' : 'none'}
              />
              <span>{isInWishlist(product?._id || product?.id) ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
            </button>
          </div>

          {/* Product details */}
          <div className="product-meta">
            <div className="meta-item">
              <div className="meta-icon">
                <FiShoppingBag />
              </div>
              <div className="meta-text">
                <div className="meta-label">Category</div>
                <div className="meta-value">{product.category || 'N/A'}</div>
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-icon">
                <FiTag />
              </div>
              <div className="meta-text">
                <div className="meta-label">SKU</div>
                <div className="meta-value">{product.sku || 'N/A'}</div>
              </div>
            </div>

            {product.brand && (
              <div className="meta-item">
                <div className="meta-icon">
                  <FiAward />
                </div>
                <div className="meta-text">
                  <div className="meta-label">Brand</div>
                  <div className="meta-value">{product.brand}</div>
                </div>
              </div>
            )}

            <div className="meta-item">
              <div className="meta-icon">
                <FiPackage />
              </div>
              <div className="meta-text">
                <div className="meta-label">Availability</div>
                <div className={`meta-value ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                  {inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>
            Customer Reviews
            {reviews.length > 0 && <span className="reviews-count">({reviews.length})</span>}
          </h2>
          <p className="reviews-subtitle">
            {reviews.length === 0 ? 'Share your experience first!' : 'What customers are saying'}
          </p>
        </div>

        <div className="reviews-content">
          <ReviewsSection reviews={reviews} productName={product.name} />
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;