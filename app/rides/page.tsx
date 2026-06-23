import { Ride } from "@/types/ride";
import RidesFilterBar from "@/components/RidesFilterBar";

async function getRides(): Promise<Ride[]> {
  const res = await fetch("http://localhost:3000/api/rides", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch rides");
  }

  return res.json();
}

export default async function RidesPage() {
  const rides = await getRides();

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
          Trajets disponibles
        </h1>
      </div>

      <RidesFilterBar allRides={rides} />
    </div>
  );
}