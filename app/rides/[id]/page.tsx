import Link from "next/link";
import { Ride } from "@/types/ride";
import JoinButton from "./JoinButton";
import DeleteButton from "./DeleteButton";
import RemovePassengerButton from "./RemovePassengerButton";
import { getCurrentUser } from "@/lib/session";

async function getRide(id: string): Promise<Ride | null> {
  const res = await fetch(`http://localhost:3000/api/rides/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch ride");
  }

  return res.json();
}

export default async function RideDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [ride, currentUser] = await Promise.all([
    getRide(id),
    getCurrentUser(),
  ]);

  if (!ride) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-2">
          Trajet introuvable
        </h1>
        <p className="text-text-muted mb-6">
          Ce trajet n&apos;existe pas ou a été supprimé.
        </p>
        <Link
          href="/rides"
          className="bg-accent text-bg-base font-semibold px-5 py-2 rounded-lg hover:brightness-110 transition-all"
        >
          Retour aux trajets
        </Link>
      </div>
    );
  }

  const acceptedBookings = ride.bookings.filter((b) => b.status === "ACCEPTED");
  const availableSeats = ride.seats - acceptedBookings.length;
  const isOwner = currentUser?.id === ride.userId;
  const isAdmin = currentUser?.role === "ADMIN";
  const canDelete = isOwner || isAdmin;

  const myBooking = ride.bookings.find((b) => b.userId === currentUser?.id);
  const myStatus: "NONE" | "PENDING" | "ACCEPTED" =
    myBooking?.status === "ACCEPTED"
      ? "ACCEPTED"
      : myBooking?.status === "PENDING"
      ? "PENDING"
      : "NONE";

  const date = new Date(ride.time).toLocaleString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/rides"
        className="text-sm text-text-muted hover:text-accent mb-6 inline-block transition-colors"
      >
        ← Retour
      </Link>

      <div className="bg-bg-surface border border-border rounded-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center font-display font-bold text-lg">
              {ride.driverName.charAt(0)}
            </span>
            <div>
              <h1 className="font-display text-xl font-semibold text-text-primary">
                {ride.driverName}
              </h1>
              <p className="text-sm text-text-muted">Conducteur</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href={`/rides/${ride.id}/edit`}
                className="text-sm text-accent hover:bg-accent/10 px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                ✏️ Modifier
              </Link>
            )}
            {canDelete && <DeleteButton rideId={ride.id} />}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-bg-base rounded-lg p-4 border border-border">
          <div className="text-center">
            <p className="text-xs text-text-muted mb-1">Départ</p>
            <p className="font-display font-semibold text-text-primary">
              {ride.from}
            </p>
          </div>
          <svg viewBox="0 0 100 10" className="flex-1 h-3" fill="none">
            <circle cx="4" cy="5" r="3" fill="var(--color-accent)" />
            <line
              x1="10"
              y1="5"
              x2="90"
              y2="5"
              stroke="var(--color-accent)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="route-line"
            />
            <circle cx="96" cy="5" r="3" fill="var(--color-amber)" />
          </svg>
          <div className="text-center">
            <p className="text-xs text-text-muted mb-1">Destination</p>
            <p className="font-display font-semibold text-text-primary">
              {ride.to}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-bg-base border border-border rounded-lg p-4">
            <p className="text-xs text-text-muted mb-1">Date & heure</p>
            <p className="font-medium text-text-primary capitalize">{date}</p>
          </div>
          <div className="bg-bg-base border border-border rounded-lg p-4">
            <p className="text-xs text-text-muted mb-1">
              Places disponibles
            </p>
            <p className="font-medium text-text-primary">
              {availableSeats} / {ride.seats}
            </p>
          </div>
        </div>

        {isOwner && acceptedBookings.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-text-muted mb-2">
              Passagers acceptés ({acceptedBookings.length})
            </p>
            <div className="flex flex-col gap-2">
              {acceptedBookings.map((booking) => (
  <RemovePassengerButton key={booking.id} booking={booking} />
))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-6">
          <div>
            <p className="text-sm text-text-muted">Prix par personne</p>
            <p className="text-2xl font-display font-semibold text-accent">
              {ride.price} MAD
            </p>
          </div>
          {!isOwner && (
            <JoinButton
              rideId={ride.id}
              isFull={availableSeats <= 0}
              status={myStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}