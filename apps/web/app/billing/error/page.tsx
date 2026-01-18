import Link from "next/link";

export default function BillingErrorPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Pago cancelado o error</h2>
      <p className="text-zinc-300">
        Si hubo un problema con Khipu, puedes intentarlo nuevamente desde tu panel.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
          Volver al panel
        </Link>
        <Link href="/" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
          Inicio
        </Link>
      </div>
    </div>
  );
}
