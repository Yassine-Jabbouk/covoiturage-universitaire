import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl w-full text-center">
        <svg
          viewBox="0 0 320 80"
          className="w-full max-w-sm mx-auto mb-8"
          fill="none"
        >
          <circle cx="20" cy="60" r="6" fill="var(--color-accent)" />
          <path
            d="M 20 60 C 100 60, 120 20, 300 20"
            stroke="var(--color-accent)"
            strokeWidth="2"
            className="route-line"
          />
          <circle cx="300" cy="20" r="6" fill="var(--color-amber)" />
        </svg>

        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-text-primary mb-4 tracking-tight">
          University Carpooling Platform
        </h1>
        <p className="text-text-muted mb-10 text-lg max-w-lg mx-auto">
          Trouvez ou proposez un trajet avec d&apos;autres étudiants. Simple,
          rapide et économique.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/rides"
            className="bg-accent hover:brightness-110 text-bg-base font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Browse Rides
          </Link>
          <Link
            href="/create"
            className="bg-bg-surface border border-border hover:border-accent/50 text-text-primary font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Create Ride
          </Link>
        </div>
      </div>
    </div>
  );
}