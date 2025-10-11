import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '@/components/ErrorFallback';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { registerSW } from 'virtual:pwa-register';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/icons';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Initialize React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const updateSW = registerSW({
        onNeedRefresh() {
          toast({
            title: 'New content available',
            description: 'Reload to update the application',
            action: (
              <button
                onClick={() => updateSW(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Icons.refresh className="mr-2 h-3 w-3" />
                Reload
              </button>
            ),
          });
        },
        onOfflineReady() {
          console.log('App ready to work offline');
        },
      });
    }
  }, [toast]);

  // Handle route changes for analytics
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Track page view with your analytics tool
      if (window.gtag) {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
          page_path: url,
        });
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, componentStack) => {
        // Log error to your error reporting service
        console.error('Application error:', { error, componentStack });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <DatabaseProvider>
              <TooltipProvider>
                <PayPalScriptProvider options={{
                  'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
                  currency: 'USD',
                  intent: 'capture',
                }}>
                  <Elements stripe={stripePromise}>
                    <Component {...pageProps} />
                    <Toaster />
                    <SonnerToaster position="top-center" richColors />
                    <Analytics />
                    <SpeedInsights />
                    <ReactQueryDevtools initialIsOpen={false} />
                  </Elements>
                </PayPalScriptProvider>
              </TooltipProvider>
            </DatabaseProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
