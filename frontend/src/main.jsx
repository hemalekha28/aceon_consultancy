import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from "./App";
import './tw.css';
import './index.css';
import { AuthProvider } from './context/authContext';
import { CartProvider } from './context/cartContext';
import { NotificationProvider } from './context/notificationContext';
import { CompareProvider } from './context/compareContext';
import { WishlistProvider } from './context/wishlistContext';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </StrictMode>
  );
}
