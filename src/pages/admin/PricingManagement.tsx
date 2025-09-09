import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Tag, Clock } from "lucide-react";

// Mock data - replace with actual API calls
const roomTypes = [
  { id: "deluxe", name: "Deluxe Room" },
  { id: "executive", name: "Executive Suite" },
  { id: "presidential", name: "Presidential Suite" },
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
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: "1",
      roomType: "deluxe",
      period: "peak",
      price: 50000,
      minNights: 2,
      isActive: true,
    },
  ]);

  const [newRule, setNewRule] = useState<Omit<PricingRule, 'id'>>({ 
    roomType: "", 
    period: "", 
    price: 0, 
    minNights: 1,
    isActive: true 
  });

  const addPricingRule = () => {
    if (!newRule.roomType || !newRule.period) return;
    
    setPricingRules([
      ...pricingRules,
      {
        ...newRule,
        id: Date.now().toString(),
      },
    ]);
    
    // Reset form
    setNewRule({ 
      roomType: "", 
      period: "", 
      price: 0, 
      minNights: 1,
      isActive: true 
    });
  };

  const removePricingRule = (id: string) => {
    setPricingRules(pricingRules.filter(rule => rule.id !== id));
  };

  const toggleRuleStatus = (id: string) => {
    setPricingRules(pricingRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const updatePricingRule = (id: string, field: keyof PricingRule, value: any) => {
    setPricingRules(pricingRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  // Calculate total pricing rules
  const activeRules = pricingRules.filter(rule => rule.isActive).length;
  const inactiveRules = pricingRules.length - activeRules;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pricing Management</h2>
        <p className="text-muted-foreground">
          Manage room rates, seasonal pricing, and special offers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pricing Rules
            </CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pricingRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeRules} active • {inactiveRules} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Types</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle>Add New Pricing Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select
                value={newRule.roomType}
                onValueChange={(value) => setNewRule({...newRule, roomType: value})}
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
                value={newRule.period}
                onValueChange={(value) => setNewRule({...newRule, period: value})}
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
                value={newRule.price || ""}
                onChange={(e) => setNewRule({...newRule, price: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Minimum nights</Label>
              <Input
                type="number"
                min="1"
                value={newRule.minNights}
                onChange={(e) => setNewRule({...newRule, minNights: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="button" 
              onClick={addPricingRule}
              disabled={!newRule.roomType || !newRule.period || !newRule.price}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {pricingRules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pricing rules found. Add your first rule above.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Min. Nights</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {roomTypes.find(rt => rt.id === rule.roomType)?.name || rule.roomType}
                      </TableCell>
                      <TableCell>
                        {pricingPeriods.find(p => p.id === rule.period)?.name || rule.period}
                      </TableCell>
                      <TableCell>₦{rule.price.toLocaleString()}</TableCell>
                      <TableCell>{rule.minNights} night{rule.minNights !== 1 ? 's' : ''}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-2.5 w-2.5 rounded-full mr-2 ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRuleStatus(rule.id)}
                          >
                            {rule.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => removePricingRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingManagement;
