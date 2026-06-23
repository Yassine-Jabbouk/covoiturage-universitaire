"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";

export default function DeleteButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = await confirm({
      title: "Supprimer ce trajet ?",
      message: "Cette action est irréversible. Tous les passagers inscrits seront notifiés.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        setLoading(false);
        return;
      }

      showToast("Trajet supprimé.");
      router.push("/rides");
      router.refresh();
    } catch (err) {
      console.error("Delete ride failed:", err);
      showToast("Impossible de supprimer ce trajet pour le moment.", "error");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-400 hover:bg-red-400/10 px-3 py-1.5 rounded-md font-medium transition-colors disabled:opacity-50"
    >
      {loading ? "Suppression..." : "🗑 Supprimer"}
    </button>
  );
}