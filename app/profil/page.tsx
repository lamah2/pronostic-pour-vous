"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function ProfilPage() {
  const router = useRouter();
  const [profil, setProfil] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
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

    setSession(session);

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setProfil(p);
    setLoading(false);
  }

  function joursRestants() {
    if (!profil?.date_fin_vip) return 0;
    const fin = new Date(profil.date_fin_vip);
    const now = new Date();
    const diff = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric"
    });
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-green-400 text-2xl animate-pulse">Chargement...</p>
    </main>
  );

  const jours = joursRestants();
  const pourcent = profil?.date_debut_vip && profil?.date_fin_vip
    ? Math.min(100, Math.round(
        (new Date().getTime() - new Date(profil.date_debut_vip).getTime()) /
        (new Date(profil.date_fin_vip).getTime() - new Date(profil.date_debut_vip).getTime()) * 100
      ))
    : 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-zinc-800">
        <h1
          onClick={() => router.push("/")}
          className="text-2xl font-extrabold text-green-400 cursor-pointer"
        >
          🐎 PRONOSTIC POUR VOUS
        </h1>
        <button
          onClick={deconnexion}
          className="border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition"
        >
          🚪 Déconnexion
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* AVATAR + NOM */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-4xl font-extrabold">
            {session?.user?.email?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{session?.user?.email}</h2>
            <p className="text-zinc-500 text-sm mt-1">
              Membre depuis {formatDate(session?.user?.created_at)}
            </p>
          </div>
        </div>

        {/* STATUT VIP */}
        <div className={`rounded-2xl p-8 mb-6 border ${
          profil?.vip
            ? "bg-yellow-900/20 border-yellow-700"
            : "bg-zinc-900 border-zinc-800"
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {profil?.vip ? "⭐ Statut VIP Actif" : "🔒 Statut : Non abonné"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profil?.vip
                ? "bg-yellow-500 text-black"
                : "bg-zinc-700 text-zinc-300"
            }`}>
              {profil?.vip ? "ACTIF" : "INACTIF"}
            </span>
          </div>

          {profil?.vip ? (
            <>
              {/* BARRE DE PROGRESSION */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-zinc-400 mb-2">
                  <span>Début : {formatDate(profil.date_debut_vip)}</span>
                  <span>Fin : {formatDate(profil.date_fin_vip)}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full transition-all"
                    style={{ width: `${pourcent}%` }}
                  />
                </div>
              </div>

              {/* JOURS RESTANTS */}
              <div className="text-center bg-yellow-900/30 rounded-xl p-6">
                <p className="text-6xl font-extrabold text-yellow-400">{jours}</p>
                <p className="text-zinc-400 mt-2">
                  {jours > 1 ? "jours restants" : jours === 1 ? "jour restant" : "Abonnement expiré"}
                </p>
              </div>

              {jours <= 3 && jours > 0 && (
                <div className="mt-4 bg-red-900/30 border border-red-700 rounded-xl p-4 text-center">
                  <p className="text-red-400 font-bold">
                    ⚠️ Votre abonnement expire bientôt !
                  </p>
                  <button
                    onClick={() => router.push("/abonnement")}
                    className="mt-2 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-sm font-bold transition"
                  >
                    Renouveler maintenant
                  </button>
                </div>
              )}

              <button
                onClick={() => router.push("/vip")}
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold transition"
              >
                ⭐ Accéder à l'espace VIP
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-400 mb-6">
                Vous n'avez pas encore d'abonnement VIP. Abonnez-vous pour accéder aux pronostics exclusifs !
              </p>
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100 000 GNF</p>
                  <p className="text-zinc-500 text-sm">/ semaine</p>
                </div>
                <div className="text-zinc-700 text-3xl">|</div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">300 000 GNF</p>
                  <p className="text-zinc-500 text-sm">/ mois</p>
                </div>
              </div>
              <button
                onClick={() => router.push("/abonnement")}
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
              >
                🚀 S'abonner maintenant
              </button>
            </div>
          )}
        </div>

        {/* INFOS COMPTE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-zinc-300 mb-4">📋 Informations du compte</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Email</span>
              <span className="text-white">{session?.user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-500">Statut</span>
              <span className={profil?.vip ? "text-yellow-400 font-bold" : "text-zinc-400"}>
                {profil?.vip ? "⭐ VIP" : "Gratuit"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-500">Membre depuis</span>
              <span className="text-white">{formatDate(session?.user?.created_at)}</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 py-3 rounded-xl font-semibold transition"
          >
            🏠 Accueil
          </button>
          <button
            onClick={deconnexion}
            className="flex-1 border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 py-3 rounded-xl font-semibold transition"
          >
            🚪 Déconnexion
          </button>
        </div>

      </div>
    </main>
  );
}