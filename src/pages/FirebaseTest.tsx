import React, { useState } from 'react';
import { testFirebaseConnection, checkNetworkConnectivity } from '@/utils/firebaseTest';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FirebaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkResults, setNetworkResults] = useState<any>(null);

  const runFirebaseTest = async () => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      console.log('Starting Firebase connection test...');
      const results = await testFirebaseConnection();
      setTestResults(results);
      console.log('Firebase test results:', results);
    } catch (error) {
      console.error('Error running Firebase test:', error);
      setTestResults({ success: false, error: 'test-failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runNetworkTest = async () => {
    setIsLoading(true);
    setNetworkResults(null);
    
    try {
      console.log('Starting network connectivity test...');
      const results = await checkNetworkConnectivity();
      setNetworkResults(results);
      console.log('Network test results:', results);
    } catch (error) {
      console.error('Error running network test:', error);
      setNetworkResults({ success: false, error: 'test-failed', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    await runNetworkTest();
    await runFirebaseTest();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Firebase Connection Diagnostics</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={runNetworkTest} 
                disabled={isLoading}
                variant="outline"
              >
                Test Network Connectivity
              </Button>
              <Button 
                onClick={runFirebaseTest} 
                disabled={isLoading}
                variant="outline"
              >
                Test Firebase Connection
              </Button>
              <Button 
                onClick={runAllTests} 
                disabled={isLoading}
              >
                Run All Tests
              </Button>
            </div>
            {isLoading && (
              <Alert>
                <AlertDescription>
                  Running tests... Check the browser console for detailed logs.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {networkResults && (
          <Card>
            <CardHeader>
              <CardTitle className={networkResults.success ? 'text-green-600' : 'text-red-600'}>
                Network Connectivity Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {networkResults.success ? '✅ Success' : '❌ Failed'}</p>
                {!networkResults.success && (
                  <>
                    <p><strong>Error Type:</strong> {networkResults.error}</p>
                    <p><strong>Details:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(networkResults.details, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {testResults && (
          <Card>
            <CardHeader>
              <CardTitle className={testResults.success ? 'text-green-600' : 'text-red-600'}>
                Firebase Connection Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Status:</strong> {testResults.success ? '✅ Success' : '❌ Failed'}</p>
                {!testResults.success && (
                  <>
                    <p><strong>Error Type:</strong> {testResults.error}</p>
                    <p><strong>Details:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                      {JSON.stringify(testResults.details, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Open the browser's Developer Tools (F12)</p>
              <p>2. Go to the Console tab</p>
              <p>3. Click "Run All Tests" to diagnose Firebase connectivity issues</p>
              <p>4. Check the console for detailed logs and error messages</p>
              <p>5. If you see "network-request-failed" errors, this indicates a network connectivity issue</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirebaseTest;