import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from "../utils/api";

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      console.log('Loading products with filters:', filters); // Debug log
      const data = await api.getProducts(filters);
      console.log('Products received:', data); // Debug log

      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array but received:', typeof data, data);
        setProducts([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError(`Failed to load products: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      search: ''
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Header Banner */}
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
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700', color: 'white' }}>Products</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              {loading ? 'Loading...' : `${products.length} products found`}
            </p>
          </div>
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


      {/* Error Message */}
      {error && (
        <div style={{
          background: 'var(--gradient-blue-light)',
          color: 'var(--danger)',
          padding: '1.25rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid var(--danger-light)',
          boxShadow: 'var(--shadow-danger)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <strong style={{ fontSize: '1.125rem' }}>Error:</strong> {error}
          </div>
          <button
            onClick={loadProducts}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'var(--gradient-blue-indigo)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'var(--transition-base)',
              boxShadow: 'var(--shadow-danger)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-danger)';
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{
        marginBottom: '2rem',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)'
      }}>
        <div className="card-header" style={{
          background: 'var(--gradient-blue-medium)',
          color: 'white',
          borderBottom: 'none'
        }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>Filter Products</h3>
        </div>
        <div className="card-body">
          <div className="filters-row">
            {/* Search */}
            <div className="filter-group">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="filter-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Collections</option>
                <option value="memory-foam">Memory Foam</option>
                <option value="hybrid">Hybrid Mattresses</option>
                <option value="orthopedic">Orthopedic</option>
                <option value="bedding">Luxury Bedding</option>
                <option value="accessories">Sleep Accessories</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="form-label">Min Price</label>
              <input
                type="number"
                className="form-input"
                placeholder="₹0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="form-label">Max Price</label>
              <input
                type="number"
                className="form-input"
                placeholder="₹1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>

            {/* Sort By */}
            <div className="filter-group">
              <label className="form-label">Sort By</label>
              <select
                className="form-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="filter-group">
              <label className="form-label">&nbsp;</label>
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
                style={{
                  background: 'var(--gradient-blue-indigo)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px rgba(245, 87, 108, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(245, 87, 108, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(245, 87, 108, 0.2)';
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'var(--gradient-blue-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          </div>
          <h3 style={{
            color: '#dc2626',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>Unable to load products</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '1.125rem' }}>
            {error}
          </p>
          <button
            onClick={loadProducts}
            className="btn btn-primary"
            style={{
              background: 'var(--gradient-blue-indigo)',
              border: 'none',
              padding: '0.875rem 2rem',
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
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            background: 'var(--gradient-blue-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '2.5rem' }}>🔍</span>
          </div>
          <h3 style={{
            color: 'var(--gray-700)',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>No products found</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '1.125rem' }}>
            Try adjusting your filters or search terms
          </p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
            style={{
              background: 'var(--gradient-blue-indigo)',
              border: 'none',
              padding: '0.875rem 2rem',
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
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;