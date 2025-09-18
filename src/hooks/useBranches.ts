import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';

export interface Branch {
  id?: string;
  name: string;
  address: string;
  email: string;
  location: string;
  phone: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt?: string;
  updatedAt?: string;
}

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { queryDocuments } = useDatabase();

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all branches first, then filter client-side for better compatibility
      const allBranches = await queryDocuments<Branch>('branches', []);
      
      // Filter for active branches or branches without status field
      const branchesData = allBranches.filter(branch => 
        !branch.status || branch.status === 'active'
      );
      
      setBranches(branchesData);
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError('Failed to load branches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    
    // Listen for database updates
    const handleDatabaseUpdate = (event: CustomEvent) => {
      const { collectionPath } = event.detail;
      
      if (collectionPath === 'branches' || collectionPath.startsWith('branches/')) {
        console.log('Branches updated, refetching...');
        fetchBranches();
      }
    };
    
    window.addEventListener('database-update', handleDatabaseUpdate as EventListener);
    
    return () => {
      window.removeEventListener('database-update', handleDatabaseUpdate as EventListener);
    };
  }, []);

  return {
    branches,
    isLoading,
    error,
    refetch: fetchBranches
  };
};