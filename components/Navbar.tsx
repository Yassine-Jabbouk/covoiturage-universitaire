"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";

  const guestLinks = [
    { href: "/", label: "Accueil" },
    { href: "/about", label: "À propos" },
    { href: "/login", label: "Connexion" },
    { href: "/register", label: "Inscription" },
  ];

  const userLinks = [
    { href: "/", label: "Accueil" },
    { href: "/about", label: "À propos" },
    { href: "/rides", label: "Trajets" },
    { href: "/my-rides", label: "Mes trajets" },
    { href: "/create", label: "Proposer un trajet" },
  ];

  const links = isLoggedIn ? userLinks : guestLinks;

  return (
    <nav className="bg-bg-base/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 font-display font-semibold text-lg text-text-primary"
          >
            <span className="w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
            <span>Covoiturage Universitaire</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
  <>
    {isAdmin && (
      <Link
        href="/admin"
        className="px-3 py-2 text-xs font-bold text-amber bg-amber/10 hover:bg-amber/20 rounded-md transition-colors"
      >
        ADMIN
      </Link>
    )}
    <NotificationBell />
    <span className="px-3 py-2 text-sm text-text-muted">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md text-text-muted hover:bg-bg-surface"
            aria-label="Ouvrir le menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 text-xs font-bold text-amber"
                  >
                    ADMIN
                  </Link>
                )}
                <span className="px-3 py-2 text-sm text-text-muted">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}