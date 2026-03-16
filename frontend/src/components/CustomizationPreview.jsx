import React from 'react';
import { getColorConfig, getSizeConfig, getMaterialConfig } from '../utils/customizationConfig';

/**
 * CustomizationPreview Component
 * Displays a REALISTIC 3D visual representation of the customized bed/mattress
 * Updates in real-time as user selects customization options
 */
const CustomizationPreview = ({ selections, basePrice, totalPrice }) => {
  const sizeConfig = selections.size ? getSizeConfig(selections.size) : null;
  const colorConfig = selections.color ? getColorConfig(selections.color) : null;
  const materialConfig = selections.material ? getMaterialConfig(selections.material) : null;

  // Determine if all essential selections are made
  const isComplete = selections.size && selections.color && selections.material;

  // Get relative dimensions for visual representation (scale to fit container)
  const getPreviewDimensions = () => {
    if (!sizeConfig) return { width: 280, height: 340 };

    const baseWidth = 280;
    const baseHeight = 340;

    // Scale based on size
    const scaleFactors = {
      single: { w: 0.75, h: 0.9 },
      double: { w: 0.9, h: 0.98 },
      queen: { w: 1, h: 1 },
      king: { w: 1.2, h: 1 },
      custom: { w: 0.95, h: 0.95 }
    };

    const factor = scaleFactors[selections.size] || { w: 1, h: 1 };
    return {
      width: baseWidth * factor.w,
      height: baseHeight * factor.h
    };
  };

  const dimensions = getPreviewDimensions();

  // Get shadow effect based on material firmness for more depth
  const getShadowEffect = () => {
    if (!materialConfig) return 'none';
    
    const shadows = {
      firm: '0 16px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
      'medium-firm': '0 14px 28px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
      medium: '0 12px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
      soft: '0 10px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
    };

    return shadows[materialConfig.firmness] || shadows.medium;
  };

  // Get gradient overlay for realistic fabric
  const getFabricGradient = () => {
    const hex = colorConfig?.hex || '#FFFFFF';
    return `linear-gradient(180deg, ${hex}FF 0%, ${hex}E6 50%, ${adjustBrightness(hex, -15)}E0 100%)`;
  };

  // Adjust color brightness for shading
  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + (R<16?0:0)*0x1000000 + R*0x10000 + (G<16?0:0)*0x100 + G*0x100 + (B<16?0:0) + B).toString(16).slice(1);
  };


  return (
    <div style={{
      padding: '2rem',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
      borderRadius: '16px',
      border: '2px solid #e5e7eb',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem'
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h3 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          ✨ Your Customized Bed
        </h3>
        <p style={{
          margin: '0',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {isComplete ? 'Realistic 3D preview of your selections' : 'Configure your bed to see preview'}
        </p>
      </div>

      {/* Main Preview Area */}
      {isComplete ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          width: '100%'
        }}>
          {/* 3D Realistic Bed View */}
          <div style={{
            perspective: '1200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            minHeight: '350px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              position: 'relative',
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              transformStyle: 'preserve-3d',
              transform: 'rotateX(15deg) rotateZ(-5deg)',
              transition: 'transform 0.3s ease'
            }}>
              {/* Bed Frame - Bottom Part */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-8px',
                right: '-8px',
                height: '20px',
                background: 'linear-gradient(180deg, #2d3748 0%, #1a202c 100%)',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                zIndex: 1
              }} />

              {/* Main Mattress Layer */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${dimensions.height * 0.75}px`,
                  background: getFabricGradient(),
                  borderRadius: '8px 8px 0 0',
                  boxShadow: getShadowEffect(),
                  border: `2px solid ${adjustBrightness(colorConfig?.hex || '#FFF', -20)}`,
                  transition: 'all 0.4s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Fabric Texture Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 2px,
                      ${adjustBrightness(colorConfig?.hex || '#FFF', -5)}40 2px,
                      ${adjustBrightness(colorConfig?.hex || '#FFF', -5)}40 4px
                    ),
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      ${adjustBrightness(colorConfig?.hex || '#FFF', -3)}20 2px,
                      ${adjustBrightness(colorConfig?.hex || '#FFF', -3)}20 4px
                    )
                  `,
                  pointerEvents: 'none',
                  borderRadius: '6px'
                }} />

                {/* Material-specific visual accent stripe */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: getMaterialGradient(selections.material),
                  opacity: 0.8,
                  zIndex: 2
                }} />

                {/* Depth/Seam detail */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: 0,
                  width: '100%',
                  height: '8px',
                  background: `linear-gradient(180deg, transparent 0%, ${adjustBrightness(colorConfig?.hex || '#FFF', -30)}80 100%)`,
                  borderRadius: '0 0 6px 6px'
                }} />
              </div>

              {/* Pillows - Back */}
              {renderPillows(dimensions, colorConfig?.hex || '#FFF')}
            </div>
          </div>

          {/* Detailed Specifications Card */}
          <div style={{
            width: '100%',
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <h4 style={{
              margin: '0 0 1.25rem 0',
              fontSize: '1rem',
              fontWeight: '700',
              color: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              📋 Your Customization Summary
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '1rem'
            }}>
              {/* Size */}
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📐 Size
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#1f2937'
                }}>
                  {sizeConfig?.label}
                </p>
                {sizeConfig?.width !== 'custom' && (
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.8rem',
                    color: '#6b7280'
                  }}>
                    {sizeConfig?.width} × {sizeConfig?.length}
                  </p>
                )}
              </div>

              {/* Color */}
              <div style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🎨 Color
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: colorConfig?.hex,
                    border: `2px solid ${adjustBrightness(colorConfig?.hex || '#FFF', -30)}`,
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }} />
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      {colorConfig?.label}
                    </p>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      {colorConfig?.hex}
                    </p>
                  </div>
                </div>
              </div>

              {/* Material */}
              <div style={{
                gridColumn: '1 / -1',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🛟 Material & Properties
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem'
                }}>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#1f2937'
                    }}>
                      {materialConfig?.label}
                    </p>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.8rem',
                      color: '#6b7280'
                    }}>
                      {materialConfig?.description}
                    </p>
                  </div>
                  <div>
                    <p style={{
                      margin: '0 0 0.5rem 0',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>
                      Firmness Level
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem',
                      alignItems: 'center'
                    }}>
                      {renderFirmnessIndicator(materialConfig?.firmness)}
                    </div>
                  </div>
                </div>
                <p style={{
                  margin: '0.75rem 0 0 0',
                  fontSize: '0.8rem',
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  ✓ {materialConfig?.benefits?.join(' • ')}
                </p>
              </div>
            </div>
          </div>

          {/* Price Summary - Enhanced */}
          <div style={{
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2rem',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.85rem',
              fontWeight: '600',
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Customized Price
            </p>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              margin: '0.5rem 0',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            {basePrice !== totalPrice && (
              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                fontSize: '0.85rem'
              }}>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Base Price</div>
                  <div style={{ fontWeight: '700' }}>₹{basePrice.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '0.25rem' }}>Customization</div>
                  <div style={{
                    fontWeight: '700',
                    color: totalPrice > basePrice ? '#4ade80' : '#fca5a5'
                  }}>
                    {totalPrice > basePrice ? '+' : ''} ₹{Math.abs(totalPrice - basePrice).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          opacity: 0.7
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>
            🛏️
          </div>
          <h4 style={{
            margin: '0 0 0.75rem 0',
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            Customize Your Perfect Bed
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#6b7280',
            maxWidth: '300px',
            lineHeight: '1.5'
          }}>
            Select your preferred size, color, and material to see a realistic preview of your customized bed
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

/**
 * Render realistic pillows
 */
function renderPillows(dimensions, color) {
  const pillowWidth = dimensions.width * 0.35;
  const pillowHeight = dimensions.height * 0.18;
  
  return (
    <>
      {/* Left Pillow */}
      <div style={{
        position: 'absolute',
        top: `-${pillowHeight * 0.3}px`,
        left: `-${pillowWidth * 0.2}px`,
        width: `${pillowWidth}px`,
        height: `${pillowHeight}px`,
        background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightnessForPillow(color, -10)} 100%)`,
        borderRadius: '50% 50% 40% 40%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset -2px -2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${adjustBrightnessForPillow(color, -15)}`,
        transform: 'rotateZ(-15deg) rotateX(20deg)',
        zIndex: 3
      }} />

      {/* Right Pillow */}
      <div style={{
        position: 'absolute',
        top: `-${pillowHeight * 0.3}px`,
        right: `-${pillowWidth * 0.2}px`,
        width: `${pillowWidth}px`,
        height: `${pillowHeight}px`,
        background: `linear-gradient(135deg, ${color} 0%, ${adjustBrightnessForPillow(color, -10)} 100%)`,
        borderRadius: '50% 50% 40% 40%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), inset 2px -2px 8px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${adjustBrightnessForPillow(color, -15)}`,
        transform: 'rotateZ(15deg) rotateX(20deg)',
        zIndex: 3
      }} />
    </>
  );
}

/**
 * Adjust color for pillows
 */
function adjustBrightnessForPillow(hex, percent) {
  const num = parseInt(hex.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
}

/**
 * Get gradient based on material type
 */
function getMaterialGradient(material) {
  const gradients = {
    'memory-foam': 'linear-gradient(90deg, #8b7355 0%, #a0826d 100%)',
    'latex': 'linear-gradient(90deg, #d4a574 0%, #e0b88a 100%)',
    'spring': 'linear-gradient(90deg, #a0a0a0 0%, #b8b8b8 100%)',
    'hybrid': 'linear-gradient(90deg, #9ca3af 0%, #b0b7c4 100%)',
    'gel-foam': 'linear-gradient(90deg, #87ceeb 0%, #a8dde8 100%)'
  };
  return gradients[material] || gradients['memory-foam'];
}

/**
 * Render firmness indicator bars
 */
function renderFirmnessIndicator(firmness) {
  const levels = ['soft', 'medium', 'medium-firm', 'firm'];
  const currentIndex = levels.indexOf(firmness);
  
  return (
    <>
      {levels.map((level, index) => (
        <div
          key={level}
          style={{
            width: '20px',
            height: '6px',
            background: index <= currentIndex ? '#667eea' : '#e5e7eb',
            borderRadius: '3px',
            transition: 'background-color 0.3s ease'
          }}
        />
      ))}
    </>
  );
}

/**
 * Adjust brightness helper
 */
// eslint-disable-next-line no-unused-vars
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return "#" + (0x1000000 + R*0x10000 + G*0x100 + B).toString(16).slice(1);
}

export default CustomizationPreview;
