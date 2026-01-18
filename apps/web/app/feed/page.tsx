"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Post = {
  id: string;
  title: string;
  body: string;
  mediaUrl: string | null;
  mediaType: "IMAGE" | "VIDEO" | null;
  locked: boolean;
  createdAt: string;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ posts: Post[]; subscriptionActive: boolean }>("/posts")
      .then((d) => {
        setPosts(d.posts);
        setSubscriptionActive(d.subscriptionActive);
      })
      .catch((e: any) => setError(e.message || "Error"));
  }, []);

  async function startSubscription() {
    const r = await apiFetch<{ redirect_url: string }>("/billing/subscribe", { method: "POST" });
    if (r.redirect_url) window.location.href = r.redirect_url;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Feed</h2>
        {!subscriptionActive ? (
          <button onClick={startSubscription} className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">
            Suscribirme
          </button>
        ) : (
          <div className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-200">Membresía activa</div>
        )}
      </div>

      {error ? <p className="text-red-400">{error}</p> : null}

      <div className="space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              {p.locked ? <span className="rounded bg-zinc-800 px-2 py-1 text-xs">Solo miembros</span> : null}
            </div>
            <p className={"mt-2 whitespace-pre-wrap text-zinc-200 " + (p.locked ? "blur-sm select-none" : "")}>{p.body}</p>
            {p.mediaUrl ? (
              p.mediaType === "VIDEO" ? (
                <video className="mt-4 w-full rounded-xl" controls src={p.mediaUrl} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mt-4 w-full rounded-xl" src={p.mediaUrl} alt={p.title} />
              )
            ) : null}
            {p.locked ? (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4">
                <p className="text-sm text-zinc-300">Contenido bloqueado. Suscríbete para verlo completo.</p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
