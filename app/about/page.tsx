export default function AboutPage() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <h1 className="font-display text-3xl font-semibold text-text-primary mb-6 tracking-tight">
        À propos
      </h1>
      <p className="text-text-muted mb-4 leading-relaxed">
        Covoiturage Universitaire est une plateforme pensée pour les
        étudiants. Notre objectif est simple : rendre les trajets entre le
        campus et la maison plus simples, plus économiques et plus
        conviviaux.
      </p>
      <p className="text-text-muted mb-4 leading-relaxed">
        Que vous ayez une voiture et des places libres, ou que vous cherchiez
        simplement un trajet abordable, notre plateforme connecte les
        étudiants entre eux pour partager le trajet — et les frais.
      </p>
      <p className="text-text-muted leading-relaxed">
        Créez un compte gratuitement, proposez ou trouvez un trajet, et
        voyagez ensemble.
      </p>
    </div>
  );
}