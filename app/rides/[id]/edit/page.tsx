"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditRidePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingRide, setLoadingRide] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    driverName: "",
    from: "",
    to: "",
    price: "",
    seats: "",
    time: "",
  });

  useEffect(() => {
    async function loadRide() {
      try {
        const res = await fetch(`/api/rides/${id}`);
        const ride = await res.json();

        if (!res.ok) {
          setError(ride.error || "Trajet introuvable.");
          return;
        }

        const localTime = new Date(ride.time).toISOString().slice(0, 16);

        setForm({
          driverName: ride.driverName,
          from: ride.from,
          to: ride.to,
          price: String(ride.price),
          seats: String(ride.seats),
          time: localTime,
        });
      } catch (err) {
        console.error("Failed to load ride:", err);
        setError("Impossible de charger ce trajet.");
      } finally {
        setLoadingRide(false);
      }
    }

    loadRide();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      router.push(`/rides/${id}`);
      router.refresh();
    } catch (err) {
      console.error("Update ride failed:", err);
      setError("Impossible de mettre à jour ce trajet pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingRide) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 text-text-muted">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          Modifier le trajet
        </h1>
        <p className="text-text-muted mb-6 text-sm">
          Mettez à jour les informations de votre trajet
        </p>

        {error && (
          <p className="bg-red-400/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4 border border-red-400/20">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Nom du conducteur
            </label>
            <input
              type="text"
              name="driverName"
              required
              value={form.driverName}
              onChange={handleChange}
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Départ
              </label>
              <input
                type="text"
                name="from"
                required
                value={form.from}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Destination
              </label>
              <input
                type="text"
                name="to"
                required
                value={form.to}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Date et heure de départ
            </label>
            <input
              type="datetime-local"
              name="time"
              required
              value={form.time}
              onChange={handleChange}
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent [color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Prix (MAD)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={form.price}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">
                Places disponibles
              </label>
              <input
                type="number"
                name="seats"
                required
                min="1"
                value={form.seats}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:brightness-110 disabled:opacity-50 text-bg-base font-semibold py-2 rounded-lg transition-all mt-2"
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </div>
    </div>
  );
}