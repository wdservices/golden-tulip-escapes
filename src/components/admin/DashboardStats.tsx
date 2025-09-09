import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Bed, Calendar, DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
};

const StatCard = ({ title, value, change, icon }: StatCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {isPositive ? (
            <ArrowUpCircle className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownCircle className="h-3 w-3 mr-1" />
          )}
          {Math.abs(change)}% from last period
        </p>
      </CardContent>
    </Card>
  );
};

const DashboardStats = () => {
  const stats = [
    {
      title: "Today's Check-ins",
      value: "24",
      change: 12,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Today's Check-outs",
      value: "18",
      change: -5,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: "Available Rooms",
      value: "42/120",
      change: 8,
      icon: <Bed className="h-4 w-4" />
    },
    {
      title: "Pending Payments",
      value: "₦1,250,000",
      change: -2,
      icon: <DollarSign className="h-4 w-4" />
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
