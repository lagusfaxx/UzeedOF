"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Me = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
};

type SubscribeResponse = {
  ok: boolean;
  redirect_url?: string;
  already?: boolean;
  status?: string;
  subscription_id?: string;
};

type RenewResponse = {
  ok: boolean;
  payment_id?: string;
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<Me>("/me")
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  async function subscribe() {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<SubscribeResponse>("/billing/subscribe", { method: "POST" });
      if (r.redirect_url) window.location.href = r.redirect_url;
      else setError("No se recibió redirect_url de Khipu.");
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function renew() {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch<RenewResponse>("/billing/renew", { method: "POST" });
      if (r.payment_id) {
        alert("Renovación iniciada. payment_id: " + r.payment_id);
      } else {
        alert("Renovación solicitada.");
      }
      // refresh
      const m = await apiFetch<Me>("/me");
      setMe(m);
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Mi cuenta</h2>

      {!me ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-zinc-300">Necesitas iniciar sesión.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/login" className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
              Login
            </Link>
            <Link href="/register" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
              Crear cuenta
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-zinc-300">Email</div>
              <div className="font-medium">{me.email}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-300">Estado membresía</div>
              <div className={me.subscriptionActive ? "text-green-400" : "text-zinc-200"}>
                {me.subscriptionActive ? "Activa" : "Inactiva"}
              </div>
              {me.subscriptionExpiresAt ? (
                <div className="mt-1 text-xs text-zinc-400">Vence: {new Date(me.subscriptionExpiresAt).toLocaleString()}</div>
              ) : null}
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {!me.subscriptionActive ? (
              <button
                disabled={busy}
                onClick={subscribe}
                className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                Suscribirme (CLP 5.000)
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={renew}
                className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900 disabled:opacity-50"
              >
                Renovar ahora
              </button>
            )}

            <Link href="/feed" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
              Ir al feed
            </Link>

            {me.role === "ADMIN" ? (
              <Link href="/admin" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
                Panel admin
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
