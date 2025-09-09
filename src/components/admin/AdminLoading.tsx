import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLoadingProps {
  fullScreen?: boolean;
  size?: number;
  className?: string;
}

export const AdminLoading = ({
  fullScreen = false,
  size = 24,
  className,
}: AdminLoadingProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Loader2 className={cn("h-8 w-8 animate-spin text-primary", className)} />
      </div>
    );
  }

  return <Loader2 className={cn("animate-spin text-primary", className)} size={size} />;
};
