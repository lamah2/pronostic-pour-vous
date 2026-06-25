"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";
import Notification from "./components/Notification";
export default function Home() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);

  useEffect(() => {
    async function charger() {
      // Charger la session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // Charger le profil si connecté
      if (session?.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfil(p);
      }

      // Charger le pronostic gratuit du jour
      const { data } = await supabase
        .from("predictions")
        .select("*")
        .limit(1)
        .single();
      if (data) setPrediction(data);
    }
    charger();
  }, []);

  function voirPronostics() {
    // Scroll vers la section pronostics
    document.getElementById("pronostics")?.scrollIntoView({ behavior: "smooth" });
  }

  function allerVip() {
    if (!session) {
      router.push("/connexion");
    } else if (profil?.vip) {
      router.push("/vip");
    } else {
      router.push("/abonnement");
    }
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    setSession(null);
    setProfil(null);
  }

  return (
    <main className="min-h-screen bg-black text-white">
<Notification />
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur z-50">
        <h1 className="text-2xl font-extrabold text-green-400">
          🐎 PRONOSTIC POUR VOUS
        </h1>

        <nav className="flex items-center gap-4">
          {session ? (
  <>
    {profil?.vip && (
      <button
        onClick={() => router.push("/vip")}
        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm"
      >
        ⭐ Espace VIP
      </button>
    )}
    <button
      onClick={() => router.push("/profil")}
      className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition"
    >
      👤 Mon profil
    </button>
    <button
      onClick={deconnexion}
      className="border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition"
    >
      🚪 Déconnexion
    </button>
  </>
          ) : (
            <>
              <button
                onClick={() => router.push("/inscription")}
                className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition"
              >
                Inscription
              </button>
              <button
                onClick={() => router.push("/connexion")}
                className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-bold text-sm transition"
              >
                Connexion
              </button>
            </>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-b from-zinc-900 to-black">
        <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🔥 Pronostics PMU du jour disponibles
        </div>

        <h2 className="text-6xl font-extrabold mb-6 leading-tight max-w-3xl">
          Les meilleurs <span className="text-green-400">pronostics PMU</span> 🐎
        </h2>

        <p className="text-zinc-400 text-xl max-w-2xl mb-10">
          Analyse intelligente des chevaux, statistiques avancées et pronostics premium pour maximiser vos gains.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={voirPronostics}
            className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-green-900/40"
          >
            📊 Voir les pronostics gratuits
          </button>

          <button
            onClick={allerVip}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-yellow-900/40"
          >
            ⭐ {profil?.vip ? "Accéder à l'espace VIP" : "Abonnement VIP"}
          </button>
        </div>

        {!session && (
          <p className="text-zinc-600 text-sm mt-6">
            Pas encore de compte ?{" "}
            <span
              onClick={() => router.push("/inscription")}
              className="text-green-400 cursor-pointer hover:underline"
            >
              Créer un compte gratuit
            </span>
          </p>
        )}
      </section>

      {/* PRONOSTIC GRATUIT DU JOUR */}
      <section id="pronostics" className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-green-400 mb-2">
          📊 Pronostic gratuit du jour
        </h2>
        <p className="text-zinc-500 mb-8">Accessible à tous — mis à jour chaque jour</p>

        {prediction ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">

            {/* Infos course */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Réunion", value: prediction.reunion },
                { label: "Course", value: prediction.course },
                { label: "Hippodrome", value: prediction.hippodrome },
                { label: "Distance", value: prediction.distance + " m" },
              ].map((item) => (
                <div key={item.label} className="bg-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-xs mb-1">{item.label}</p>
                  <p className="font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Sélections */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-900/30 border border-green-700 rounded-xl p-5">
                <p className="text-green-400 text-xs font-bold uppercase mb-2">🎯 Base</p>
                <p className="text-2xl font-extrabold text-white">{prediction.bases}</p>
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-5">
                <p className="text-blue-400 text-xs font-bold uppercase mb-2">✨ Belle chance</p>
                <p className="text-2xl font-extrabold text-white">{prediction.belles_chances}</p>
              </div>
              <div className="bg-purple-900/30 border border-purple-700 rounded-xl p-5">
                <p className="text-purple-400 text-xs font-bold uppercase mb-2">💡 Outsider</p>
                <p className="text-2xl font-extrabold text-white">{prediction.outsiders}</p>
              </div>
            </div>

            {/* Ticket */}
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-5">
              <p className="text-yellow-400 text-xs font-bold uppercase mb-2">🎟️ Ticket</p>
              <p className="text-xl font-bold text-white">{prediction.ticket}</p>
            </div>

            {/* Analyse */}
            <div className="bg-zinc-800 rounded-xl p-5">
              <p className="text-zinc-400 text-xs font-bold uppercase mb-2">📝 Analyse</p>
              <p className="text-zinc-200 leading-relaxed">{prediction.analysis}</p>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center">
            <p className="text-zinc-500 text-xl">Aucun pronostic disponible aujourd'hui</p>
          </div>
        )}
      </section>

      {/* BANNER VIP */}
      <section className="px-8 py-12 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-700 rounded-2xl p-10 text-center">
          <h3 className="text-3xl font-extrabold text-yellow-400 mb-3">
            ⭐ Passez en VIP pour encore plus !
          </h3>
          <p className="text-zinc-300 mb-6 text-lg">
            Couplé VIP, sélection Tiercé Quarté Quinté, gros rapports et arrivée en exclusivité.
          </p>
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">100 000 GNF</p>
              <p className="text-zinc-400 text-sm">/ semaine</p>
            </div>
            <div className="text-zinc-700 text-3xl">|</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">300 000 GNF</p>
              <p className="text-zinc-400 text-sm">/ mois</p>
            </div>
          </div>
          <button
            onClick={allerVip}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-lg transition"
          >
            {profil?.vip ? "⭐ Accéder à mon espace VIP" : "🚀 S'abonner maintenant"}
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6 px-8 pb-20 max-w-4xl mx-auto">
        {[
          { icon: "🤖", title: "Pronostics IA", desc: "Notre intelligence artificielle analyse automatiquement les performances des chevaux." },
          { icon: "📅", title: "Courses du jour", desc: "Toutes les réunions PMU et les meilleures sélections quotidiennes." },
          { icon: "👑", title: "VIP Premium", desc: "Accès exclusif aux analyses premium, couplés VIP et gros rapports." },
        ].map((f) => (
          <div key={f.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-green-700 transition">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">{f.title}</h3>
            <p className="text-zinc-400">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800 text-center py-8 text-zinc-600 text-sm">
        © 2025 Pronostic Pour Vous — Tous droits réservés
      </footer>

    </main>
  );
}