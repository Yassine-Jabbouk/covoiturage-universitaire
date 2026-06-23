"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/rides";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-bg-surface border border-border rounded-xl p-8">
        <h1 className="font-display text-2xl font-semibold text-text-primary mb-1">
          Connexion
        </h1>
        <p className="text-text-muted mb-6 text-sm">
          Accédez à votre compte étudiant
        </p>

        {error && (
          <p className="bg-red-400/10 text-red-400 text-sm rounded-lg px-3 py-2 mb-4 border border-red-400/20">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@universite.ma"
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:brightness-110 disabled:opacity-50 text-bg-base font-semibold py-2 rounded-lg transition-all mt-2"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-text-muted text-center mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-accent font-medium">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}