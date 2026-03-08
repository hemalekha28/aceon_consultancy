import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiArrowRight
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import MattressCustomizer from '../components/MattressCustomizer';
// import { api } from '../utils/api'; // removed: no longer used
import Carousel from '../components/Carousel';
import Image from '../components/Image';
import '../styles/home.css';

const Home = () => {

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        // const products = await api.getProducts(); // removed: no longer used

        // Get top-rated products as featured
        // const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8); // removed: no longer used
        // setFeaturedProducts(featured); // removed: no longer used
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        // setLoading(false); // removed: no longer used
      }
    };

    loadFeaturedProducts();
  }, []);


  // Mock featured products (replace with API data as needed)
  const featuredProducts = [
    {
      _id: 'bed1',
      name: 'LuxeSleep Memory Foam Mattress',
      price: 19999,
      image: 'bed1',
      category: 'Memory Foam',
      rating: 4.7,
      numreviews: 120,
      stock: 10
    },
    {
      _id: 'bed2',
      name: 'OrthoCare Spring Mattress',
      price: 17999,
      image: 'bed2',
      category: 'Spring',
      rating: 4.5,
      numreviews: 80,
      stock: 5
    },
    {
      _id: 'bed3',
      name: 'Hybrid Comfort Mattress',
      price: 22999,
      image: 'bed3',
      category: 'Hybrid',
      rating: 4.8,
      numreviews: 150,
      stock: 8
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Carousel */}
      <Carousel
        slides={[
          {
            image:
              'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?q=80&w=1600&auto=format&fit=crop',

            title: 'Experience The Ultimate Comfort',
            subtitle: 'Premium handcrafted mattresses designed for your best night\'s sleep.',
            primaryCta: { href: '/products', label: 'Shop Collection' },
            secondaryCta: { href: '/products?category=hybrid', label: 'Explore Hybrids' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1600&auto=format&fit=crop',
            
            title: 'Wake Up Refreshed Every Morning',
            subtitle: 'Orthopedic support meets cloud-like softness in our memory foam series.',
            primaryCta: { href: '/products?category=memory-foam', label: 'Shop Memory Foam' },
            secondaryCta: { href: '/products', label: 'View All' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1622372738946-629715071d3e?q=80&w=1600&auto=format&fit=crop',
            
            title: 'Luxury Sleeping Essentials',
            subtitle: 'Elevate your bedroom with our curated collection of luxury mattresses and bedding.',
            primaryCta: { href: '/products?category=orthopedic', label: 'Shop Orthopedic' },
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


      {/* Featured Products */}
      <section className="featured-products-section" style={{ padding: '2rem 0' }}>
        <div className="container">
          <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 24 }}>Featured Mattresses</h2>
          <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 32 }}>
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Mattress Customizer */}
      <section className="customizer-section" style={{ background: '#f8fafc', padding: '2rem 0' }}>
        <div className="container">
          <MattressCustomizer />
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="container">
          {/* Categories content here */}
        </div>
      </section>
    </div>
  );
};

export default Home;