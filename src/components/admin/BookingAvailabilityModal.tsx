import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Building, Ban, RotateCcw } from "lucide-react";
import { useBranches } from "@/hooks/useBranches";
import {
  BookingAvailability,
  getAll,
  enableBooking,
  runAutoEnableSweep,
} from "@/services/bookingAvailabilityService";
import { DisableBookingModal } from "./DisableBookingModal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const BookingAvailabilityModal = ({ open, onOpenChange }: Props) => {
  const { branches, isLoading: branchesLoading } = useBranches();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<Record<string, BookingAvailability>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [disableTarget, setDisableTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await runAutoEnableSweep();
      const all = await getAll();
      const map: Record<string, BookingAvailability> = {};
      all.forEach((r) => (map[r.branchId] = r));
      setRecords(map);
    } catch (e) {
      console.warn("Failed to load availability records", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleEnable = async (branchId: string, branchName: string) => {
    try {
      await enableBooking(branchId, {
        uid: (currentUser as any)?.uid ?? (currentUser as any)?.id ?? null,
        name:
          (currentUser as any)?.displayName ??
          (currentUser as any)?.name ??
          (currentUser as any)?.email ??
          null,
      });
      toast({
        title: "Bookings enabled",
        description: `${branchName} is accepting online bookings again.`,
      });
      load();
    } catch (e: any) {
      toast({
        title: "Failed to enable bookings",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[hsl(var(--royal-blue-dark))] text-white border-white/10">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-2xl flex items-center gap-2">
              <Building className="h-6 w-6" />
              Manage Booking Availability
            </DialogTitle>
            <p className="text-white/70 text-sm">
              Temporarily disable online bookings per branch. Disabled branches
              re-open automatically at the scheduled time.
            </p>
          </DialogHeader>

          {loading || branchesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          ) : (
            <div className="space-y-3">
              {branches.length === 0 && (
                <p className="text-white/60 text-center py-8">
                  No branches found.
                </p>
              )}
              {branches.map((b) => {
                const id = b.id!;
                const rec = records[id];
                const enabled = rec?.bookingEnabled !== false;
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{b.name}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          {enabled ? (
                            <Badge className="bg-green-500/20 text-green-300 border border-green-500/40 hover:bg-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Online Booking Enabled
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Booking Disabled
                            </Badge>
                          )}
                        </div>
                        {!enabled && rec?.disabledUntil && (
                          <div className="mt-2 text-sm text-white/70 space-y-0.5">
                            <div>
                              <span className="text-white/50">
                                Disabled until:{" "}
                              </span>
                              <span className="text-yellow-400 font-medium">
                                {format(
                                  rec.disabledUntil,
                                  "MMM d, yyyy 'at' h:mm a"
                                )}
                              </span>
                            </div>
                            {rec.reason && (
                              <div>
                                <span className="text-white/50">Reason: </span>
                                <span>{rec.reason}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {enabled ? (
                          <Button
                            onClick={() =>
                              setDisableTarget({ id, name: b.name })
                            }
                            className="bg-red-500/90 hover:bg-red-500 text-white font-semibold"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Disable Booking
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleEnable(id, b.name)}
                            className="bg-yellow-400 text-[hsl(var(--royal-blue-dark))] hover:bg-yellow-300 font-semibold"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Enable Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {disableTarget && (
        <DisableBookingModal
          open={!!disableTarget}
          onOpenChange={(v) => !v && setDisableTarget(null)}
          branchId={disableTarget.id}
          branchName={disableTarget.name}
          onDisabled={() => {
            setDisableTarget(null);
            load();
          }}
        />
      )}
    </>
  );
};
