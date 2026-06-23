"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  bookingId: string | null;
  createdAt: string;
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days} j`;
}

function typeIcon(type: string) {
  if (type === "join_request") return "🙋";
  if (type === "join_accepted") return "✅";
  if (type === "join_rejected") return "❌";
  if (type === "passenger_removed") return "🚫";
  if (type === "ride_edited") return "✏️";
  if (type === "ride_cancelled") return "❌";
  return "🔔";
}

export default function NotificationBell() {
  const { status } = useSession();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [actingOn, setActingOn] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") return;
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function markAllRead() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  async function markOneRead(id: string) {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }

  async function handleAccept(notification: Notification) {
    if (!notification.bookingId) return;
    setActingOn(notification.id);

    try {
      const res = await fetch(
        `/api/bookings/${notification.bookingId}/accept`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Demande acceptée.");
      markOneRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, type: "join_request_handled" }
            : n
        )
      );
    } catch (err) {
      console.error("Accept failed:", err);
      showToast("Impossible d'accepter cette demande.", "error");
    } finally {
      setActingOn(null);
    }
  }

  async function handleReject(notification: Notification) {
    if (!notification.bookingId) return;
    setActingOn(notification.id);

    try {
      const res = await fetch(
        `/api/bookings/${notification.bookingId}/reject`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Une erreur est survenue.", "error");
        return;
      }

      showToast("Demande refusée.");
      markOneRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, type: "join_request_handled" }
            : n
        )
      );
    } catch (err) {
      console.error("Reject failed:", err);
      showToast("Impossible de refuser cette demande.", "error");
    } finally {
      setActingOn(null);
    }
  }

  if (status !== "authenticated") return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-amber text-bg-base text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-medium text-text-primary text-sm">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">
                Aucune notification.
              </p>
            )}
            {notifications.map((n) => {
              const isPendingRequest = n.type === "join_request";

              return (
                <div
                  key={n.id}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors flex gap-3 ${
                    n.read ? "opacity-60" : "bg-accent/5"
                  }`}
                >
                  <span className="text-lg leading-none">
                    {typeIcon(n.type)}
                  </span>
                  <div className="flex-1">
                    <button
                      onClick={() => !n.read && markOneRead(n.id)}
                      className="text-left w-full"
                    >
                      <span className="text-sm text-text-primary block">
                        {n.message}
                      </span>
                      <span className="text-xs text-text-muted">
                        {timeAgo(n.createdAt)}
                      </span>
                    </button>

                    {isPendingRequest && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleAccept(n)}
                          disabled={actingOn === n.id}
                          className="text-xs font-semibold bg-accent text-bg-base px-3 py-1 rounded-md hover:brightness-110 disabled:opacity-50 transition-all"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleReject(n)}
                          disabled={actingOn === n.id}
                          className="text-xs font-semibold bg-transparent border border-red-400/40 text-red-400 px-3 py-1 rounded-md hover:bg-red-400/10 disabled:opacity-50 transition-colors"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}