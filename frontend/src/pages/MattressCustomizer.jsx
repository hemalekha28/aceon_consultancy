import React, { useState, useEffect, useMemo } from 'react';
import { FiArrowLeft, FiShoppingCart, FiMessageCircle, FiRotateCcw } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { getCustomizerWhatsAppLink } from '../utils/whatsapp';
import '../styles/customizer.css';

const SIZES = {
  Single: { width: 220, depth: 320, multiplier: 1.0 },
  Queen: { width: 300, depth: 360, multiplier: 1.4 },
  King: { width: 440, depth: 360, multiplier: 1.7 } // Increased width for King to be "wide and less deep"
};

const THICKNESS_OPTIONS = [
  { val: 4, height: 40, adder: 0 },
  { val: 6, height: 60, adder: 500 },
  { val: 8, height: 80, adder: 1500 },
  { val: 10, height: 100, adder: 3000 },
  { val: 12, height: 120, adder: 5000 }
];

const MATERIALS = [
  { 
    name: 'Memory Foam', 
    adder: 0, 
    texture: 'soft',
    desc: 'Contours perfectly to your body shape for pressure relief.'
  },
  { 
    name: 'Latex', 
    adder: 2000, 
    texture: 'pinhole',
    desc: 'Eco-friendly, bouncy, and stays cool throughout the night.' 
  },
  { 
    name: 'Spring', 
    adder: 1000, 
    texture: 'quilted',
    desc: 'Classic support with excellent airflow and edge durability.'
  },
  { 
    name: 'Hybrid', 
    adder: 3000, 
    texture: 'mixed',
    desc: 'The best of both worlds: plush foam top with spring support.'
  },
  { 
    name: 'Coir', 
    adder: -500, 
    texture: 'rough',
    desc: 'Firm, natural support made from coconut fibers. Extra breathable.'
  }
];

const COMFORT_LEVELS = ['Soft', 'Medium', 'Firm', 'Extra Firm'];

const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#888888' },
  { name: 'Navy', hex: '#1A237E' },
  { name: 'Cream', hex: '#FFFDE7' },
  { name: 'Brown', hex: '#5D4037' }
];

const EMI_PLANS = [
  { months: 3, rate: 0, label: 'No-Cost EMI' },
  { months: 6, rate: 12, label: '@ 12% p.a.' },
  { months: 9, rate: 13, label: '@ 13% p.a.' },
  { months: 12, rate: 14, label: '@ 14% p.a.' }
];

const calculateEMI = (principal, annualRate, months) => {
  if (annualRate === 0) return Math.round(principal / months);
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(emi);
};

// Helper to darken colors
const darken = (hex, amount) => {
  if (hex === '#FFFFFF') return `rgb(${255 * (1 - amount)}, ${255 * (1 - amount)}, ${255 * (1 - amount)})`;
  let [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `rgb(${r}, ${g}, ${b})`;
};

const MattressCustomizer = () => {
  const [size, setSize] = useState('Queen');
  const [thickness, setThickness] = useState(8);
  const [material, setMaterial] = useState('Memory Foam');
  const [comfort, setComfort] = useState('Medium');
  const [color, setColor] = useState(COLORS[0]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [emiOpen, setEmiOpen] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState(null);

  const { addToCart } = useCart();

  // Price Calculation
  const totalPrice = useMemo(() => {
    const base = 10000;
    const sizeData = SIZES[size];
    const thickData = THICKNESS_OPTIONS.find(t => t.val === thickness);
    const matData = MATERIALS.find(m => m.name === material);
    
    return Math.round((base * sizeData.multiplier) + thickData.adder + matData.adder);
  }, [size, thickness, material]);

  // Flash animation trigger
  useEffect(() => {
    setIsFlashing(true);
    const timer = setTimeout(() => setIsFlashing(false), 300);
    return () => clearTimeout(timer);
  }, [totalPrice]);

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 1500);
  };

  const handleAddToCart = () => {
    const customProduct = {
      id: `custom-${Date.now()}`,
      name: `Custom ${size} Mattress`,
      price: totalPrice,
      image: '/images/custom-preview.jpg', // Placeholder image
      category: 'Customized',
      specs: { size, thickness, material, comfort, color: color.name }
    };
    addToCart(customProduct, 1);
  };

  const handleChatWithExpert = () => {
    const options = { size, thickness, material, comfort, color, features: {} };
    const link = getCustomizerWhatsAppLink(options, totalPrice);
    window.open(link, '_blank');
  };

  const currentDims = SIZES[size];
  const currentHeight = THICKNESS_OPTIONS.find(t => t.val === thickness).height;

  return (
    <div className="customizer-root">
      <div className="customizer-layout">
        
        {/* LEFT PANEL: CONFIG */}
        <aside className="config-panel">
          <div className="config-section">
            <span className="section-title">Select Size</span>
            <div className="pill-group">
              {Object.keys(SIZES).map(s => (
                <button 
                  key={s}
                  className={`btn-pill ${size === s ? 'active' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <span className="section-title">Thickness</span>
            <div className="grid-group">
              {THICKNESS_OPTIONS.map(t => (
                <button 
                  key={t.val}
                  className={`btn-grid ${thickness === t.val ? 'active' : ''}`}
                  onClick={() => setThickness(t.val)}
                >
                  {t.val}"
                </button>
              ))}
            </div>
          </div>

          <div className="config-section">
            <span className="section-title">Primary Material</span>
            <select 
              className="styled-select"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              {MATERIALS.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
            <div className="material-desc">
              {MATERIALS.find(m => m.name === material).desc}
            </div>
          </div>

          <div className="config-section">
            <span className="section-title">Comfort Level</span>
            <select 
              className="styled-select"
              value={comfort}
              onChange={(e) => setComfort(e.target.value)}
            >
              {COMFORT_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="config-section">
            <span className="section-title">Upholstery Color</span>
            <div className="swatch-group">
              {COLORS.map(c => (
                <div 
                  key={c.name}
                  className={`color-swatch ${color.name === c.name ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c)}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: 3D PREVIEW */}
        <main className="preview-panel">
          <div className={`btn-360 ${isSpinning ? 'spinning' : ''}`} onClick={handleSpin}>
            <FiRotateCcw /> 360° VIEW
          </div>
          
          <div className="mattress-world">
            <div 
              className={`mattress-box ${isSpinning ? 'box-spin' : ''}`}
              style={{
                width: currentDims.width,
                height: currentDims.depth,
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              {/* Top Face */}
              <div 
                className={`m-face face-top texture-${MATERIALS.find(m => m.name === material).texture}`}
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: color.hex,
                  transform: `translateZ(${currentHeight}px)`,
                  border: '5px solid #FFFDE7' // Piping
                }}
              />
              
              {/* Front Face (Bottom Edge) */}
              <div 
                className="m-face face-front"
                style={{
                  width: '100%',
                  height: currentHeight,
                  backgroundColor: darken(color.hex, 0.15),
                  transform: `rotateX(-90deg) translateZ(${currentDims.depth}px)`,
                  transformOrigin: 'bottom',
                  borderBottom: '5px solid #FFFDE7' // Piping
                }}
              />

              {/* Back Face (Top Edge - Optional for realism) */}
              <div 
                className="m-face face-back"
                style={{
                  width: '100%',
                  height: currentHeight,
                  backgroundColor: darken(color.hex, 0.15),
                  transform: `rotateX(-90deg) translateZ(0px)`,
                  transformOrigin: 'bottom'
                }}
              />

              {/* Right Face */}
              <div 
                className="m-face face-right"
                style={{
                  width: currentHeight,
                  height: '100%',
                  backgroundColor: darken(color.hex, 0.25),
                  transform: `rotateY(90deg) translateZ(${currentDims.width}px)`,
                  transformOrigin: 'left',
                  borderTop: '5px solid #FFFDE7' // Piping
                }}
              />

              {/* Left Face (Optional for realism) */}
              <div 
                className="m-face face-left"
                style={{
                  width: currentHeight,
                  height: '100%',
                  backgroundColor: darken(color.hex, 0.25),
                  transform: `rotateY(90deg) translateZ(0px)`,
                  transformOrigin: 'left'
                }}
              />
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: SUMMARY */}
        <aside className="summary-panel">
          <h2 className="summary-header">Order Summary</h2>
          
          <div className="summary-list">
            <div className="summary-item">
              <span>Base Mattress</span>
              <span>₹10,000</span>
            </div>
            <div className="summary-item">
              <span>Size: {size}</span>
              <span>×{SIZES[size].multiplier.toFixed(1)}</span>
            </div>
            <div className="summary-item">
              <span>Thickness: {thickness}"</span>
              <span>+{THICKNESS_OPTIONS.find(t => t.val === thickness).adder > 0 ? `₹${THICKNESS_OPTIONS.find(t => t.val === thickness).adder}` : 'Incl.'}</span>
            </div>
            <div className="summary-item">
              <span>Material: {material}</span>
              <span>{MATERIALS.find(m => m.name === material).adder > 0 ? `+₹${MATERIALS.find(m => m.name === material).adder}` : (MATERIALS.find(m => m.name === material).adder < 0 ? `-₹${Math.abs(MATERIALS.find(m => m.name === material).adder)}` : 'Incl.')}</span>
            </div>
            <div className="summary-item">
              <span>Comfort Level</span>
              <span>Incl.</span>
            </div>
          </div>

          <div className="summary-divider" />

          <div className="total-section">
            <div className="emi-promo-banner">
              ✦ No-cost EMI available from ₹{Math.round(totalPrice / 3).toLocaleString()}/mo
            </div>
            <span className="total-label">Total Amount</span>
            <span className={`total-amount ${isFlashing ? 'flash-trigger' : ''}`}>
              ₹{totalPrice.toLocaleString()}
            </span>
          </div>

          {/* EMI SECTION */}
          <div className="emi-section">
            <button 
              className={`emi-toggle ${emiOpen ? 'open' : ''}`}
              onClick={() => setEmiOpen(!emiOpen)}
            >
              💳 Pay with EMI {emiOpen ? '▲' : '▼'}
            </button>
            
            <div className={`emi-content ${emiOpen ? 'expanded' : ''}`}>
              <div className="emi-grid">
                {EMI_PLANS.map(plan => {
                  const emiVal = calculateEMI(totalPrice, plan.rate, plan.months);
                  const totalWithInterest = emiVal * plan.months;
                  const isSelected = selectedEmi?.months === plan.months;
                  
                  return (
                    <div 
                      key={plan.months}
                      className={`emi-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedEmi({ months: plan.months, emi: emiVal, total: totalWithInterest })}
                    >
                      <div className="emi-badge">{plan.months} Months</div>
                      <div className="emi-tag">{plan.label}</div>
                      <div className="emi-amount">₹{emiVal.toLocaleString()}/mo</div>
                      <div className="emi-total">Total: ₹{totalWithInterest.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bank-logos">
                <span>Available on:</span>
                <div className="bank-strip">
                  {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak'].map(bank => (
                    <span key={bank} className="bank-pill">{bank}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="selection-summary">
            {selectedEmi && (
              <div className="emi-selected-confirmation">
                ✓ EMI Selected: ₹{selectedEmi.emi.toLocaleString()}/mo × {selectedEmi.months} months
              </div>
            )}
          </div>

          <div className="cta-group">
            <button className="btn-cta btn-expert" onClick={handleChatWithExpert}>
              <FiMessageCircle /> Chat with Expert
            </button>
            <button className="btn-cta btn-cart" onClick={handleAddToCart}>
              <FiShoppingCart /> Add to Cart {selectedEmi ? '(EMI)' : ''}
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default MattressCustomizer;
