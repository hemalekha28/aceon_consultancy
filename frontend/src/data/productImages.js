const productImages = {
  // Mattresses/Beds (Unsplash)
  'bed1': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  'bed2': 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=80',
  'bed3': 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
  'bed4': 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=80',
  'bed5': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
  // ...add more as needed
};

// Export a function to get the image URL with fallback
export const getProductImageUrl = (productId, defaultImage = '/placeholder-product.svg') => {
  if (!productId) return defaultImage;
  const imageUrl = productImages[productId];
  if (!imageUrl) return defaultImage;
  return imageUrl;
};

export default productImages;
