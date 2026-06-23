"use client";

import { useState, useMemo } from "react";
import { Ride } from "@/types/ride";
import RideList from "@/components/RideList";

export default function RidesFilterBar({ allRides }: { allRides: Ride[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minSeats, setMinSeats] = useState("");

  const filteredRides = useMemo(() => {
    return allRides.filter((ride) => {
      const availableSeats = ride.seats - ride.bookings.length;

      if (from && !ride.from.toLowerCase().includes(from.toLowerCase())) {
        return false;
      }
      if (to && !ride.to.toLowerCase().includes(to.toLowerCase())) {
        return false;
      }
      if (date) {
        const rideDate = new Date(ride.time).toISOString().slice(0, 10);
        if (rideDate !== date) return false;
      }
      if (minPrice && ride.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice && ride.price > Number(maxPrice)) {
        return false;
      }
      if (minSeats && availableSeats < Number(minSeats)) {
        return false;
      }
      return true;
    });
  }, [allRides, from, to, date, minPrice, maxPrice, minSeats]);

  const hasActiveFilters =
    from || to || date || minPrice || maxPrice || minSeats;

  function clearFilters() {
    setFrom("");
    setTo("");
    setDate("");
    setMinPrice("");
    setMaxPrice("");
    setMinSeats("");
  }

  return (
    <div>
      <div className="bg-bg-surface border border-border rounded-xl p-4 sm:p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Départ"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Destination"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
          />
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Prix min"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Prix max"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <input
            type="number"
            min="1"
            value={minSeats}
            onChange={(e) => setMinSeats(e.target.value)}
            placeholder="Places min"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-accent hover:underline"
          >
            Effacer les filtres
          </button>
        )}
      </div>

      <p className="text-text-muted mb-6 text-sm">
        {filteredRides.length} trajet{filteredRides.length !== 1 ? "s" : ""}{" "}
        trouvé{filteredRides.length !== 1 ? "s" : ""}
      </p>

      <RideList rides={filteredRides} />
    </div>
  );
}