"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateRidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    driverName: "",
    from: "",
    to: "",
    price: "",
    seats: "",
    time: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }

      router.push("/rides");
    } catch (err) {
      console.error("Create ride failed:", err);
      setError("Impossible de créer le trajet pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          Proposer un trajet
        </h1>
        <p className="text-text-muted mb-6 text-sm">
          Remplissez les informations de votre trajet
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
              placeholder="Votre nom"
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
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
                placeholder="Casablanca"
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
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
                placeholder="Rabat"
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
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
                placeholder="30"
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
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
                placeholder="3"
                className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:brightness-110 disabled:opacity-50 text-bg-base font-semibold py-2 rounded-lg transition-all mt-2"
          >
            {loading ? "Publication..." : "Publier le trajet"}
          </button>
        </form>
      </div>
    </div>
  );
}