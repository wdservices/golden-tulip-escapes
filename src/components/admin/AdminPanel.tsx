import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useCollection } from '@/hooks/useCollection';
import { Loader2, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { getBranches } from '@/services/branchService';


export function AdminPanel() {
  const { toast } = useToast();
  const { currentUser, updateUserRole, userMeta, activeBranchId, setActiveBranchId } = useAuth();
  const { data: users, loading, error } = useCollection('users');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [currentBranchName, setCurrentBranchName] = useState<string>('All Branches');
  
  // Determine if user is HQ admin
  const isHqAdmin = userMeta.role === 'hq-admin';
  
  // Load current branch name
  useEffect(() => {
    async function loadBranchName() {
      if (!activeBranchId) {
        return;
      }
      
      try {
        const branches = await getBranches();
        const branch = branches.find(b => b.id === activeBranchId);
        if (branch) {
          setCurrentBranchName(branch.name);
        }
      } catch (err) {
        console.error('Failed to load branch name:', err);
      }
    }
    
    loadBranchName();
  }, [activeBranchId]);

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    try {
      setUpdatingUserId(userId);
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateUserRole(userId, newRole as 'admin' | 'user');
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading users: {error.message}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Branch Info Header */}
      <div className="flex items-center space-x-2">
        <Building className="h-5 w-5 text-muted-foreground" />
        <span className="text-muted-foreground">Current Branch:</span>
        <span className="font-medium">{currentBranchName}</span>
      </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              {currentBranchName 
                ? `Manage user roles and permissions for ${currentBranchName}` 
                : 'Manage user roles and permissions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || 'user'}</TableCell>
                    <TableCell>
                      {user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRole(user.id, user.role)}
                          disabled={updatingUserId === user.id}
                        >
                          {updatingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
}
