import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

const RevenueSnapshot = () => {
  const revenueData = {
    currentMonth: 12500000,
    lastMonth: 9800000,
    change: ((12500000 - 9800000) / 9800000) * 100,
    byCategory: [
      { name: "Rooms", value: 8500000, percentage: 68 },
      { name: "Dining", value: 2500000, percentage: 20 },
      { name: "Spa", value: 1000000, percentage: 8 },
      { name: "Events", value: 500000, percentage: 4 },
    ],
  };

  const isPositive = revenueData.change >= 0;
  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(revenueData.currentMonth);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Revenue Snapshot
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedAmount}</div>
        <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {Math.abs(revenueData.change).toFixed(1)}% from last month
        </p>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Revenue by Category</h4>
          <div className="space-y-2">
            {revenueData.byCategory.map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{category.name}</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      maximumFractionDigits: 0,
                    }).format(category.value)}
                  </span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Avg. Daily Rate</p>
              <p className="font-medium">₦45,000</p>
              <p className="text-xs text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                5.2%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy Rate</p>
              <p className="font-medium">78%</p>
              <p className="text-xs text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                3.1%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueSnapshot;
