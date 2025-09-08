import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save } from 'lucide-react';

// Define the pricing schema
const pricingSchema = z.object({
  // Room Prices
  standardPrice: z.number().min(0, 'Price must be positive'),
  deluxePrice: z.number().min(0, 'Price must be positive'),
  suitePrice: z.number().min(0, 'Price must be positive'),
  familyPrice: z.number().min(0, 'Price must be positive'),
  executivePrice: z.number().min(0, 'Price must be positive'),
  
  // Service Prices
  spaBasic: z.number().min(0, 'Price must be positive'),
  spaPremium: z.number().min(0, 'Price must be positive'),
  spaDeluxe: z.number().min(0, 'Price must be positive'),
  
  // Additional Services
  breakfastPrice: z.number().min(0, 'Price must be positive'),
  lateCheckoutPrice: z.number().min(0, 'Price must be positive'),
  extraBedPrice: z.number().min(0, 'Price must be positive'),
  
  // Taxes and Fees
  taxRate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
  serviceCharge: z.number().min(0, 'Service charge must be positive').max(100, 'Service charge cannot exceed 100%'),
  
  // Discounts
  weeklyDiscount: z.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
  monthlyDiscount: z.number().min(0, 'Discount must be positive').max(100, 'Discount cannot exceed 100%'),
});

type PricingFormValues = z.infer<typeof pricingSchema>;

export default function PricingManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      // Room Prices
      standardPrice: 0,
      deluxePrice: 0,
      suitePrice: 0,
      familyPrice: 0,
      executivePrice: 0,
      
      // Service Prices
      spaBasic: 0,
      spaPremium: 0,
      spaDeluxe: 0,
      
      // Additional Services
      breakfastPrice: 0,
      lateCheckoutPrice: 0,
      extraBedPrice: 0,
      
      // Taxes and Fees
      taxRate: 0,
      serviceCharge: 0,
      
      // Discounts
      weeklyDiscount: 0,
      monthlyDiscount: 0,
    },
  });

  // Load pricing data from Firestore
  useEffect(() => {
    const loadPricing = async () => {
      try {
        setIsLoading(true);
        const pricingDoc = await getDoc(doc(db, 'settings', 'pricing'));
        
        if (pricingDoc.exists()) {
          reset(pricingDoc.data() as PricingFormValues);
        } else {
          // Initialize with default values if no pricing document exists
          await updateDoc(doc(db, 'settings', 'pricing'), {
            // Room Prices
            standardPrice: 100,
            deluxePrice: 150,
            suitePrice: 250,
            familyPrice: 180,
            executivePrice: 350,
            
            // Service Prices
            spaBasic: 50,
            spaPremium: 80,
            spaDeluxe: 120,
            
            // Additional Services
            breakfastPrice: 15,
            lateCheckoutPrice: 30,
            extraBedPrice: 25,
            
            // Taxes and Fees
            taxRate: 10,
            serviceCharge: 5,
            
            // Discounts
            weeklyDiscount: 10,
            monthlyDiscount: 20,
          });
          
          // Reload the data
          loadPricing();
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pricing data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPricing();
  }, [reset, toast]);

  const onSubmit = async (data: PricingFormValues) => {
    try {
      setIsSaving(true);
      
      await updateDoc(doc(db, 'settings', 'pricing'), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: 'Success',
        description: 'Pricing has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing Management</h1>
        <p className="text-muted-foreground">
          Update room rates, service prices, and other fees
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList>
            <TabsTrigger value="rooms">Room Rates</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="fees">Fees & Taxes</TabsTrigger>
            <TabsTrigger value="discounts">Discounts</TabsTrigger>
          </TabsList>

          {/* Room Rates Tab */}
          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle>Room Rates</CardTitle>
                <CardDescription>Update nightly rates for each room type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="standardPrice">Standard Room</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                      <Input
                        id="standardPrice"
                        type="number"
                        className="pl-8"
                        {...register('standardPrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.standardPrice && (
                      <p className="text-sm text-red-500">{errors.standardPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deluxePrice">Deluxe Room</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                      <Input
                        id="deluxePrice"
                        type="number"
                        className="pl-8"
                        {...register('deluxePrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.deluxePrice && (
                      <p className="text-sm text-red-500">{errors.deluxePrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="suitePrice">Suite</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                      <Input
                        id="suitePrice"
                        type="number"
                        className="pl-8"
                        {...register('suitePrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.suitePrice && (
                      <p className="text-sm text-red-500">{errors.suitePrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyPrice">Family Room</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                      <Input
                        id="familyPrice"
                        type="number"
                        className="pl-8"
                        {...register('familyPrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.familyPrice && (
                      <p className="text-sm text-red-500">{errors.familyPrice.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="executivePrice">Executive Suite</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                      <Input
                        id="executivePrice"
                        type="number"
                        className="pl-8"
                        {...register('executivePrice', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.executivePrice && (
                      <p className="text-sm text-red-500">{errors.executivePrice.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Spa & Services</CardTitle>
                <CardDescription>Update prices for spa treatments and additional services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Spa Treatments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spaBasic">Basic Treatment</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="spaBasic"
                          type="number"
                          className="pl-8"
                          {...register('spaBasic', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.spaBasic && (
                        <p className="text-sm text-red-500">{errors.spaBasic.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spaPremium">Premium Treatment</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="spaPremium"
                          type="number"
                          className="pl-8"
                          {...register('spaPremium', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.spaPremium && (
                        <p className="text-sm text-red-500">{errors.spaPremium.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="spaDeluxe">Deluxe Treatment</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="spaDeluxe"
                          type="number"
                          className="pl-8"
                          {...register('spaDeluxe', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.spaDeluxe && (
                        <p className="text-sm text-red-500">{errors.spaDeluxe.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Additional Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="breakfastPrice">Breakfast (per person)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="breakfastPrice"
                          type="number"
                          className="pl-8"
                          {...register('breakfastPrice', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.breakfastPrice && (
                        <p className="text-sm text-red-500">{errors.breakfastPrice.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lateCheckoutPrice">Late Checkout (per hour)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="lateCheckoutPrice"
                          type="number"
                          className="pl-8"
                          {...register('lateCheckoutPrice', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.lateCheckoutPrice && (
                        <p className="text-sm text-red-500">{errors.lateCheckoutPrice.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="extraBedPrice">Extra Bed</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">₦</span>
                        <Input
                          id="extraBedPrice"
                          type="number"
                          className="pl-8"
                          {...register('extraBedPrice', { valueAsNumber: true })}
                        />
                      </div>
                      {errors.extraBedPrice && (
                        <p className="text-sm text-red-500">{errors.extraBedPrice.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Taxes Tab */}
          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle>Fees & Taxes</CardTitle>
                <CardDescription>Configure tax rates and service charges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <div className="relative">
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        {...register('taxRate', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.taxRate && (
                      <p className="text-sm text-red-500">{errors.taxRate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                    <div className="relative">
                      <Input
                        id="serviceCharge"
                        type="number"
                        step="0.01"
                        {...register('serviceCharge', { valueAsNumber: true })}
                      />
                    </div>
                    {errors.serviceCharge && (
                      <p className="text-sm text-red-500">{errors.serviceCharge.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discounts Tab */}
          <TabsContent value="discounts">
            <Card>
              <CardHeader>
                <CardTitle>Discounts</CardTitle>
                <CardDescription>Configure special discounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weeklyDiscount">Weekly Stay Discount (%)</Label>
                    <div className="relative">
                      <Input
                        id="weeklyDiscount"
                        type="number"
                        step="0.1"
                        {...register('weeklyDiscount', { valueAsNumber: true })}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Applied for stays of 7+ nights
                    </p>
                    {errors.weeklyDiscount && (
                      <p className="text-sm text-red-500">{errors.weeklyDiscount.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyDiscount">Monthly Stay Discount (%)</Label>
                    <div className="relative">
                      <Input
                        id="monthlyDiscount"
                        type="number"
                        step="0.1"
                        {...register('monthlyDiscount', { valueAsNumber: true })}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Applied for stays of 30+ nights
                    </p>
                    {errors.monthlyDiscount && (
                      <p className="text-sm text-red-500">{errors.monthlyDiscount.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
