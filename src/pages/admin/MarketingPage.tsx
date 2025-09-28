import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBranches } from "@/services/branchService";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, MessageSquare, Bell, Calendar, Plus, Building } from "lucide-react";

type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'promo';
  status: CampaignStatus;
  scheduledDate: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
}

export const MarketingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("campaigns");
  const { activeBranchId } = useAuth();
  const [currentBranchName, setCurrentBranchName] = useState<string>("");
  
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
  
  // Mock data - replace with actual API call
  const [campaigns] = useState<Campaign[]>([
    {
      id: "C001",
      name: "Summer Special 2024",
      type: "email",
      status: "sent",
      scheduledDate: "2024-06-01T10:00:00Z",
      recipients: 1250,
      openRate: 42,
      clickRate: 8
    },
    // Add more mock data as needed
  ]);

  const getStatusVariant = (status: CampaignStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'promo':
        return <Calendar className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-yellow-400">
            {currentBranchName && (
              <span className="flex items-center">
                <span className="mr-2">{currentBranchName}</span>
                <span className="mx-2">-</span>
              </span>
            )}
            Marketing Center
          </h2>
          {currentBranchName && (
            <div className="flex items-center text-sm text-white/70 mb-1">
              <Building className="h-4 w-4 mr-1 text-yellow-400" />
              <span>{currentBranchName}</span>
            </div>
          )}
        </div>
        <Button className="bg-yellow-400 text-blue-900 border-yellow-400 hover:bg-yellow-300">
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      
      <Tabs defaultValue="campaigns" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="campaigns" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Campaigns</TabsTrigger>
            <TabsTrigger value="templates" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Templates</TabsTrigger>
            <TabsTrigger value="audience" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Audience</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-blue-900">Analytics</TabsTrigger>
          </TabsList>
          
          {activeTab === "campaigns" && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search campaigns..."
                className="w-full pl-8 sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>
        
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <CardTitle>Campaigns</CardTitle>
                  <CardDescription>Manage your marketing campaigns and track their performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {getTypeIcon(campaign.type)}
                          </div>
                          <span className="font-medium">{campaign.name}</span>
                        </div>
                        <Badge className={getStatusVariant(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Recipients</p>
                          <p className="font-medium">{campaign.recipients.toLocaleString()}</p>
                        </div>
                        {campaign.openRate !== undefined && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="font-medium">{campaign.openRate}%</p>
                          </div>
                        )}
                        {campaign.clickRate !== undefined && (
                          <div className="space-y-1">
                            <p className="text-muted-foreground">Click Rate</p>
                            <p className="font-medium">{campaign.clickRate}%</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {new Date(campaign.scheduledDate).toLocaleDateString()}
                        </p>
                        <Button variant="outline" size="sm">View Report</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage your email templates for marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No templates found. Create your first template to get started.</p>
                <Button className="mt-4">Create Template</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>Audience Segments</CardTitle>
              <CardDescription>Create and manage your customer segments for targeted campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No audience segments found. Create your first segment to get started.</p>
                <Button className="mt-4">Create Segment</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Analytics</CardTitle>
              <CardDescription>View and analyze the performance of your marketing campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No analytics data available. Send your first campaign to see performance metrics.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingPage;
