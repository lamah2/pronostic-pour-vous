"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";
import Notification from "./components/Notification";
import DateDuJour from "./components/DateDuJour";

export default function Home() {
  const router = useRouter();
  const [prediction, setPrediction] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [profil, setProfil] = useState<any>(null);
  const [historiqueGratuit, setHistoriqueGratuit] = useState<any[]>([]);
  const [historiqueVip, setHistoriqueVip] = useState<any[]>([]);
  const [ongletHistorique, setOngletHistorique] = useState<"gratuit" | "vip">("gratuit");

  useEffect(() => {
    async function charger() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfil(p);
      }

      // Pronostic gratuit du jour
      const { data } = await supabase
        .from("predictions")
        .select("*")
        .limit(1)
        .single();
      if (data) setPrediction(data);

      // Historique gratuit (7 derniers jours)
      const sept = new Date();
      sept.setDate(sept.getDate() - 7);
      const { data: hGratuit } = await supabase
        .from("historique_predictions")
        .select("*")
        .gte("created_at", sept.toISOString())
        .order("created_at", { ascending: false });
      if (hGratuit) setHistoriqueGratuit(hGratuit);

      // Historique VIP (7 derniers jours SAUF aujourd'hui)
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0);
      const { data: hVip } = await supabase
        .from("vip_pronostics_historique")
        .select("*")
        .gte("created_at", sept.toISOString())
        .lt("created_at", aujourdhui.toISOString())
        .order("created_at", { ascending: false });
      if (hVip) setHistoriqueVip(hVip);
    }
    charger();
  }, []);

  function voirPronostics() {
    document.getElementById("pronostics")?.scrollIntoView({ behavior: "smooth" });
  }

  function voirHistorique() {
    document.getElementById("historique")?.scrollIntoView({ behavior: "smooth" });
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

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long", day: "2-digit", month: "long", year: "numeric"
    });
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Notification />

      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-5 border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur z-50">
        <h1 className="text-2xl font-extrabold text-green-400">
          🐎 PRONOSTIC POUR VOUS
        </h1>
        <DateDuJour />
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              {profil?.vip && (
                <button onClick={() => router.push("/vip")} className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold text-sm">
                  ⭐ Espace VIP
                </button>
              )}
              <button onClick={() => router.push("/profil")} className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition">
                👤 Mon profil
              </button>
              <button onClick={deconnexion} className="border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 px-4 py-2 rounded-lg text-sm transition">
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push("/inscription")} className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition">
                Inscription
              </button>
              <button onClick={() => router.push("/connexion")} className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-bold text-sm transition">
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
          <button onClick={voirPronostics} className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-green-900/40">
            📊 Voir les pronostics gratuits
          </button>
          <button onClick={voirHistorique} className="bg-zinc-700 hover:bg-zinc-600 px-8 py-4 rounded-xl text-lg font-bold transition">
            🕘 Voir l'historique
          </button>
          <button onClick={allerVip} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl text-lg font-bold transition shadow-lg shadow-yellow-900/40">
            ⭐ {profil?.vip ? "Accéder à l'espace VIP" : "Abonnement VIP"}
          </button>
        </div>
        {!session && (
          <p className="text-zinc-600 text-sm mt-6">
            Pas encore de compte ?{" "}
            <span onClick={() => router.push("/inscription")} className="text-green-400 cursor-pointer hover:underline">
              Créer un compte gratuit
            </span>
          </p>
        )}
      </section>

      {/* PRONOSTIC GRATUIT DU JOUR */}
      <section id="pronostics" className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-green-400 mb-2">📊 Pronostic gratuit du jour</h2>
        <p className="text-zinc-500 mb-8">Accessible à tous — mis à jour chaque jour</p>

        {prediction ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
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
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-5">
              <p className="text-yellow-400 text-xs font-bold uppercase mb-2">🎟️ Ticket</p>
              <p className="text-xl font-bold text-white">{prediction.ticket}</p>
            </div>
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

      {/* ✅ SECTION HISTORIQUE */}
      <section id="historique" className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-2">🕘 Historique des pronostics</h2>
        <p className="text-zinc-500 mb-8">Les 7 derniers jours — pour voir nos performances</p>

        {/* Onglets */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setOngletHistorique("gratuit")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition ${
              ongletHistorique === "gratuit"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            📊 Pronostics Gratuits
          </button>
          <button
            onClick={() => setOngletHistorique("vip")}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition ${
              ongletHistorique === "vip"
                ? "bg-yellow-500 text-black"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            👑 Pronostics VIP
          </button>
        </div>

        {/* HISTORIQUE GRATUIT */}
        {ongletHistorique === "gratuit" && (
          <div className="space-y-4">
            {historiqueGratuit.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center text-zinc-500">
                <p className="text-4xl mb-4">📭</p>
                <p>Aucun historique disponible pour le moment.</p>
              </div>
            ) : (
              historiqueGratuit.map((h) => (
                <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-green-900/50 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                      📅 {formatDate(h.created_at)}
                    </span>
                    {h.hippodrome && (
                      <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full">
                        🏟 {h.hippodrome} {h.reunion && `• ${h.reunion}`} {h.course && `• ${h.course}`}
                      </span>
                    )}
                  </div>

                  {/* Sélections */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    {h.bases && (
                      <div className="bg-green-900/30 border border-green-800 rounded-xl p-3">
                        <p className="text-green-400 text-xs font-bold mb-1">🎯 Base</p>
                        <p className="text-white font-bold">{h.bases}</p>
                      </div>
                    )}
                    {h.belles_chances && (
                      <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-3">
                        <p className="text-blue-400 text-xs font-bold mb-1">✨ Belle chance</p>
                        <p className="text-white font-bold">{h.belles_chances}</p>
                      </div>
                    )}
                    {h.outsiders && (
                      <div className="bg-purple-900/30 border border-purple-800 rounded-xl p-3">
                        <p className="text-purple-400 text-xs font-bold mb-1">💡 Outsider</p>
                        <p className="text-white font-bold">{h.outsiders}</p>
                      </div>
                    )}
                    {h.ticket && (
                      <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-3">
                        <p className="text-yellow-400 text-xs font-bold mb-1">🎫 Ticket</p>
                        <p className="text-white font-bold">{h.ticket}</p>
                      </div>
                    )}
                  </div>

                  {/* Analyse */}
                  {h.analysis && (
                    <div className="bg-zinc-800/50 rounded-xl p-3">
                      <p className="text-zinc-400 text-xs font-bold mb-1">📝 Analyse</p>
                      <p className="text-zinc-300 text-sm leading-relaxed">{h.analysis}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* HISTORIQUE VIP */}
        {ongletHistorique === "vip" && (
          <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 flex items-center gap-3 mb-6">
              <span className="text-2xl">👑</span>
              <p className="text-yellow-300 text-sm">
                Les pronostics VIP du jour sont <strong>exclusifs aux membres VIP</strong>. 
                L'historique ci-dessous montre les anciens pronostics pour démontrer nos performances.
              </p>
            </div>

            {historiqueVip.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center text-zinc-500">
                <p className="text-4xl mb-4">📭</p>
                <p>Aucun historique VIP disponible pour le moment.</p>
              </div>
            ) : (
              historiqueVip.map((h) => (
                <div key={h.id} className="bg-zinc-900 border border-yellow-900/40 rounded-2xl p-6">
                  {/* Date */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-yellow-900/50 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
                      📅 {formatDate(h.created_at)}
                    </span>
                    <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-3 py-1 rounded-full">
                      👑 VIP
                    </span>
                  </div>

                  {/* Sélections VIP */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {h.couple_vip && (
                      <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4">
                        <p className="text-yellow-400 text-xs font-bold mb-1">💛 Couplé VIP</p>
                        <p className="text-white text-xl font-extrabold">{h.couple_vip}</p>
                      </div>
                    )}
                    {h.selection_vip && (
                      <div className="bg-orange-900/30 border border-orange-700 rounded-xl p-4">
                        <p className="text-orange-400 text-xs font-bold mb-1">🎯 Sélection T/Q/Q</p>
                        <p className="text-white text-xl font-extrabold">{h.selection_vip}</p>
                      </div>
                    )}
                    {h.arrivee && (
                      <div className="bg-green-900/30 border border-green-700 rounded-xl p-4">
                        <p className="text-green-400 text-xs font-bold mb-1">🏆 Arrivée</p>
                        <p className="text-white text-xl font-extrabold">{h.arrivee}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* CTA Abonnement */}
            {!profil?.vip && (
              <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-700 rounded-2xl p-8 text-center mt-6">
                <p className="text-yellow-400 text-xl font-bold mb-2">
                  Vous voulez les pronostics VIP du jour ?
                </p>
                <p className="text-zinc-400 mb-4">Rejoignez nos membres VIP et accédez aux pronostics exclusifs chaque jour.</p>
                <button
                  onClick={allerVip}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold transition"
                >
                  🚀 S'abonner maintenant
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* BANNER VIP */}
      <section className="px-8 py-12 max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-700 rounded-2xl p-10 text-center">
          <h3 className="text-3xl font-extrabold text-yellow-400 mb-3">⭐ Passez en VIP pour encore plus !</h3>
          <p className="text-zinc-300 mb-6 text-lg">Couplé VIP, sélection Tiercé Quarté Quinté, gros rapports et arrivée en exclusivité.</p>
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
          <button onClick={allerVip} className="bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-lg transition">
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
