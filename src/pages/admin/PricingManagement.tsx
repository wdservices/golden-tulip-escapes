import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Hotel, Loader2, Tag, Droplet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

type PricingRule = {
  id: string;
  roomType: string;
  period: string;
  price: number;
  minNights: number;
  isActive: boolean;
  duration?: number; // For spa services
};

type ItemType = {
  id: string;
  name: string;
};

// Mock data - replace with actual API calls
const roomTypes: ItemType[] = [
  { id: "deluxe", name: "Deluxe Room" },
  { id: "executive", name: "Executive Suite" },
  { id: "presidential", name: "Presidential Suite" },
  { id: "family", name: "Family Suite" },
  { id: "standard", name: "Standard Room" },
];

const spaServices: ItemType[] = [
  { id: "couples-massage", name: "Couples Massage" },
  { id: "aromatherapy", name: "Aromatherapy" },
  { id: "hot-stone", name: "Hot Stone Therapy" },
  { id: "facial", name: "Facial Treatment" },
];

const pricingPeriods: ItemType[] = [
  { id: "peak", name: "Peak Season" },
  { id: "offpeak", name: "Off-Peak" },
  { id: "holiday", name: "Holiday" },
];

// Initial pricing data
const initialRoomPricing: PricingRule[] = [
  {
    id: "1",
    roomType: "deluxe",
    period: "peak",
    price: 50000,
    minNights: 2,
    isActive: true,
  },
  {
    id: "2",
    roomType: "executive",
    period: "peak",
    price: 75000,
    minNights: 2,
    isActive: true,
  },
];

const initialSpaPricing: PricingRule[] = [
  {
    id: "s1",
    roomType: "couples-massage",
    period: "peak",
    price: 25000,
    minNights: 0,
    duration: 60,
    isActive: true,
  },
  {
    id: "s2",
    roomType: "aromatherapy",
    period: "peak",
    price: 18000,
    minNights: 0,
    duration: 45,
    isActive: true,
  },
];

const PricingManagement = () => {
  const [activeTab, setActiveTab] = useState<"rooms" | "spa">("rooms");
  const [roomPricing, setRoomPricing] = useState<PricingRule[]>(initialRoomPricing);
  const [spaPricing, setSpaPricing] = useState<PricingRule[]>(initialSpaPricing);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  
  const [formData, setFormData] = useState<Partial<PricingRule>>({
    roomType: "",
    period: "peak",
    price: 0,
    minNights: 1,
    isActive: true,
    duration: 30,
  });

  // Handle input changes in the form
  const handleInputChange = (field: keyof PricingRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'price' || field === 'minNights' || field === 'duration'
        ? Number(value) || 0
        : value
    }));
  };

  // Save or update a pricing rule
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingRule) {
        // Update existing rule
        const updateFn = activeTab === 'rooms' ? setRoomPricing : setSpaPricing;
        updateFn(prev => 
          prev.map(rule => 
            rule.id === editingRule.id 
              ? { ...formData, id: rule.id } as PricingRule 
              : rule
          )
        );
      } else {
        // Add new rule
        const newRule: PricingRule = {
          ...formData as Omit<PricingRule, 'id'>,
          id: Date.now().toString(),
        };
        
        if (activeTab === 'rooms') {
          setRoomPricing(prev => [...prev, newRule]);
        } else {
          setSpaPricing(prev => [...prev, newRule]);
        }
      }
      
      // Reset form
      setFormData({
        roomType: "",
        period: "peak",
        price: 0,
        minNights: 1,
        isActive: true,
        duration: 30,
      });
      setEditingRule(null);
      setIsAddingRule(false);
    } catch (error) {
      console.error("Error saving pricing rule:", error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false);
    }
  };

  // Edit an existing rule
  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      roomType: rule.roomType,
      period: rule.period,
      price: rule.price,
      minNights: rule.minNights,
      isActive: rule.isActive,
      duration: rule.duration,
    });
    setIsAddingRule(true);
  };

  // Delete a pricing rule
  const handleDeleteRule = (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      if (activeTab === 'rooms') {
        setRoomPricing(prev => prev.filter(rule => rule.id !== id));
      } else {
        setSpaPricing(prev => prev.filter(rule => rule.id !== id));
      }
    }
  };

  // Toggle rule active status
  const toggleRuleStatus = (id: string) => {
    const updateFn = activeTab === 'rooms' ? setRoomPricing : setSpaPricing;
    updateFn(prev => 
      prev.map(rule => 
        rule.id === id 
          ? { ...rule, isActive: !rule.isActive } 
          : rule
      )
    );
  };

  // Get current items based on active tab
  const currentItems = activeTab === 'rooms' ? roomTypes : spaServices;
  const currentPricing = activeTab === 'rooms' ? roomPricing : spaPricing;

  // Calculate statistics
  const activeRoomRules = roomPricing.filter(rule => rule.isActive).length;
  const inactiveRoomRules = roomPricing.length - activeRoomRules;
  const activeSpaRules = spaPricing.filter(rule => rule.isActive).length;
  const inactiveSpaRules = spaPricing.length - activeSpaRules;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">Pricing Management</h1>
          <p className="text-white/70">
            Manage room and spa service pricing
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingRule(null);
            setFormData({
              roomType: "",
              period: "peak",
              price: 0,
              minNights: 1,
              isActive: true,
              duration: 30,
            });
            setIsAddingRule(true);
          }}
          className="flex items-center gap-2 bg-yellow-400 text-[hsl(var(--royal-blue-dark))] border-yellow-400 hover:bg-yellow-300"
        >
          <Plus className="h-4 w-4" />
          Add Pricing Rule
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "rooms" | "spa")}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6 bg-white/10 border-white/20">
          <TabsTrigger value="rooms" className="flex items-center gap-2 text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <Hotel className="h-4 w-4" />
            Room Pricing
          </TabsTrigger>
          <TabsTrigger value="spa" className="flex items-center gap-2 text-white data-[state=active]:bg-yellow-400 data-[state=active]:text-[hsl(var(--royal-blue-dark))]">
            <Droplet className="h-4 w-4" />
            Spa Services
          </TabsTrigger>
        </TabsList>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {activeTab === 'rooms' ? 'Active Room Rules' : 'Active Spa Rules'}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <Tag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTab === 'rooms' ? activeRoomRules : activeSpaRules}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {activeTab === 'rooms' ? 'Inactive Room Rules' : 'Inactive Spa Rules'}
              </CardTitle>
              <div className="h-4 w-4 text-muted-foreground">
                <Tag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTab === 'rooms' ? inactiveRoomRules : inactiveSpaRules}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAddingRule && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingRule ? 'Edit' : 'Add New'} Pricing Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveRule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomType">
                      {activeTab === 'rooms' ? 'Room Type' : 'Service'}
                    </Label>
                    <Select
                      value={formData.roomType}
                      onValueChange={(value) => handleInputChange('roomType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${activeTab === 'rooms' ? 'room type' : 'service'}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {currentItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period">Pricing Period</Label>
                    <Select
                      value={formData.period}
                      onValueChange={(value) => handleInputChange('period', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingPeriods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="Enter price"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minNights">
                      {activeTab === 'rooms' ? 'Minimum Nights' : 'Minimum Hours'}
                    </Label>
                    <Input
                      id="minNights"
                      type="number"
                      value={formData.minNights || ''}
                      onChange={(e) => handleInputChange('minNights', e.target.value)}
                      placeholder="Enter minimum nights/hours"
                    />
                  </div>

                  {activeTab === 'spa' && (
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration || ''}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="Enter duration in minutes"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingRule(false);
                      setEditingRule(null);
                      setFormData({
                        roomType: "",
                        period: "peak",
                        price: 0,
                        minNights: 1,
                        isActive: true,
                        duration: 30,
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingRule ? (
                      'Update Rule'
                    ) : (
                      'Add Rule'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Pricing Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'rooms' ? 'Room Pricing Rules' : 'Spa Service Pricing Rules'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentPricing.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pricing rules found. Click "Add Pricing Rule" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{activeTab === 'rooms' ? 'Room Type' : 'Service'}</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>{activeTab === 'rooms' ? 'Min Nights' : 'Min Hours'}</TableHead>
                    {activeTab === 'spa' && <TableHead>Duration</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPricing.map((rule) => {
                    const item = currentItems.find(item => item.id === rule.roomType);
                    const period = pricingPeriods.find(p => p.id === rule.period);
                    
                    return (
                      <TableRow key={rule.id}>
                        <TableCell>{item?.name || rule.roomType}</TableCell>
                        <TableCell>{period?.name || rule.period}</TableCell>
                        <TableCell>₦{rule.price.toLocaleString()}</TableCell>
                        <TableCell>{rule.minNights}</TableCell>
                        {activeTab === 'spa' && (
                          <TableCell>{rule.duration} min</TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center">
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={() => toggleRuleStatus(rule.id)}
                              className="mr-2"
                            />
                            <span>{rule.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default PricingManagement;
