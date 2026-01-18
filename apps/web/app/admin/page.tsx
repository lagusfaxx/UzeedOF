"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

type Post = {
  id: string;
  title: string;
  body: string;
  mediaUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  isPaid: boolean;
  createdAt: string;
};

type Me = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  subscriptionActive: boolean;
  subscriptionExpiresAt: string | null;
};

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const m = await apiFetch<Me>("/me");
    setMe(m);
    const p = await apiFetch<{ posts: Post[] }>("/admin/posts");
    setPosts(p.posts);
  }

  useEffect(() => {
    load().catch((e: any) => setError(e?.message || "Error"));
  }, []);

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/admin/posts", {
        method: "POST",
        body: JSON.stringify({
          title,
          body,
          isPaid,
          mediaUrl: mediaUrl ? mediaUrl : undefined,
          mediaType: mediaUrl ? mediaType : undefined
        })
      });
      setTitle("");
      setBody("");
      setMediaUrl("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  if (!me) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-zinc-300">Cargando o no autenticado.</p>
        <div className="mt-4">
          <Link href="/login" className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (me.role !== "ADMIN") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-zinc-300">Acceso denegado.</p>
        <div className="mt-4">
          <Link href="/feed" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
            Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Panel Admin</h2>
        <Link href="/feed" className="rounded border border-zinc-700 px-4 py-2 font-medium text-zinc-200 hover:bg-zinc-900">
          Ver feed
        </Link>
      </div>

      <form onSubmit={createPost} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-300">Titulo</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 outline-none focus:border-brand-600"
              required
            />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
              Solo miembros
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-300">Contenido</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full min-h-[140px] rounded-lg border border-zinc-800 bg-black px-3 py-2 outline-none focus:border-brand-600"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm text-zinc-300">Media URL (opcional)</label>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 outline-none focus:border-brand-600"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-300">Tipo</label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as any)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-black px-3 py-2 outline-none focus:border-brand-600"
            >
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video</option>
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          disabled={busy}
          className="rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "Guardando..." : "Crear post"}
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              {p.isPaid ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs">Solo miembros</span> : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-zinc-200">{p.body}</p>
            {p.mediaUrl ? (
              p.mediaType === "VIDEO" ? (
                <video className="mt-4 w-full rounded-xl" controls src={p.mediaUrl} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mt-4 w-full rounded-xl" src={p.mediaUrl} alt={p.title} />
              )
            ) : null}
            <div className="mt-3 text-xs text-zinc-400">{new Date(p.createdAt).toLocaleString()}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
