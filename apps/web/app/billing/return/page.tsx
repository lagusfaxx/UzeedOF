import Link from "next/link";

export default function BillingReturnPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gracias</h2>
      <p className="text-zinc-300">
        Si autorizaste la suscripción en Khipu, tu membresía se activará cuando Khipu notifique al servidor.
        Puedes refrescar el panel en unos segundos.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
          Ir a Mi cuenta
        </Link>
        <Link href="/feed" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
          Ver feed
        </Link>
      </div>
    </div>
  );
}
