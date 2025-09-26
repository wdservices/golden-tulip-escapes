import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { checkNetworkConnectivity } from '@/utils/firebaseErrorHandler';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFirebaseReachable, setIsFirebaseReachable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnectivity = async () => {
    setIsChecking(true);
    try {
      const firebaseConnected = await checkNetworkConnectivity();
      setIsFirebaseReachable(firebaseConnected);
      setLastChecked(new Date());
    } catch (error) {
      setIsFirebaseReachable(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkConnectivity();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsFirebaseReachable(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check only if offline
    if (!navigator.onLine) {
      checkConnectivity();
    }

    // Periodic check every 2 minutes (reduced frequency)
    const interval = setInterval(() => {
      // Only check if we're offline or Firebase was unreachable
      if (!isOnline || !isFirebaseReachable) {
        checkConnectivity();
      }
    }, 120000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if everything is working fine
  if (isOnline && isFirebaseReachable) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-orange-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className="flex-1">
          {!isOnline ? (
            'No internet connection. Please check your network settings.'
          ) : !isFirebaseReachable ? (
            'Unable to connect to Firebase services. Some features may not work properly.'
          ) : (
            'Connection issues detected.'
          )}
          {lastChecked && (
            <span className="text-xs text-muted-foreground ml-2">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </AlertDescription>
        <Button
          variant="outline"
          size="sm"
          onClick={checkConnectivity}
          disabled={isChecking}
          className="ml-2"
        >
          {isChecking ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          <span className="ml-1">Retry</span>
        </Button>
      </div>
    </Alert>
  );
};

export default NetworkStatus;