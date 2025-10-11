import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Log the error to an error reporting service
  React.useEffect(() => {
    console.error('Error boundary caught an error:', error);
    // You can also log the error to an error reporting service here
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Alert variant="destructive">
          <Icons.alertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mb-4">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <Icons.refresh className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={resetErrorBoundary}
              className="flex-1"
            >
              <Icons.undo className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Alert>
        
        {/* Only show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-4 bg-muted/50 rounded-md text-sm">
            <summary className="font-medium cursor-pointer mb-2">Error Details</summary>
            <pre className="whitespace-pre-wrap break-words text-xs">
              {error.stack || error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// This component can be used to wrap parts of your app with error boundaries
export function withErrorBoundary<T extends React.ComponentType>(
  Component: T,
  FallbackComponent: React.ComponentType<ErrorFallbackProps> = ErrorFallback
) {
  return function WithErrorBoundary(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary
        FallbackComponent={FallbackComponent}
        onError={(error, info) => {
          console.error('Error in component:', { error, info });
        }}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
