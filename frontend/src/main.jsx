import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from "./App";
import './tw.css';
import './index.css';

import { AuthProvider } from './context/authContext';
import { CartProvider } from './context/cartContext';
import { NotificationProvider } from './context/notificationContext';
import { CompareProvider } from './context/compareContext';
import { WishlistProvider } from './context/wishlistContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <CompareProvider>
              <WishlistProvider>
                <App />
              </WishlistProvider>
            </CompareProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </StrictMode>
  );
}
