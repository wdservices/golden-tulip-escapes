import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Database, Plus, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";
import { initializeSampleData } from "@/utils/initializeData";
import { toast } from "sonner";


type Settings = {
  siteName: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    siteName: "Golden Tulip",
    currency: "NGN",
    timezone: "Africa/Lagos",
    dateFormat: "DD/MM/YYYY",
    emailNotifications: true,
    smsNotifications: false,
  });
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  const [isInitializingData, setIsInitializingData] = useState(false);
  
  // Get auth context for branch filtering
  const { activeBranchId } = useAuth();
  
  // Fetch current branch name
  useEffect(() => {
    const fetchBranchName = async () => {
      if (activeBranchId) {
        try {
          const branches = await getBranches();
          const branch = branches.find(b => b.id === activeBranchId);
          if (branch) {
            setCurrentBranchName(branch.name);
          }
        } catch (error) {
          console.error("Error fetching branch name:", error);
        }
      }
    };
    
    fetchBranchName();
  }, [activeBranchId]);

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving settings:", settings);
  };

  const handleInitializeData = async () => {
    setIsInitializingData(true);
    try {
      const result = await initializeSampleData();
      if (result.success) {
        toast.success("Sample data initialized successfully! The dashboard should now show analytics.");
      } else {
        toast.error("Failed to initialize sample data. Please try again.");
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("An error occurred while initializing data.");
    } finally {
      setIsInitializingData(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-yellow-400">
          {currentBranchName && (
            <span className="flex items-center">
              <span className="mr-2">{currentBranchName}</span>
              <span className="mx-2">-</span>
            </span>
          )}
          Settings
        </h2>
        {currentBranchName && (
          <div className="flex items-center text-sm text-white/70 mb-1">
            <Building className="h-4 w-4 mr-1 text-yellow-400" />
            <span>{currentBranchName}</span>
          </div>
        )}
        <p className="text-white/70">
          Manage your hotel's configuration
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="general" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">General</TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Notifications</TabsTrigger>
            <TabsTrigger value="payment" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Payment</TabsTrigger>
            <TabsTrigger value="data" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Hotel Name</Label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) => handleInputChange("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => handleInputChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => handleInputChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Lagos">Lagos (GMT+1)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) => handleInputChange("dateFormat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select date format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive SMS notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Initialize Sample Data</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        If your dashboard shows "No Data Available", you can initialize sample data to test the analytics features.
                        This will add sample rooms and bookings to your database.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Sample Data Initialization</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      This will create:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• 5 sample rooms (Standard, Deluxe, Executive, Presidential)</li>
                      <li>• 3 sample bookings with different statuses</li>
                      <li>• Branch information for "Golden Tulip GRA"</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={handleInitializeData}
                    disabled={isInitializingData}
                    className="flex items-center gap-2"
                  >
                    {isInitializingData ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Initialize Sample Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
