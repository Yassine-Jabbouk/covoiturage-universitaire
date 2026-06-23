import Link from "next/link";
import { Ride } from "@/types/ride";

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RideCard({ ride }: { ride: Ride }) {
  const availableSeats = ride.seats - ride.bookings.length;
  const isFull = availableSeats <= 0;

  return (
    <div className="bg-bg-surface rounded-xl border border-border p-5 hover:border-accent/40 hover:bg-bg-surface-hover transition-all flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-text-primary">
          <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold font-display">
            {ride.driverName.charAt(0)}
          </span>
          {ride.driverName}
        </div>
        <span className="text-sm text-text-muted">
          {formatDate(ride.time)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-medium text-text-primary text-sm">
          {ride.from}
        </span>
        <svg viewBox="0 0 100 10" className="flex-1 h-2.5" fill="none">
          <circle cx="4" cy="5" r="3" fill="var(--color-accent)" />
          <line
            x1="10"
            y1="5"
            x2="90"
            y2="5"
            stroke="var(--color-border)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <circle cx="96" cy="5" r="3" fill="var(--color-amber)" />
        </svg>
        <span className="font-medium text-text-primary text-sm">
          {ride.to}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={isFull ? "text-red-400 font-medium" : "text-text-muted"}>
          {isFull
            ? "Complet"
            : `${availableSeats} place${availableSeats > 1 ? "s" : ""} disponible${availableSeats > 1 ? "s" : ""}`}
        </span>
        <span className="text-lg font-display font-semibold text-accent">
          {ride.price} MAD
        </span>
      </div>

      <Link
        href={`/rides/${ride.id}`}
        className="text-center bg-bg-base border border-border hover:border-accent/50 hover:text-accent text-text-primary font-medium py-2 rounded-lg transition-colors"
      >
        Voir les détails
      </Link>
    </div>
  );
}