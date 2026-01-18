"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Me = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
};

export function Navbar() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    apiFetch<Me>("/me").then(setMe).catch(() => setMe(null));
  }, []);

  async function logout() {
    await apiFetch("/logout", { method: "POST" });
    setMe(null);
    window.location.href = "/";
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/60 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/isotipo.png" alt="UZEED" width={28} height={28} />
          <span className="font-semibold tracking-wide">UZEED</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/feed" className="text-zinc-200 hover:text-white">
            Feed
          </Link>
          {me ? (
            <Link href="/dashboard" className="text-zinc-200 hover:text-white">
              Mi cuenta
            </Link>
          ) : null}
          {me?.role === "ADMIN" ? (
            <Link href="/admin" className="text-zinc-200 hover:text-white">
              Admin
            </Link>
          ) : null}

          {!me ? (
            <>
              <Link href="/login" className="text-zinc-200 hover:text-white">
                Login
              </Link>
              <Link href="/register" className="rounded bg-brand-600 px-3 py-1.5 font-medium text-white hover:bg-brand-700">
                Crear cuenta
              </Link>
            </>
          ) : (
            <button onClick={logout} className="rounded border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900">
              Salir
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
