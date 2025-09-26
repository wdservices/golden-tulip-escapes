import { useState, useEffect } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSampleData } from '@/utils/initializeData';


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
  const { userMeta, activeBranchId } = useAuth();

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all branches first, then filter client-side for better compatibility
      const allBranches = await queryDocuments<Branch>('branches', []);
      
      // Filter for active branches or branches without status field
      let branchesData = allBranches.filter(branch => 
        !branch.status || branch.status === 'active'
      );
      
      // For dropdown purposes, show all active branches
      // Users can still be restricted by activeBranchId in other contexts
      // but for filtering/selection, they should see all available branches
      
      // If no branches exist, initialize sample data
      if (branchesData.length === 0) {
        console.log('No branches found, initializing sample data...');
        try {
          await initializeSampleData();
          // Refetch branches after initialization
          const newBranches = await queryDocuments<Branch>('branches', []);
          const activeBranches = newBranches.filter(branch => 
            !branch.status || branch.status === 'active'
          );
          setBranches(activeBranches);
          console.log('Sample data initialized successfully');
        } catch (initError) {
          console.error('Failed to initialize sample data:', initError);
        }
      } else {
        setBranches(branchesData);
      }
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
  }, [userMeta, activeBranchId]);

  return {
    branches,
    isLoading,
    error,
    refetch: fetchBranches
  };
};