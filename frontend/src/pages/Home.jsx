import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiArrowRight
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';
import Carousel from '../components/Carousel';
import Image from '../components/Image';
import '../styles/home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();

        // Get top-rated products as featured
        const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const categories = [
    {
      name: 'Latex',
      image: '/uploads/bed2.jpeg',
      link: '/products?category=latex'
    },
    {
      name: 'Coir',
      image: '/uploads/bed4.jpeg',
      link: '/products?category=coir'
    },
    {
      name: 'Softy Foam',
      image: '/uploads/bed6.jpeg',
      link: '/products?category=softy-foam'
    },
    {
      name: 'Spring',
      image: '/uploads/bed7.jpeg',
      link: '/products?category=spring'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Carousel */}
      <Carousel
        slides={[
          {
            image:
              'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1600',
            badge: 'Sleep Profile Quiz',
            title: 'Find Your Perfect Mattress in 60 Seconds',
            subtitle: 'Answer 6 quick questions and get a personalized recommendation based on your body type and sleep habits.',
            primaryCta: { href: '/quiz', label: 'Start Sleep Quiz' },
            secondaryCta: { href: '/products', label: 'Browse All' },
          },
          {
            image: '/uploads/bed3.jpeg',
            badge: 'Spring Mattresses',
            title: 'Experience The Ultimate Comfort',
            subtitle: 'Advanced multi-layer technology for a perfect night\'s sleep.',
            primaryCta: { href: '/products', label: 'Shop Spring' },
            secondaryCta: { href: '/products?category=spring', label: 'Learn More' },
          },
          {
            image: '/uploads/bed5.jpeg',
            badge: 'Memory Foam',
            title: 'Wake Up Refreshed Every Morning',
            subtitle: 'Contouring support meets cloud-like softness in our memory foam series.',
            primaryCta: { href: '/products?category=memory-foam', label: 'Shop Series' },
            secondaryCta: { href: '/products', label: 'View All' },
          },
          {
            image: '/uploads/bed11.jpeg',
            badge: 'Natural Latex',
            title: 'Designed for Better Back Health',
            subtitle: 'Responsive support for proper spinal alignment.',
            primaryCta: { href: '/products?category=latex', label: 'Shop Latex' },
            secondaryCta: { href: '/products?sortBy=rating', label: 'Best Rated' },
          },
        ]}
      />

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card feature-card-1">
              <div className="feature-icon">
                <FiTruck size={32} />
              </div>
              <h3>White Glove Delivery</h3>
              <p>Free professional setup and removal of old mattress</p>
            </div>
            <div className="feature-card feature-card-2">
              <div className="feature-icon">
                <FiShield size={32} />
              </div>
              <h3>100-Night Trial</h3>
              <p>Risk-free sleep trial with a money-back guarantee</p>
            </div>
            <div className="feature-card feature-card-3">
              <div className="feature-icon">
                <FiHeadphones size={32} />
              </div>
              <h3>10-Year Warranty</h3>
              <p>Full protection on all mattress structural components</p>
            </div>
            <div className="feature-card feature-card-4">
              <div className="feature-icon">
                <FiShoppingBag size={32} />
              </div>
              <h3>Easy Financing</h3>
              <p>Shop now and pay later with zero interest</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Luxury Sleep Collections</h2>
            <p>Discover the science of better sleep with our premium ranges</p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="category-card"
              >
                <div className="category-image-container">
                  <Image
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                    fallback="/assets/no-image-placeholder.svg"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className="shop-now">
                    Explore Range <FiArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Our top-rated products loved by customers</p>
          </div>

          {loading ? (
            <div className="products-loading">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center">
            <Link to="/products" className="btn-view-all">
              Explore All Products
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{
        padding: '4rem 0',
        background: 'var(--gradient-blue-dark)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }} className="py-16 text-white">
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-80px',
          width: '250px',
          height: '250px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="text-2xl md:text-3xl font-bold" style={{ marginBottom: '1rem' }}>Stay Updated</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9, fontSize: '1.125rem' }} className="mt-2 opacity-90">
            Subscribe to our newsletter for the latest deals and product updates
          </p>
          <form
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem', maxWidth: '500px', margin: '0 auto' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input rounded-md"
              style={{
                flex: 1,
                padding: '0.875rem 1.25rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.875rem 2rem',
                borderRadius: '12px',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;