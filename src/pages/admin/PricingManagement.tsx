import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Tag, Clock, Hotel, Spa } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data - replace with actual API calls
const roomTypes = [
  { id: "deluxe", name: "Deluxe Room" },
  { id: "executive", name: "Executive Suite" },
  { id: "presidential", name: "Presidential Suite" },
];

const spaServices = [
  { id: "couples-massage", name: "Couples Massage" },
  { id: "aromatherapy", name: "Aromatherapy Session" },
  { id: "full-day", name: "Full Day Spa Package" },
  { id: "facial", name: "Luxury Facial Treatment" },
];

const pricingPeriods = [
  { id: "peak", name: "Peak Season" },
  { id: "offpeak", name: "Off-Peak" },
  { id: "holiday", name: "Holiday" },
];

type PricingRule = {
  id: string;
  roomType: string;
  period: string;
  price: number;
  minNights: number;
  isActive: boolean;
};

export const PricingManagement = () => {
  const [activeTab, setActiveTab] = useState("rooms");
  
  const [roomPricing, setRoomPricing] = useState<PricingRule[]>([
    {
      id: "1",
      roomType: "deluxe",
      period: "peak",
      price: 50000,
      minNights: 2,
      isActive: true,
    },
  ]);

  const [spaPricing, setSpaPricing] = useState<PricingRule[]>([
    {
      id: "s1",
      roomType: "couples-massage",
      period: "peak",
      price: 25000,
      minNights: 0,
      isActive: true,
    },
  ]);

  const [newRoomRule, setNewRoomRule] = useState<Omit<PricingRule, 'id'>>({ 
    roomType: "", 
    period: "", 
    price: 0, 
    minNights: 1,
    isActive: true 
  });

  const [newSpaRule, setNewSpaRule] = useState<Omit<PricingRule, 'id'>>({ 
    roomType: "", 
    period: "", 
    price: 0, 
    minNights: 0,
    isActive: true 
  });

  const addPricingRule = (type: 'room' | 'spa') => {
    if (type === 'room') {
      if (!newRoomRule.roomType || !newRoomRule.period) return;
      
      setRoomPricing([
        ...roomPricing,
        {
          ...newRoomRule,
          id: `r${Date.now()}`,
        },
      ]);
      
      setNewRoomRule({ 
        roomType: "", 
        period: "", 
        price: 0, 
        minNights: 1,
        isActive: true 
      });
    } else {
      if (!newSpaRule.roomType || !newSpaRule.period) return;
      
      setSpaPricing([
        ...spaPricing,
        {
          ...newSpaRule,
          id: `s${Date.now()}`,
        },
      ]);
      
      setNewSpaRule({ 
        roomType: "", 
        period: "", 
        price: 0, 
        minNights: 0,
        isActive: true 
      });
    }
  };

  const removePricingRule = (id: string, type: 'room' | 'spa') => {
    if (type === 'room') {
      setRoomPricing(roomPricing.filter(rule => rule.id !== id));
    } else {
      setSpaPricing(spaPricing.filter(rule => rule.id !== id));
    }
  };

  const toggleRuleStatus = (id: string, type: 'room' | 'spa') => {
    if (type === 'room') {
      setRoomPricing(roomPricing.map(rule => 
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      ));
    } else {
      setSpaPricing(spaPricing.map(rule => 
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
      ));
    }
  };

  const updatePricingRule = (id: string, field: keyof PricingRule, value: any, type: 'room' | 'spa') => {
    if (type === 'room') {
      setRoomPricing(roomPricing.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      ));
    } else {
      setSpaPricing(spaPricing.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      ));
    }
  };

  // Calculate total pricing rules
  const activeRoomRules = roomPricing.filter(rule => rule.isActive).length;
  const inactiveRoomRules = roomPricing.length - activeRoomRules;
  
  const activeSpaRules = spaPricing.filter(rule => rule.isActive).length;
  const inactiveSpaRules = spaPricing.length - activeSpaRules;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
        <p className="text-muted-foreground">
          Manage room rates, spa services, seasonal pricing, and special offers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms" className="flex items-center gap-2">
            <Hotel className="h-4 w-4" />
            Room Pricing
          </TabsTrigger>
          <TabsTrigger value="spa" className="flex items-center gap-2">
            <Spa className="h-4 w-4" />
            Spa Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Room Pricing Rules
                </CardTitle>
                <Tag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomPricing.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeRoomRules} active • {inactiveRoomRules} inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Room Types</CardTitle>
                <Hotel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roomTypes.length}</div>
                <p className="text-xs text-muted-foreground">
                  Different room categories
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Room Pricing Rule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select
                    value={newRoomRule.roomType}
                    onValueChange={(value) => setNewRoomRule({...newRoomRule, roomType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select room type" />
                    </SelectTrigger>
                    <SelectContent>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Pricing Period</Label>
                  <Select
                    value={newRoomRule.period}
                    onValueChange={(value) => setNewRoomRule({...newRoomRule, period: value})}
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
                  <Label>Price per night (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newRoomRule.price || ""}
                    onChange={(e) => setNewRoomRule({...newRoomRule, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum nights</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newRoomRule.minNights}
                    onChange={(e) => setNewRoomRule({...newRoomRule, minNights: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => addPricingRule('room')}
                  disabled={!newRoomRule.roomType || !newRoomRule.period || !newRoomRule.price}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Room Pricing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Room Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Price (₦)</TableHead>
                    <TableHead>Min. Nights</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomPricing.length > 0 ? (
                    roomPricing.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          <Select
                            value={rule.roomType}
                            onValueChange={(value) => updatePricingRule(rule.id, 'roomType', value, 'room')}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={rule.period}
                            onValueChange={(value) => updatePricingRule(rule.id, 'period', value, 'room')}
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {pricingPeriods.map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                  {period.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={rule.price}
                            onChange={(e) => updatePricingRule(rule.id, 'price', Number(e.target.value), 'room')}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={rule.minNights}
                            onChange={(e) => updatePricingRule(rule.id, 'minNights', Number(e.target.value), 'room')}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={rule.isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleRuleStatus(rule.id, 'room')}
                            className="w-24"
                          >
                            {rule.isActive ? "Active" : "Inactive"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePricingRule(rule.id, 'room')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No room pricing rules found. Add your first rule above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spa" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Spa Service Rules
                </CardTitle>
                <Spa className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spaPricing.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeSpaRules} active • {inactiveSpaRules} inactive
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spa Services</CardTitle>
                <Spa className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{spaServices.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available spa treatments
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Spa Service Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Spa Service</Label>
                  <Select
                    value={newSpaRule.roomType}
                    onValueChange={(value) => setNewSpaRule({...newSpaRule, roomType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select spa service" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Pricing Period</Label>
                  <Select
                    value={newSpaRule.period}
                    onValueChange={(value) => setNewSpaRule({...newSpaRule, period: value})}
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
                  <Label>Price (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newSpaRule.price || ""}
                    onChange={(e) => setNewSpaRule({...newSpaRule, price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    min="30"
                    step="15"
                    value={newSpaRule.minNights || 60}
                    onChange={(e) => setNewSpaRule({...newSpaRule, minNights: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => addPricingRule('spa')}
                  disabled={!newSpaRule.roomType || !newSpaRule.period || !newSpaRule.price}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Spa Pricing
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Spa Service Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Spa Service</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Price (₦)</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spaPricing.length > 0 ? (
                    spaPricing.map((rule) => {
                      const service = spaServices.find(s => s.id === rule.roomType);
                      return (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">
                            <Select
                              value={rule.roomType}
                              onValueChange={(value) => updatePricingRule(rule.id, 'roomType', value, 'spa')}
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {spaServices.map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={rule.period}
                              onValueChange={(value) => updatePricingRule(rule.id, 'period', value, 'spa')}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {pricingPeriods.map((period) => (
                                  <SelectItem key={period.id} value={period.id}>
                                    {period.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={rule.price}
                              onChange={(e) => updatePricingRule(rule.id, 'price', Number(e.target.value), 'spa')}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="30"
                                step="15"
                                value={rule.minNights || 60}
                                onChange={(e) => updatePricingRule(rule.id, 'minNights', Number(e.target.value), 'spa')}
                                className="w-20"
                              />
                              <span className="text-sm text-muted-foreground">min</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={rule.isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleRuleStatus(rule.id, 'spa')}
                              className="w-24"
                            >
                              {rule.isActive ? "Active" : "Inactive"}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removePricingRule(rule.id, 'spa')}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No spa service pricing rules found. Add your first rule above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PricingManagement;
