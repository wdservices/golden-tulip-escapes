import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium">General Settings</h3>
              <p className="text-sm text-gray-500">Manage your general application settings</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-sm text-gray-500">Manage user roles and permissions</p>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500">Configure email notification settings</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Backup & Restore</h3>
              <p className="text-sm text-gray-500">Manage system backups</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
