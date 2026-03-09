import React from 'react';
import Register from '../pages/Register';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const contentStyle = {
  background: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  padding: '0',
  minWidth: 350,
  maxWidth: '95vw',
  maxHeight: '95vh',
  overflowY: 'auto',
  position: 'relative'
};

export default function RegisterModal({ open, onClose, onSwitchToLogin }) {
  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
        <Register isModal onSwitchToLogin={onSwitchToLogin} />
      </div>
    </div>
  );
}
