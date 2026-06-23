"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useConfirm } from "@/components/ConfirmProvider";
import { Booking } from "@/types/ride";

export default function RemovePassengerButton({
  booking,
}: {
  booking: Booking;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(false);

  async function handleRemove() {
    const ok = await confirm({
      title: "Retirer ce passager ?",
      message: `${booking.user.name} sera notifié(e) et ne fera plus partie de ce trajet.`,
      confirmLabel: "Retirer",
      danger: true,
    });
    if (!ok) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/bookings/${booking.id}/remove`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Passager retiré.");
      router.refresh();
    } catch (err) {
      console.error("Remove passenger failed:", err);
      showToast("Impossible de retirer ce passager.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between bg-bg-base border border-border rounded-lg px-3 py-2">
      <span className="text-sm text-text-primary">{booking.user.name}</span>
      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-xs text-red-400 hover:bg-red-400/10 px-2 py-1 rounded-md font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Retirer"}
      </button>
    </div>
  );
}