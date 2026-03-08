import React, { useState, useEffect } from 'react';

const Image = React.memo(({
  src,
  alt,
  className = '',
  style = {},
  fallback = '/assets/no-image-placeholder.svg',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentSrc(src || fallback);
    setIsLoading(true);
  }, [src, fallback]);

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className={`image-container-root ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        ...style
      }}
    >
      <img
        src={currentSrc}
        alt={alt || 'Product Image'}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
          ...props.style
        }}
        {...props}
      />
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255,255,255,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="animate-spin" style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ccc',
            borderTopColor: '#333',
            borderRadius: '50%'
          }}></div>
        </div>
      )}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
});

Image.displayName = 'Image';
export default Image;
