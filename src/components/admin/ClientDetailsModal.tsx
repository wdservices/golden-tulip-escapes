import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ClientStatus } from "@/types/index";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useForm } from "@/hooks/useForm";
import { updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface ClientDetailsModalProps {
  client: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ClientDetailsModal = ({ client, isOpen, onClose, onUpdate }: ClientDetailsModalProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { values, setValues, handleChange, handleSubmit, errors } = useForm(
    {
      displayName: "",
      email: "",
      phoneNumber: "",
      status: "active" as ClientStatus,
      isAdmin: false,
    },
    {
      displayName: { required: true },
      email: { required: true, email: true },
    },
    async (formValues) => {
      if (!client) return;
      
      try {
        setIsSaving(true);
        await updateDoc(doc(db, "users", client.id), {
          displayName: formValues.displayName,
          email: formValues.email,
          phoneNumber: formValues.phoneNumber,
          isAdmin: formValues.isAdmin,
          updatedAt: new Date(),
        });
        
        toast({
          title: "Success",
          description: "Client updated successfully"
        });
        onUpdate();
        setIsEditing(false);
      } catch (error) {
        console.error("Error updating client:", error);
        toast({
          title: "Error",
          description: "Failed to update client",
          variant: "destructive"
        });
      } finally {
        setIsSaving(false);
      }
    }
  );

  // Only update form values when client ID changes or when modal opens
  useEffect(() => {
    if (client && isOpen) {
      const lastSignInDate = client.lastSignInAt ? (
        client.lastSignInAt instanceof Date ? client.lastSignInAt :
        typeof client.lastSignInAt === 'object' && client.lastSignInAt.toDate ?
        client.lastSignInAt.toDate() : new Date(client.lastSignInAt)
      ) : null;

      setValues({
        displayName: client.displayName || "",
        email: client.email || "",
        phoneNumber: client.phoneNumber || "",
        status: (lastSignInDate && 
          new Date().getTime() - lastSignInDate.getTime() < 30 * 24 * 60 * 60 * 1000
        ) ? 'active' : 'inactive',
        isAdmin: client.isAdmin || false,
      });
    }
  }, [client?.id, isOpen, setValues]); // Only depend on client ID and modal open state

  if (!client) return null;

  const lastActive = client.lastSignInAt ? formatDateTime(
    client.lastSignInAt instanceof Date ? client.lastSignInAt :
    typeof client.lastSignInAt === 'object' && client.lastSignInAt.toDate ?
    client.lastSignInAt.toDate() : new Date(client.lastSignInAt)
  ) : 'Never';

  const joinDate = client.createdAt ? formatDate(
    client.createdAt instanceof Date ? client.createdAt :
    typeof client.createdAt === 'object' && client.createdAt.toDate ?
    client.createdAt.toDate() : new Date(client.createdAt)
  ) : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {client.displayName || 'Client Details'}
            {client.isAdmin && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                Admin
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                name="displayName"
                value={values.displayName}
                onChange={handleChange}
                disabled={!isEditing || isSaving}
              />
              {errors.displayName && <p className="text-sm text-red-500">{errors.displayName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                disabled={!isEditing || isSaving}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={values.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing || isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                <Badge className={values.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {values.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {values.status === 'active' 
                    ? 'User has been active recently' 
                    : 'User has not been active in the last 30 days'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                <p>{joinDate}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Active</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                <p>{lastActive}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Total Bookings</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                <p>{client.bookingIds?.length || 0} bookings</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Admin Privileges</Label>
              <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted/50">
                <input
                  type="checkbox"
                  id="isAdmin"
                  name="isAdmin"
                  checked={values.isAdmin}
                  onChange={handleChange}
                  disabled={!isEditing || isSaving}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isAdmin" className="!m-0">
                  Grant admin access
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            {isEditing ? (
              <>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    setValues({
                      displayName: client.displayName || "",
                      email: client.email || "",
                      phoneNumber: client.phoneNumber || "",
                      status: values.status,
                      isAdmin: client.isAdmin || false,
                    });
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Client
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
