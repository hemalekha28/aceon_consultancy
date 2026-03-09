import React, { useState } from 'react';

const sizes = [
  { label: 'Single', value: 'single', width: 90, length: 190 },
  { label: 'Double', value: 'double', width: 135, length: 190 },
  { label: 'Queen', value: 'queen', width: 150, length: 200 },
  { label: 'King', value: 'king', width: 180, length: 200 }
];
const colors = [
  { label: 'White', value: '#fff' },
  { label: 'Gray', value: '#bbb' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Pink', value: '#f472b6' }
];



export default function MattressCustomizer() {
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0].value);

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', margin: '2rem 0', flexWrap: 'wrap' }}>
      <div style={{ minWidth: 320 }}>
        <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Customize Your Mattress</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Size:</label>
          <select value={size.value} onChange={e => setSize(sizes.find(s => s.value === e.target.value))} style={{ marginLeft: 12 }}>
            {sizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Color:</label>
          <select value={color} onChange={e => setColor(e.target.value)} style={{ marginLeft: 12 }}>
            {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 220 }}>
        <div style={{
          width: size.width * 2,
          height: size.length,
          background: color,
          borderRadius: 12,
          border: '2px solid #232f3e',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s',
        }}>
          <span style={{ color: color === '#fff' ? '#232f3e' : '#fff', fontWeight: 700, fontSize: 18 }}>
            {size.label} Mattress
          </span>
        </div>
      </div>
    </div>
  );
}
