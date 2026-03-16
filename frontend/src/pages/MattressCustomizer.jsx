
import React, { useState, useEffect } from 'react';
import '../styles/customizer.css';
import { useCart } from '../context/cartContext';
import { useNotification } from '../context/notificationContext';
import mattressBase from '../assets/mattress_base.png';
import mattressLayers from '../assets/mattress_layers.png';
import { getCustomizerWhatsAppLink } from '../utils/whatsapp';


const MattressCustomizer = () => {
  const { addToCart } = useCart();
  const notification = useNotification();

  const [options, setOptions] = useState({
    size: 'Single',
    thickness: 8,
    material: 'Memory Foam',
    comfort: 'Medium',
    color: { name: 'White', hex: '#FFFFFF' },
    features: {
      coolingGel: false,
      motionIsolation: false,
      antiAllergy: false
    }
  });

  const [price, setPrice] = useState(10000);

  const sizes = ['Single', 'Queen', 'King'];
  const thicknesses = [4, 6, 8, 10, 12];
  const materials = ['Memory Foam', 'Orthopedic', 'Latex', 'Pocket Spring'];
  const comforts = ['Soft', 'Medium', 'Firm'];
  const colors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Grey', hex: '#8E8E8E' },
    { name: 'Blue', hex: '#1a237e' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Brown', hex: '#5D4037' }
  ];

  useEffect(() => {
    calculatePrice();
  }, [options]);

  const calculatePrice = () => {
    let basePrice = 10000;
    
    // Size Multipliers
    const sizeMults = { 'Single': 1, 'Queen': 1.4, 'King': 1.7 };
    basePrice *= sizeMults[options.size];

    // Material Multipliers
    const matMults = { 'Memory Foam': 1, 'Orthopedic': 1.1, 'Latex': 1.4, 'Pocket Spring': 1.3 };
    basePrice *= matMults[options.material];

    // Thickness Multipliers
    const thickMults = { 4: 1, 6: 1, 8: 1.1, 10: 1.2, 12: 1.4 };
    basePrice *= thickMults[options.thickness];

    // Feature Additions
    if (options.features.coolingGel) basePrice += 1500;
    if (options.features.motionIsolation) basePrice += 1200;
    if (options.features.antiAllergy) basePrice += 1000;

    setPrice(Math.round(basePrice));
  };

  const handleOptionChange = (key, value) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setOptions(prev => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] }
    }));
  };

  const getWhatsAppLink = () => {
    return getCustomizerWhatsAppLink(options, price);
  };


  const handleAddToCart = () => {
    const product = {
      _id: `custom-${Date.now()}`,
      name: `Custom ${options.material} Mattress`,
      price: price,
      image: mattressBase,
      description: `${options.size}, ${options.thickness}", ${options.comfort} comfort`,
      customOptions: options
    };
    addToCart(product, 1);
    notification.showSuccess(`Custom mattress added to cart!`);
  };

  return (
    <div className="customizer-page">
      <div className="customizer-header">
        <h1>Customize Your Perfect Sleep</h1>
        <p>Design your mattress with premium materials and advanced comfort features</p>
      </div>

      <div className="customizer-grid">
        {/* Left Column: Options */}
        <div className="options-column">
          <div className="option-group">
            <label>Select Size</label>
            <div className="selector-grid">
              {sizes.map(s => (
                <div 
                  key={s} 
                  className={`selector-item ${options.size === s ? 'active' : ''}`}
                  onClick={() => handleOptionChange('size', s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Thickness (Inches)</label>
            <div className="selector-grid">
              {thicknesses.map(t => (
                <div 
                  key={t} 
                  className={`selector-item ${options.thickness === t ? 'active' : ''}`}
                  onClick={() => handleOptionChange('thickness', t)}
                >
                  {t}"
                </div>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Primary Material</label>
            <select 
              className="custom-select"
              value={options.material}
              onChange={(e) => handleOptionChange('material', e.target.value)}
            >
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="option-group">
            <label>Comfort Level</label>
            <select 
              className="custom-select"
              value={options.comfort}
              onChange={(e) => handleOptionChange('comfort', e.target.value)}
            >
              {comforts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="option-group">
            <label>Upholstery Color</label>
            <div className="color-swatches">
              {colors.map(c => (
                <div 
                  key={c.name}
                  className={`swatch-item ${options.color.name === c.name ? 'active' : ''}`}
                  onClick={() => handleOptionChange('color', c)}
                  title={c.name}
                >
                  <div className="swatch-circle" style={{ backgroundColor: c.hex }}></div>
                  <span className="swatch-label">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Advanced Features</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={options.features.coolingGel}
                  onChange={() => handleFeatureToggle('coolingGel')}
                />
                <span>Cooling Gel Technology (+₹1,500)</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={options.features.motionIsolation}
                  onChange={() => handleFeatureToggle('motionIsolation')}
                />
                <span>Motion Isolation (+₹1,200)</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={options.features.antiAllergy}
                  onChange={() => handleFeatureToggle('antiAllergy')}
                />
                <span>Anti Allergy Protection (+₹1,000)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Center Column: Live Preview */}
        <div className="preview-column">
          <div className="mattress-preview-container">
            <div 
              className="live-mattress"
              style={{ 
                width: options.size === 'King' ? '460px' : options.size === 'Queen' ? '400px' : '320px',
                height: '450px',
                transform: `rotateX(60deg) rotateZ(-30deg)`
              }}
            >
              {/* Top Cover */}
              <div 
                className="mattress-layer layer-top"
                style={{ 
                  backgroundColor: options.color.hex,
                  transform: `translateZ(${options.thickness * 8}px)`
                }}
              >
                <div className="texture-overlay"></div>
                <div className="gold-trim"></div>
              </div>

              {/* Comfort Layer */}
              <div 
                className={`mattress-layer layer-foam material-${options.material.toLowerCase().replace(' ', '-')}`}
                style={{ 
                  height: '100%',
                  transform: `translateZ(${options.thickness * 4}px)`
                }}
              >
                {options.features.coolingGel && <div className="cooling-gel-effect"></div>}
              </div>

              {/* Side walls (Front and Right) */}
              <div 
                className="mattress-side side-front" 
                style={{ 
                  backgroundColor: options.color.hex, 
                  filter: 'brightness(0.8)',
                  height: `${options.thickness * 8}px`
                }}
              ></div>
              <div 
                className="mattress-side side-right" 
                style={{ 
                  backgroundColor: options.color.hex, 
                  filter: 'brightness(0.6)',
                  width: `${options.thickness * 8}px`
                }}
              ></div>
            </div>
            
            <div className="layer-labels">
              <div className="label-item">
                <span className="dot" style={{ background: options.color.hex }}></span>
                <span>Premium Upholstery ({options.color.name})</span>
              </div>
              <div className="label-item">
                <span className="dot" style={{ background: '#e3f2fd' }}></span>
                <span>{options.material} Comfort Layer</span>
              </div>
              {options.features.coolingGel && (
                <div className="label-item">
                  <span className="dot" style={{ background: '#2196f3' }}></span>
                  <span>Cooling Gel Infusion</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="summary-column">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>Base Mattress</span>
                <span>₹10,000</span>
              </div>
              <div className="summary-row">
                <span>Size: {options.size}</span>
                <span>{(options.size === 'Single' ? 'Incl.' : `×${options.size === 'Queen' ? '1.4' : '1.7'}`)}</span>
              </div>
              <div className="summary-row">
                <span>Material: {options.material}</span>
                <span>{(options.material === 'Memory Foam' ? 'Incl.' : `×${options.material === 'Latex' ? '1.4' : options.material === 'Pocket Spring' ? '1.3' : '1.1'}`)}</span>
              </div>
              
              {Object.entries(options.features).map(([name, active]) => active && (
                <div key={name} className="summary-row">
                  <span>{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>+₹{name === 'coolingGel' ? '1,500' : name === 'motionIsolation' ? '1,200' : '1,000'}</span>
                </div>
              ))}

              <div className="summary-row total">
                <span>Total Amount</span>
                <span className="price-value">₹{price.toLocaleString()}</span>
              </div>
            </div>

            <div className="action-buttons">
              <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-whatsapp"
              >
                <span>Order via WhatsApp</span>
              </a>
              <button 
                className="btn-cart-custom"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MattressCustomizer;
