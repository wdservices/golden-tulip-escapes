import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { BranchStatus, type BranchStatus as BranchStatusType } from "@/types/branch";
import { reconnectFirebase } from "@/lib/firebase";

interface BranchFormProps {
  branch?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const BranchForm = ({ branch, onSuccess, onCancel }: BranchFormProps) => {
  const { toast } = useToast();
  const { addDocument, updateDocument } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    address: branch?.address || '',
    email: branch?.email || '',
    location: branch?.location || '',
    phone: branch?.phone || '',
    status: (branch?.status as BranchStatusType) || 'active',
  });

  const branchStatuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  // Get auth context at component level instead of inside handleSubmit
  const { currentUser, refreshAuthToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting branch form...');
    const startTime = performance.now();
    
    console.log('Current user submitting branch form:', currentUser);
    console.log('Current user keys:', currentUser ? Object.keys(currentUser) : 'No user');
    console.log('Current user ID property:', currentUser?.id);
    
    // Check if user is admin
    if (!currentUser || currentUser.role !== 'admin') {
      console.error('Permission denied: Only admins can manage branches');
      toast({
        title: "Error",
        description: "Permission denied: Only admins can manage branches",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Store currentUser reference to avoid race conditions
    const user = currentUser;
    
    // Verify authentication is still valid
    if (!user.id) {
      console.error('User authentication issue: Missing user ID');
      toast({
        title: "Error",
        description: "Authentication error. Attempting to reconnect...",
        variant: "destructive"
      });
      
      // Try to reconnect Firebase and refresh auth token
      const reconnected = await reconnectFirebase();
      
      // Check if reconnection was successful and user is now authenticated
      if (reconnected && user) {
        // Try to get the current user again after reconnection
        await refreshAuthToken();
        
        // If still no valid user, ask to refresh page
        if (!user.id) {
          toast({
            title: "Error",
            description: "Authentication error persists. Please refresh the page and try again.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Success",
          description: "Reconnected successfully. Continuing submission..."
        });
      } else {
        toast({
          title: "Error",
          description: "Could not reconnect. Please refresh the page and try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    }
    
    // Refresh auth token before database operations
    try {
      console.log('Refreshing authentication token...');
      const refreshed = await refreshAuthToken();
      console.log('Token refresh result:', refreshed ? 'Success' : 'Failed');
      
      // Double check user authentication after token refresh
      if (!user || !user.id) {
        console.error('User authentication issue: Still missing user ID after token refresh');
        toast({
          title: "Error",
          description: "Authentication error. Please refresh the page and try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } catch (tokenError) {
      console.error('Failed to refresh authentication token:', tokenError);
      // Continue anyway, the operation might still succeed
    }

    try {
      // Ensure we have a valid user ID before proceeding
      if (!user || !user.id) {
        console.error('Cannot update branch: User ID is missing');
        toast({
          title: "Error",
          description: "Authentication error. Please refresh the page and try again.",
          variant: "destructive"
        });
        return;
      }
      
      const branchData = {
        name: formData.name,
        address: formData.address,
        email: formData.email,
        location: formData.location,
        phone: formData.phone,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Branch data to submit:', branchData);

      if (branch && branch.id) {
        console.log(`Updating branch with ID: ${branch.id}`);
        const updateStartTime = performance.now();
        let retryCount = 0;
        const maxRetries = 2;
        let success = false;
        
        const attemptUpdate = async (): Promise<boolean> => {
          try {
            await updateDocument('branches', branch.id, branchData);
            const updateEndTime = performance.now();
            console.log(`Performance: Branch update operation took ${Math.round(updateEndTime - updateStartTime)}ms`);
            success = true;
            toast({
              title: "Success",
              description: "Branch updated successfully"
            });
            // Call onSuccess callback after successful update
            if (onSuccess) onSuccess();
            return true;
          } catch (updateError: any) {
            console.error('Error updating branch:', updateError);
            
            // Check if it's a Firebase session error (400 Bad Request)
            if (updateError.message && 
                (updateError.message.includes('400') || 
                 updateError.message.includes('Bad Request') || 
                 updateError.message.includes('permission'))) {
              
              if (retryCount < maxRetries) {
                console.log(`Retrying update operation (${retryCount + 1}/${maxRetries})...`);
                retryCount++;
                // Wait a moment before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return attemptUpdate();
              } else {
                toast({
                  title: "Error",
                  description: "Session expired. Please refresh the page and try again.",
                  variant: "destructive"
                });
              }
            } else {
              toast({
                title: "Error",
                description: "Failed to update branch",
                variant: "destructive"
              });
            }
            
            return false;
          }
        };
        
        if (!(await attemptUpdate())) {
          throw new Error('Failed to update branch after retries');
        }
      } else {
        console.log('Adding new branch');
        branchData.createdAt = new Date().toISOString();
        branchData.updatedAt = new Date().toISOString();
        const addStartTime = performance.now();
        let retryCount = 0;
        const maxRetries = 2;
        
        const attemptAdd = async (): Promise<boolean> => {
          try {
            // Double-check user authentication before proceeding
            if (!currentUser || !currentUser.id) {
              console.error('Cannot add branch: User ID is missing');
              toast({
                title: "Error",
                description: "Authentication error. Attempting to reconnect...",
                variant: "destructive"
              });
              
              // Try to reconnect Firebase and refresh auth token
              const reconnected = await reconnectFirebase();
              
              // Check if reconnection was successful and user is now authenticated
              if (reconnected && currentUser) {
                // Try to get the current user again after reconnection
                await refreshAuthToken();
                
                // If still no valid user, ask to refresh page
                if (!currentUser || !currentUser.id) {
                  toast({
                    title: "Error",
                    description: "Authentication error persists. Please refresh the page and try again.",
                    variant: "destructive"
                  });
                  return false;
                }
                
                toast({
                  title: "Success",
                  description: "Reconnected successfully. Continuing submission..."
                });
              } else {
                toast({
                  title: "Error",
                  description: "Could not reconnect. Please refresh the page and try again.",
                  variant: "destructive"
                });
                return false;
              }
            }
            
            await addDocument('branches', branchData);
            const addEndTime = performance.now();
            console.log(`Performance: Branch add operation took ${Math.round(addEndTime - addStartTime)}ms`);
            toast({
              title: "Success",
              description: "Branch added successfully"
            });
            // Call onSuccess callback after successful add
            if (onSuccess) onSuccess();
            return true;
          } catch (addError: any) {
            console.error('Error adding branch:', addError);
            
            // Check if it's a Firebase session error (400 Bad Request)
            if (addError.message && 
                (addError.message.includes('400') || 
                 addError.message.includes('Bad Request') || 
                 addError.message.includes('permission'))) {
              
              if (retryCount < maxRetries) {
                console.log(`Retrying add operation (${retryCount + 1}/${maxRetries})...`);
                retryCount++;
                // Wait a moment before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return attemptAdd();
              } else {
                toast({
                  title: "Error",
                  description: "Session expired. Please refresh the page and try again.",
                  variant: "destructive"
                });
              }
            } else {
              toast({
                title: "Error",
                description: "Failed to add branch",
                variant: "destructive"
              });
            }
            
            return false;
          }
        };
        
        if (!(await attemptAdd())) {
          throw new Error('Failed to add branch after retries');
        }
      }

      const endTime = performance.now();
      console.log(`Branch form submission completed in ${Math.round(endTime - startTime)}ms`);
      // onSuccess is now called directly after successful operations
    } catch (error) {
      console.error('Error saving branch:', error);
      toast({
        title: "Error",
        description: "Failed to save branch",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Branch Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: BranchStatusType) => setFormData({...formData, status: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch status" />
            </SelectTrigger>
            <SelectContent>
              {branchStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {branch ? 'Update Branch' : 'Add Branch'}
        </Button>
      </div>
    </form>
  );
};
