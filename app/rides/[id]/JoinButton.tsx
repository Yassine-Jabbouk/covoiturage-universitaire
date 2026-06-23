"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";

export default function JoinButton({
  rideId,
  isFull,
  status,
}: {
  rideId: string;
  isFull: boolean;
  status: "NONE" | "PENDING" | "ACCEPTED";
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    setLoading(true);

    try {
      const res = await fetch("/api/rides/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Demande envoyée au conducteur !");
      router.refresh();
    } catch (err) {
      console.error("Join request failed:", err);
      showToast("Impossible d'envoyer la demande pour le moment.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    const ok = await confirm({
      title: "Quitter ce trajet ?",
      message:
        "Vous pourrez demander à le rejoindre à nouveau plus tard si des places sont disponibles.",
      confirmLabel: "Quitter",
      danger: true,
    });
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/rides/${rideId}/leave`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Vous avez quitté ce trajet.");
      router.refresh();
    } catch (err) {
      console.error("Leave ride failed:", err);
      showToast("Impossible de quitter ce trajet pour le moment.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "ACCEPTED") {
    return (
      <button
        onClick={handleLeave}
        disabled={loading}
        className="bg-transparent border border-red-400/40 text-red-400 hover:bg-red-400/10 disabled:opacity-50 font-medium px-6 py-3 rounded-lg transition-colors"
      >
        {loading ? "..." : "Quitter le trajet"}
      </button>
    );
  }

  if (status === "PENDING") {
    return (
      <button
        disabled
        className="bg-bg-base border border-border text-text-muted font-medium px-6 py-3 rounded-lg cursor-not-allowed"
      >
        ⏳ En attente
      </button>
    );
  }

  return (
    <button
      onClick={handleJoin}
      disabled={isFull || loading}
      className="bg-accent hover:brightness-110 disabled:bg-bg-surface disabled:text-text-muted disabled:cursor-not-allowed text-bg-base font-semibold px-6 py-3 rounded-lg transition-all"
    >
      {isFull ? "Complet" : loading ? "..." : "Demander à rejoindre"}
    </button>
  );
}