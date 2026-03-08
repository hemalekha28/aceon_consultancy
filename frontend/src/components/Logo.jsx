import React from 'react';

const Logo = ({ className = "w-auto h-12", showTagline = false }) => {
    return (
        <div className={`flex flex-col items-center ${className}`}>
            <div className="relative flex items-center justify-center" style={{ height: '60px', width: '180px' }}>
                {/* Leaf Background Patterns */}
                <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-60">
                    {/* Leaf 1 - Pinkish */}
                    <path d="M100 50 Q120 20 150 30 Q130 60 100 50" fill="#f472b6" transform="rotate(-30 100 50)" />
                    {/* Leaf 2 - Purple */}
                    <path d="M100 50 Q120 10 140 40 Q110 70 100 50" fill="#8b5cf6" transform="rotate(10 100 50)" />
                    {/* Leaf 3 - Blue */}
                    <path d="M100 50 Q80 10 60 40 Q90 70 100 50" fill="#3b82f6" transform="rotate(-10 100 50)" />
                    {/* Leaf 4 - Teal/Green */}
                    <path d="M100 50 Q70 20 50 30 Q70 60 100 50" fill="#4ade80" transform="rotate(20 100 50)" />
                    {/* Leaf 5 - Yellow */}
                    <path d="M100 50 Q105 15 120 20 Q115 55 100 50" fill="#facc15" transform="rotate(-15 100 50)" />
                </svg>

                {/* ACEON Text */}
                <div className="relative flex items-start" style={{ zIndex: 1 }}>
                    <span style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        color: '#000000',
                        fontFamily: 'serif',
                        textShadow: '0 2px 4px rgba(255,255,255,0.5)'
                    }}>
                        ACEON
                    </span>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginTop: '0.5rem',
                        marginLeft: '2px',
                        color: '#000000'
                    }}>
                        TM
                    </span>
                </div>
            </div>
            {showTagline && (
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    color: '#333333',
                    fontFamily: 'serif',
                    fontStyle: 'italic',
                    marginTop: '-5px',
                    letterSpacing: '0.01em'
                }}>
                    Experience True Comfort with ACEON
                </span>
            )}
        </div>
    );
};

export default Logo;
