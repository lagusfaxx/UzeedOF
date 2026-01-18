import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-8">
        <h1 className="text-3xl font-semibold tracking-tight">UZEED</h1>
        <p className="mt-3 max-w-prose text-zinc-300">
          Plataforma tipo OnlyFans (MVP) con suscripción mensual vía Khipu.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/feed" className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
            Ver feed
          </Link>
          <Link href="/register" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
            Crear cuenta
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { t: "Sesiones seguras", d: "Cookies httpOnly (sin JWT en localStorage)." },
          { t: "Paywall", d: "Contenido bloqueado si no hay membresía activa." },
          { t: "Admin", d: "Panel para crear posts con foto/video." }
        ].map((c) => (
          <div key={c.t} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <div className="text-lg font-semibold">{c.t}</div>
            <div className="mt-2 text-sm text-zinc-300">{c.d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
