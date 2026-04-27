import { BrowserRouter } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Providers } from '@/components/Providers';
import { AppRoutes } from '@/router';

export function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Providers>
          <AppRoutes />
        </Providers>
      </BrowserRouter>
    </HelmetProvider>
  );
}
