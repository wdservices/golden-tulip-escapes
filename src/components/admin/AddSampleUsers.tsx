import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

const AddSampleUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const setupMockAdmin = () => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).mockUser = {
        id: 'mock-admin-123',
        name: 'Mock Admin',
        email: 'admin@goldentulip.com',
        role: 'admin',
        preferences: {}
      };
      setMessage('Mock admin user set up! Please refresh the page.');
    }
  };

  const sampleUsers = [
    {
      id: 'user1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      phoneNumber: '+1234567890',
      emailVerified: true,
      status: 'active',
      role: 'user',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      lastSignInAt: new Date('2024-01-20'),
      bookingIds: ['booking1', 'booking2']
    },
    {
      id: 'user2',
      email: 'jane.smith@example.com',
      displayName: 'Jane Smith',
      phoneNumber: '+1987654321',
      emailVerified: true,
      status: 'active',
      role: 'user',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      lastSignInAt: new Date('2024-01-18'),
      bookingIds: ['booking3']
    },
    {
      id: 'user3',
      email: 'mike.johnson@example.com',
      displayName: 'Mike Johnson',
      phoneNumber: '+1555123456',
      emailVerified: false,
      status: 'active',
      role: 'user',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      lastSignInAt: null,
      bookingIds: []
    },
    {
      id: 'user4',
      email: 'sarah.wilson@example.com',
      displayName: 'Sarah Wilson',
      phoneNumber: '+1444987654',
      emailVerified: true,
      status: 'active',
      role: 'user',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-19'),
      lastSignInAt: new Date('2024-01-19'),
      bookingIds: ['booking4', 'booking5', 'booking6']
    },
    {
      id: 'user5',
      email: 'admin@goldentulip.com',
      displayName: 'Admin User',
      phoneNumber: '+1333555777',
      emailVerified: true,
      status: 'active',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-21'),
      lastSignInAt: new Date('2024-01-21'),
      bookingIds: []
    }
  ];

  const addSampleUsers = async () => {
    if (!currentUser) {
      setError('You must be logged in to add sample users');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const db = getFirestore();
      
      for (const user of sampleUsers) {
        await setDoc(doc(db, 'users', user.id), user);
        console.log(`Added user: ${user.displayName}`);
      }
      
      setMessage(`Successfully added ${sampleUsers.length} sample users to Firebase!`);
    } catch (err: any) {
      console.error('Error adding sample users:', err);
      setError(`Failed to add sample users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add Sample Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This will add {sampleUsers.length} sample users to the Firebase database for testing the clients page.
        </p>
        
        {message && (
          <Alert>
            <AlertDescription className="text-green-600">
              {message}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert>
            <AlertDescription className="text-red-600">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={addSampleUsers} 
          disabled={loading || !currentUser}
          className="w-full"
        >
          {loading ? 'Adding Users...' : 'Add Sample Users'}
        </Button>
        
        {process.env.NODE_ENV === 'development' && (
          <Button 
            onClick={setupMockAdmin} 
            variant="outline"
            className="w-full"
          >
            Setup Mock Admin (Dev Only)
          </Button>
        )}
        
        {!currentUser && (
          <p className="text-sm text-red-600">
            You must be logged in as an admin to add sample users.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AddSampleUsers;