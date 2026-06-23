"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";

interface AdminRide {
  id: string;
  driverName: string;
  from: string;
  to: string;
  price: number;
  seats: number;
  time: string;
  bookings: { id: string }[];
  user: { name: string; email: string };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { rides: number; bookings: number };
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalRides: 0,
    totalUsers: 0,
    totalBookings: 0,
  });
  const [rides, setRides] = useState<AdminRide[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Accès refusé.");
        return;
      }

      setStats(data.stats);
      setRides(data.rides);
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDeleteRide(rideId: string) {
    const ok = await confirm({
      title: "Supprimer ce trajet ?",
      message: "Cette action est irréversible.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;

    setDeletingId(rideId);

    try {
      const res = await fetch(`/api/rides/${rideId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      setRides((prev) => prev.filter((r) => r.id !== rideId));
      showToast("Trajet supprimé.");
    } catch (err) {
      console.error("Delete ride failed:", err);
      showToast("Impossible de supprimer ce trajet.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    const ok = await confirm({
      title: "Supprimer cet utilisateur ?",
      message: "Cela supprimera aussi tous ses trajets et réservations. Action irréversible.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;

    setDeletingId(userId);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Utilisateur supprimé.");
      loadData();
    } catch (err) {
      console.error("Delete user failed:", err);
      showToast("Impossible de supprimer cet utilisateur.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 text-text-muted">
        Chargement...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <p className="text-red-400 font-medium mb-2">{error}</p>
        <Link href="/rides" className="text-accent hover:underline">
          Retour aux trajets
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight mb-8">
        Tableau de bord admin
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Trajets</p>
          <p className="text-3xl font-display font-semibold text-accent">
            {stats.totalRides}
          </p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Utilisateurs</p>
          <p className="text-3xl font-display font-semibold text-accent">
            {stats.totalUsers}
          </p>
        </div>
        <div className="bg-bg-surface border border-border rounded-xl p-5">
          <p className="text-sm text-text-muted mb-1">Réservations</p>
          <p className="text-3xl font-display font-semibold text-accent">
            {stats.totalBookings}
          </p>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Tous les trajets
        </h2>
        <div className="bg-bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Conducteur</th>
                <th className="px-4 py-3">Places</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id} className="border-b border-border/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/rides/${ride.id}`}
                      className="text-accent hover:underline font-medium"
                    >
                      {ride.from} → {ride.to}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {ride.user?.name ?? ride.driverName}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {ride.bookings.length}/{ride.seats}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {ride.price} MAD
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteRide(ride.id)}
                      disabled={deletingId === ride.id}
                      className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {rides.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                    Aucun trajet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Tous les utilisateurs
        </h2>
        <div className="bg-bg-surface border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Trajets / Réservations</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {u.name}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "ADMIN"
                          ? "text-amber bg-amber/10 px-2 py-0.5 rounded text-xs font-bold"
                          : "text-text-muted bg-bg-base px-2 py-0.5 rounded text-xs font-medium"
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {u._count.rides} / {u._count.bookings}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={deletingId === u.id || u.role === "ADMIN"}
                      className="text-red-400 hover:text-red-300 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        u.role === "ADMIN"
                          ? "Impossible de supprimer un autre admin depuis cette interface"
                          : undefined
                      }
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}