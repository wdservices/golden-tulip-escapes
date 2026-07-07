import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { disableBooking } from "@/services/bookingAvailabilityService";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branchId: string;
  branchName: string;
  onDisabled?: () => void;
}

export const DisableBookingModal = ({
  open,
  onOpenChange,
  branchId,
  branchName,
  onDisabled,
}: Props) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setDate("");
    setTime("12:00");
    setReason("");
  };

  const handleSubmit = async () => {
    if (!date) {
      toast({
        title: "Reopen date is required",
        description: "Please select when bookings should automatically reopen.",
        variant: "destructive",
      });
      return;
    }
    const until = new Date(`${date}T${time || "12:00"}:00`);
    if (isNaN(until.getTime()) || until.getTime() <= Date.now()) {
      toast({
        title: "Invalid date",
        description: "Reopen date/time must be in the future.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await disableBooking(branchId, {
        disabledUntil: until,
        reason: reason.trim() || undefined,
        actor: {
          uid: (currentUser as any)?.uid ?? (currentUser as any)?.id ?? null,
          name:
            (currentUser as any)?.displayName ??
            (currentUser as any)?.name ??
            (currentUser as any)?.email ??
            null,
        },
      });
      toast({
        title: "Bookings disabled",
        description: `${branchName} bookings are paused until ${until.toLocaleString()}.`,
      });
      reset();
      onOpenChange(false);
      onDisabled?.();
    } catch (e: any) {
      toast({
        title: "Failed to disable bookings",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-[hsl(var(--royal-blue-dark))] text-white border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            <Ban className="h-5 w-5" />
            Disable Bookings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-white/70">Branch</Label>
            <div className="mt-1 rounded-md bg-white/10 px-3 py-2 font-semibold">
              {branchName}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="disable-date" className="text-white/70">
                Reopen date *
              </Label>
              <Input
                id="disable-date"
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="disable-time" className="text-white/70">
                Reopen time *
              </Label>
              <Input
                id="disable-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="disable-reason" className="text-white/70">
              Reason (optional)
            </Label>
            <Textarea
              id="disable-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. This branch is fully occupied."
              maxLength={500}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="bg-transparent text-white border-white/30 hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] hover:bg-yellow-300 font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disabling...
              </>
            ) : (
              "Disable Booking"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
