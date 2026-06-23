import { Ride } from "@/types/ride";
import RideCard from "./RideCard";

export default function RideList({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) {
    return (
      <p className="text-center text-text-muted py-12">
        Aucun trajet disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rides.map((ride, i) => (
        <div
          key={ride.id}
          className="fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <RideCard ride={ride} />
        </div>
      ))}
    </div>
  );
}