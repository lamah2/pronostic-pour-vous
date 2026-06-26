"use client";
import DateDuJour from "@/app/components/DateDuJour";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function AnalysePage() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifierConnexion() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/connexion");
        return;
      }

      const { data: profil } = await supabase
        .from("profiles")
        .select("vip")
        .eq("id", session.user.id)
        .single();

      if (!profil?.vip) {
        router.push("/abonnement");
        return;
      }

      const { data } = await supabase
        .from("predictions")
        .select("*")
        .limit(1)
        .single();

      if (data) setPrediction(data);
      setLoading(false);
    }

    verifierConnexion();
  }, [router]);

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐎</div>
        <p className="text-green-400 text-2xl font-bold animate-pulse">Chargement...</p>
      </div>
    </main>
  );

  if (!prediction) return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-zinc-400 text-xl">Aucune analyse disponible aujourd'hui</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 bg-green-600 px-6 py-3 rounded-xl font-bold"
        >
          Retour à l'accueil
        </button>
      </div>
    </main>
  );

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
          <DateDuJour />
          <button
            onClick={() => router.push("/vip")}
            className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm"
          >
            ⭐ Espace VIP
          </button>
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
        <div className="text-center mb-10">
          <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            🔥 Analyse du jour disponible
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-3">
            Analyse <span className="text-green-400">Quinté+</span> 🐎
          </h1>
          <p className="text-zinc-400">
            Réunion {prediction.reunion} • Course {prediction.course} • {prediction.hippodrome}
          </p>
        </div>

        {/* INFOS COURSE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Réunion", value: prediction.reunion },
            { label: "Course", value: prediction.course },
            { label: "Hippodrome", value: prediction.hippodrome },
            { label: "Distance", value: prediction.distance + " m" },
          ].map((item) => (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-zinc-500 text-xs mb-1">{item.label}</p>
              <p className="font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {/* SÉLECTIONS IA */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
            🤖 Sélections Intelligence Artificielle
          </h2>

          <div className="space-y-4">
            {[
              { rang: "1er", nom: "JAGUAR DU RIB", pct: 92, couleur: "green" },
              { rang: "2ème", nom: "IBIS PETTEVINIERE", pct: 87, couleur: "blue" },
              { rang: "3ème", nom: "HIRONDELLE FEE", pct: 81, couleur: "purple" },
            ].map((cheval) => (
              <div
                key={cheval.rang}
                className={`bg-black rounded-xl p-5 border ${
                  cheval.couleur === "green" ? "border-green-600" :
                  cheval.couleur === "blue" ? "border-blue-600" : "border-purple-600"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
                      cheval.couleur === "green" ? "bg-green-900 text-green-400" :
                      cheval.couleur === "blue" ? "bg-blue-900 text-blue-400" : "bg-purple-900 text-purple-400"
                    }`}>
                      {cheval.rang}
                    </span>
                    <span className="font-extrabold text-lg text-white">{cheval.nom}</span>
                  </div>
                  <span className={`font-bold text-lg ${
                    cheval.couleur === "green" ? "text-green-400" :
                    cheval.couleur === "blue" ? "text-blue-400" : "text-purple-400"
                  }`}>
                    {cheval.pct}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      cheval.couleur === "green" ? "bg-green-500" :
                      cheval.couleur === "blue" ? "bg-blue-500" : "bg-purple-500"
                    }`}
                    style={{ width: `${cheval.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRONOSTICS */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-900/20 border border-green-700 rounded-2xl p-6">
            <p className="text-green-400 text-xs font-bold uppercase mb-2">🎯 Base</p>
            <p className="text-3xl font-extrabold text-white">{prediction.bases}</p>
          </div>
          <div className="bg-blue-900/20 border border-blue-700 rounded-2xl p-6">
            <p className="text-blue-400 text-xs font-bold uppercase mb-2">✨ Belle chance</p>
            <p className="text-3xl font-extrabold text-white">{prediction.belles_chances}</p>
          </div>
          <div className="bg-purple-900/20 border border-purple-700 rounded-2xl p-6">
            <p className="text-purple-400 text-xs font-bold uppercase mb-2">💡 Outsider</p>
            <p className="text-3xl font-extrabold text-white">{prediction.outsiders}</p>
          </div>
          <div className="bg-orange-900/20 border border-orange-700 rounded-2xl p-6">
            <p className="text-orange-400 text-xs font-bold uppercase mb-2">💰 Gros rapport</p>
            <p className="text-3xl font-extrabold text-white">{prediction.gros_rapports}</p>
          </div>
        </div>

        {/* TICKET */}
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-2xl p-6 mb-6">
          <p className="text-yellow-400 text-xs font-bold uppercase mb-2">🎟️ Ticket</p>
          <p className="text-2xl font-extrabold text-white">{prediction.ticket}</p>
        </div>

        {/* ANALYSE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <p className="text-zinc-400 text-xs font-bold uppercase mb-3">📝 Analyse complète</p>
          <p className="text-zinc-200 leading-relaxed">{prediction.analysis}</p>
        </div>

        {/* BOUTONS */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/vip")}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold transition"
          >
            ⭐ Pronostics VIP
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 border border-zinc-700 hover:border-green-500 text-zinc-400 hover:text-green-400 py-3 rounded-xl font-semibold transition"
          >
            🏠 Accueil
          </button>
        </div>

      </div>
    </main>
  );
}