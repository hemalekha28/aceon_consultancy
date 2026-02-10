import React, { useState } from 'react';
import { FiStar, FiUser, FiCalendar, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

const ReviewsSection = ({ reviews = [], productName }) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const averageRating = reviews && Array.isArray(reviews) && reviews.length > 0 
    ? (reviews.reduce((sum, review) => {
        const rating = typeof review.rating === 'number' ? review.rating : 0;
        return sum + rating;
      }, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => Math.round(review.rating) === rating).length
  }));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const StarRatingDisplay = ({ rating: ratingProp, size = 'sm' }) => {
    const starSize = size === 'lg' ? 'text-xl' : 'text-sm';
    // Ensure rating is a valid number, default to 0 if invalid
    const rating = typeof ratingProp === 'number' && !isNaN(ratingProp) ? ratingProp : 0;
    // Ensure rating is between 0 and 5
    const safeRating = Math.min(Math.max(0, rating), 5);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            className={`${starSize} ${i < Math.floor(safeRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-1 text-sm font-medium">
          {safeRating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="reviews-section-content">
      {/* Reviews Summary */}
      <div className="reviews-summary">
        <div className="summary-rating">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="flex flex-col items-start ml-2">
              <StarRatingDisplay rating={parseFloat(averageRating)} size="lg" />
              <span className="text-sm text-gray-600 mt-1">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="rating-distribution">
          {ratingCounts.map(({ rating, count }) => (
            <div key={rating} className="rating-bar">
              <div className="flex items-center">
                <span className="text-sm mr-2">{rating} <FiStar className="inline text-yellow-400 fill-yellow-400" /></span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600 ml-2 w-6">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="individual-reviews">
        {displayedReviews.length > 0 ? (
          <div className="reviews-list">
            {displayedReviews.map((review, index) => (
              <div key={index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="flex items-center">
                      <div className="reviewer-avatar">
                        <FiUser className="text-gray-500" />
                      </div>
                      <div className="reviewer-name">
                        <span className="font-medium">
                          {review.reviewerName || review.user?.name || 'Anonymous'}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="verified-badge ml-2">Verified Purchase</span>
                        )}
                      </div>
                    </div>
                    <div className="review-date">
                      <FiCalendar className="text-gray-400 mr-1" />
                      <span>{formatDate(review.createdAt || review.date)}</span>
                    </div>
                  </div>
                  <StarRatingDisplay rating={review.rating} />
                </div>
                
                <div className="review-body">
                  <h4 className="review-title">{review.title || `Review of ${productName}`}</h4>
                  <p className="review-text">{review.comment || review.reviewText || review.text}</p>
                  
                  {review.helpfulCount > 0 && (
                    <div className="review-engagement">
                      <button className="helpful-btn">
                        <FiThumbsUp className="mr-1" />
                        Helpful ({review.helpfulCount})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-reviews">
            <FiMessageSquare className="empty-icon" />
            <h3>No reviews yet</h3>
            <p>Be the first to review this product!</p>
          </div>
        )}

        {reviews.length > 3 && (
          <div className="reviews-load-more">
            <button 
              className="load-more-btn"
              onClick={() => setShowAllReviews(!showAllReviews)}
            >
              {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;