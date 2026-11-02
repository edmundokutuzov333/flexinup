import { Link } from "@tanstack/react-router";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link to="/" className="inline-flex min-h-12 items-center font-mono text-xs uppercase text-gold">← Voltar</Link>
      <h1 className="mt-6 font-display text-6xl text-gold-metal">{title}</h1>
      <div className="mt-8 space-y-6 font-mono text-sm leading-relaxed text-bone/85 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-gold [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </main>
  );
}
