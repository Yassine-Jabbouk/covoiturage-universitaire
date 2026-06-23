export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-text-muted">
        <p>
          © {new Date().getFullYear()} Covoiturage Universitaire — Projet
          étudiant
        </p>
      </div>
    </footer>
  );
}