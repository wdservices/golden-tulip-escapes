import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { toast } from "sonner";

interface BranchFormProps {
  branch?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type BranchStatus = 'active' | 'inactive' | 'maintenance';

export const BranchForm = ({ branch, onSuccess, onCancel }: BranchFormProps) => {
  const { addDocument, updateDocument } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    location: branch?.location || {
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      coordinates: {
        lat: 0,
        lng: 0
      }
    },
    contact: branch?.contact || {
      email: '',
      phone: '',
      website: ''
    },
    description: branch?.description || '',
    status: (branch?.status as BranchStatus) || 'active',
    amenities: branch?.amenities || [],
    policies: branch?.policies || {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: 'Free cancellation up to 24 hours before check-in',
      pets: 'Not allowed',
      payment: 'Credit card required at check-in'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const branchData = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };

      if (branch) {
        await updateDocument('branches', branch.id, branchData);
        toast.success('Branch updated successfully');
      } else {
        branchData.createdAt = new Date().toISOString();
        await addDocument('branches', branchData);
        toast.success('Branch added successfully');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handleContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handlePolicyChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      policies: {
        ...prev.policies,
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Basic Information</h3>
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
              <Label>Status</Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as BranchStatus})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.location.address}
                onChange={(e) => handleLocationChange('address', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.location.city}
                onChange={(e) => handleLocationChange('city', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.location.state}
                onChange={(e) => handleLocationChange('state', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                value={formData.location.country}
                onChange={(e) => handleLocationChange('country', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.contact.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.contact.website}
                onChange={(e) => handleContactChange('website', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Policies</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in Time</Label>
              <Input
                id="checkIn"
                type="time"
                value={formData.policies.checkIn}
                onChange={(e) => handlePolicyChange('checkIn', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Check-out Time</Label>
              <Input
                id="checkOut"
                type="time"
                value={formData.policies.checkOut}
                onChange={(e) => handlePolicyChange('checkOut', e.target.value)}
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="cancellation">Cancellation Policy</Label>
              <Input
                id="cancellation"
                value={formData.policies.cancellation}
                onChange={(e) => handlePolicyChange('cancellation', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            placeholder="Provide a detailed description of the branch..."
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
