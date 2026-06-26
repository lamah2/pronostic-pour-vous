"use client";
import DateDuJour from "@/app/components/DateDuJour";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function AbonnementPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [reference, setReference] = useState("");
  const [plan, setPlan] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);

  async function enregistrerPaiement() {
    if (!nom || !telephone || !reference) {
      alert("⚠️ Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/connexion");
      return;
    }

    const montant = plan === "weekly" ? 100000 : 300000;

    const { error } = await supabase.from("payments").insert({
      email: session.user.email,
      nom,
      telephone,
      plan,
      amount: montant,
      method: "Orange Money",
      transaction_ref: reference,
      status: "Pending",
    });

    setLoading(false);

    if (error) {
      alert("❌ Erreur : " + error.message);
      return;
    }

    setSucces(true);
    // Notification Telegram
    await fetch(
      `https://api.telegram.org/bot8998945170:AAHWfvIl35vDNAgkguWHhi_-o_FdlW84tLU/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: "8532710106",
          text: `🔔 Nouveau paiement !\n\n👤 Nom: ${nom}\n📱 Téléphone: ${telephone}\n📋 Plan: ${plan === "weekly" ? "Hebdomadaire" : "Mensuel"}\n💰 Montant: ${montant.toLocaleString()} GNF\n🔑 Référence: ${reference}\n\n✅ Connectez-vous pour valider !`,
        }),
      }
    );

    setSucces(true);
  }

  if (succes) return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="bg-zinc-900 border border-green-700 rounded-2xl p-12 max-w-md text-center">
        <div className="text-7xl mb-6">✅</div>
        <h2 className="text-3xl font-extrabold text-green-400 mb-4">
          Demande envoyée !
        </h2>
        <p className="text-zinc-400 mb-8">
          Votre demande a été reçue. L'administrateur va valider votre paiement sous peu et votre accès VIP sera activé automatiquement.
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
        >
          🏠 Retour à l'accueil
        </button>
      </div>
    </main>
  );

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
        <DateDuJour />
        <button
          onClick={() => router.push("/")}
          className="border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-400 px-4 py-2 rounded-lg text-sm transition"
        >
          ← Retour
        </button>
      </header>

      <div className="max-w-xl mx-auto px-6 py-12">

        <div className="text-center mb-10">
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            ⭐ Abonnement VIP
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Accédez aux pronostics <span className="text-yellow-400">exclusifs</span>
          </h1>
          <p className="text-zinc-400">
            Payez via Orange Money et obtenez votre accès immédiatement après validation.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[
            { id: "weekly", label: "Hebdomadaire", prix: "100 000 GNF", duree: "7 jours", icon: "📅" },
            { id: "monthly", label: "Mensuel", prix: "300 000 GNF", duree: "30 jours", icon: "🗓️" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPlan(p.id)}
              className={`p-6 rounded-2xl border-2 text-left transition ${
                plan === p.id
                  ? "border-yellow-500 bg-yellow-900/20"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
              }`}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <p className="font-bold text-lg">{p.label}</p>
              <p className="text-yellow-400 font-extrabold text-xl mt-1">{p.prix}</p>
              <p className="text-zinc-500 text-sm mt-1">{p.duree}</p>
              {plan === p.id && (
                <span className="inline-block mt-3 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  ✓ Sélectionné
                </span>
              )}
            </button>
          ))}
        </div>

        {/* INSTRUCTIONS PAIEMENT */}
        <div className="bg-orange-900/20 border border-orange-700 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-orange-400 mb-4">
            📱 Comment payer via Orange Money
          </h3>
          <ol className="space-y-2 text-zinc-300 text-sm">
            <li className="flex gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              Composez <strong className="text-white ml-1">#144#</strong> sur votre téléphone
            </li>
            <li className="flex gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              Choisissez <strong className="text-white ml-1">Transfert d'argent</strong>
            </li>
            <li className="flex gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
              Envoyez au numéro : <strong className="text-orange-400 ml-1 text-base">612 70 23 67</strong>
            </li>
            <li className="flex gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
              Montant : <strong className="text-white ml-1">{plan === "weekly" ? "100 000" : "300 000"} GNF</strong>
            </li>
            <li className="flex gap-3">
              <span className="bg-orange-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
              Notez la <strong className="text-white ml-1">référence de transaction</strong> reçue par SMS
            </li>
          </ol>
        </div>

        {/* FORMULAIRE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">
          <h3 className="text-lg font-bold text-zinc-300 mb-2">
            📝 Confirmez votre paiement
          </h3>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Nom complet</label>
            <input
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
              placeholder="Ex: Mamadou Diallo"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Téléphone Orange Money</label>
            <input
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
              placeholder="Ex: 612345678"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>

          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Référence de transaction</label>
            <input
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
              placeholder="Ex: OM-1234567890"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <button
            onClick={enregistrerPaiement}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-xl font-extrabold text-lg transition disabled:opacity-50"
          >
            {loading ? "Envoi en cours..." : "✅ J'ai effectué le paiement"}
          </button>

          <p className="text-zinc-600 text-xs text-center">
            Votre accès VIP sera activé dans les plus brefs délais après vérification.
          </p>
        </div>

      </div>
    </main>
  );
}