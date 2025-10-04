import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  className?: string;
  valueClassName?: string;
  isLoading?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  description,
  className,
  valueClassName,
  isLoading = false,
}: StatCardProps) => {
  return (
    <Card className={cn("h-full bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-yellow-400">{icon}</div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className={cn("text-2xl font-bold text-white", valueClassName)}>{value}</div>
        )}
        {description && (
          <p className="text-xs text-blue-200 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};
