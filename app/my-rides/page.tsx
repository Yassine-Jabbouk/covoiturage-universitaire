import RideList from "@/components/RideList";
import { Ride } from "@/types/ride";
import { headers } from "next/headers";

async function getMyRides(): Promise<{
  createdRides: Ride[];
  joinedRides: Ride[];
}> {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  const res = await fetch("http://localhost:3000/api/my-rides", {
    cache: "no-store",
    headers: { cookie },
  });

  if (!res.ok) {
    return { createdRides: [], joinedRides: [] };
  }

  return res.json();
}

export default async function MyRidesPage() {
  const { createdRides, joinedRides } = await getMyRides();

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-8">
        Mes trajets
      </h1>

      <section className="mb-12">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Trajets que j&apos;ai proposés ({createdRides.length})
        </h2>
        <RideList rides={createdRides} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Trajets que j&apos;ai rejoints ({joinedRides.length})
        </h2>
        <RideList rides={joinedRides} />
      </section>
    </div>
  );
}