"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function VipPage() {
  const router = useRouter();
  const [dataVip, setDataVip] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/connexion");
      return;
    }

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!p?.vip) {
      router.push("/abonnement");
      return;
    }

    setProfil(p);

    const { data } = await supabase
      .from("vip_pronostics")
      .select("*")
      .single();

    if (data) setDataVip(data);
    setLoading(false);
  }

  function joursRestants() {
    if (!profil?.date_fin_vip) return 0;
    const fin = new Date(profil.date_fin_vip);
    const now = new Date();
    return Math.max(0, Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
  }

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐎</div>
        <p className="text-yellow-400 text-2xl font-bold animate-pulse">Chargement VIP...</p>
      </div>
    </main>
  );

  const jours = joursRestants();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-zinc-800 sticky top-0 bg-zinc-950/90 backdrop-blur z-50">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold text-green-400 cursor-pointer"
        >
          🐎 PRONOSTIC POUR VOUS
        </h1>

        <div className="flex items-center gap-3">
          <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
            ⭐ VIP — {jours} jours restants
          </span>
          <button
            onClick={() => router.push("/profil")}
            className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition"
          >
            👤 Mon profil
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/connexion");
            }}
            className="border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition"
          >
            🚪 Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* TITRE */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            ⭐ Espace Abonnés VIP
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3">
            Pronostics <span className="text-yellow-400">VIP</span>
          </h1>
          <p className="text-zinc-400">
            Abonnement actif jusqu'au {formatDate(profil?.date_fin_vip)}
          </p>
        </div>

        {/* ALERTE EXPIRATION */}
        {jours <= 3 && jours > 0 && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-5 mb-8 flex justify-between items-center">
            <div>
              <p className="text-red-400 font-bold">⚠️ Abonnement expire dans {jours} jour{jours > 1 ? "s" : ""} !</p>
              <p className="text-zinc-400 text-sm">Renouvelez pour ne pas perdre l'accès.</p>
            </div>
            <button
              onClick={() => router.push("/abonnement")}
              className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-bold text-sm transition"
            >
              Renouveler
            </button>
          </div>
        )}

        {dataVip ? (
          <div className="space-y-6">

            {/* COUPLÉ VIP */}
            <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-600 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💛</span>
                <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-wide">
                  Couplé VIP
                </h2>
              </div>
              <p className="text-6xl font-extrabold text-white tracking-widest">
                {dataVip.couple_vip}
              </p>
            </div>

            {/* SÉLECTION VIP */}
            <div className="bg-gradient-to-r from-green-900/40 to-green-800/20 border border-green-600 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h2 className="text-xl font-bold text-green-400 uppercase tracking-wide">
                  Sélection Tiercé Quarté Quinté (6)
                </h2>
              </div>
              <p className="text-5xl font-extrabold text-white tracking-widest">
                {dataVip.selection_vip}
              </p>
            </div>

            {/* ARRIVÉE */}
            <div className="bg-gradient-to-r from-pink-900/40 to-pink-800/20 border border-pink-600 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏆</span>
                <h2 className="text-xl font-bold text-pink-400 uppercase tracking-wide">
                  Arrivée
                </h2>
              </div>
              <p className="text-5xl font-extrabold text-white tracking-widest">
                {dataVip.arrivee}
              </p>
            </div>

          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🐎</div>
            <p className="text-zinc-400 text-xl">
              Les pronostics VIP du jour ne sont pas encore disponibles.
            </p>
            <p className="text-zinc-600 text-sm mt-2">
              Revenez plus tard !
            </p>
          </div>
        )}

        {/* BOUTON RETOUR */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-10 border border-zinc-700 hover:border-green-500 text-zinc-400 hover:text-green-400 py-3 rounded-xl font-semibold transition"
        >
          🏠 Retour à l'accueil
        </button>

      </div>
    </main>
  );
}