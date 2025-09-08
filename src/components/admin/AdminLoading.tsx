import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface AdminLoadingProps {
  fullScreen?: boolean;
  size?: number;
}

export function AdminLoading({ fullScreen = true, size = 48 }: AdminLoadingProps) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-[400px]' : 'py-8'}`}>
      <LoadingSpinner size={size} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
