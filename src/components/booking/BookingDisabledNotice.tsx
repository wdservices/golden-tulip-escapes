import { AlertTriangle, Phone } from "lucide-react";
import { format } from "date-fns";

interface Props {
  branchName?: string;
  disabledUntil?: Date | null;
  reason?: string | null;
}

export const BookingDisabledNotice = ({
  branchName,
  disabledUntil,
  reason,
}: Props) => {
  return (
    <div className="rounded-2xl border border-yellow-400/40 bg-gradient-to-br from-yellow-400/10 via-blue-500/5 to-white/5 p-8 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400/20">
          <AlertTriangle className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="space-y-3 flex-1">
          <h3 className="text-xl font-bold text-white">
            Online bookings are temporarily unavailable
            {branchName ? ` for ${branchName}` : ""}
          </h3>
          <p className="text-white/80">
            {reason ||
              "All rooms at this branch are currently occupied. Bookings will reopen automatically."}
          </p>
          {disabledUntil && (
            <div className="rounded-lg bg-white/10 backdrop-blur-sm px-4 py-3 border border-white/10">
              <p className="text-sm text-white/70">Bookings reopen on</p>
              <p className="text-lg font-semibold text-yellow-400">
                {format(disabledUntil, "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-white/80 pt-2">
            <Phone className="h-4 w-4 text-yellow-400" />
            <span>
              For urgent reservations, please contact reception directly.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
