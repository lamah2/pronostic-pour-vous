"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  async function envoyerLien() {
    if (!email) {
      alert("⚠️ Veuillez entrer votre email");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://pronostic-pour-vous.vercel.app/nouveau-mot-de-passe",
    });

    setLoading(false);

    if (error) {
      alert("❌ " + error.message);
      return;
    }

    setEnvoye(true);
  }

  if (envoye) return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="bg-zinc-900 border border-green-700 rounded-2xl p-12 max-w-md text-center">
        <div className="text-7xl mb-6">📧</div>
        <h2 className="text-3xl font-extrabold text-green-400 mb-4">
          Email envoyé !
        </h2>
        <p className="text-zinc-400 mb-2">
          Un lien de réinitialisation a été envoyé à :
        </p>
        <p className="text-white font-bold mb-8">{email}</p>
        <p className="text-zinc-500 text-sm mb-8">
          Vérifiez votre boîte mail et cliquez sur le lien pour créer un nouveau mot de passe.
        </p>
        <button
          onClick={() => router.push("/connexion")}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
        >
          ← Retour à la connexion
        </button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-10">
          <h1
            onClick={() => router.push("/")}
            className="text-3xl font-extrabold text-green-400 cursor-pointer mb-2"
          >
            🐎 PRONOSTIC POUR VOUS
          </h1>
          <p className="text-zinc-500 text-sm">Réinitialisez votre mot de passe</p>
        </div>

        {/* CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔑</div>
            <h2 className="text-2xl font-bold">Mot de passe oublié</h2>
            <p className="text-zinc-500 text-sm mt-2">
              Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && envoyerLien()}
              />
            </div>

            <button
              onClick={envoyerLien}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Envoi en cours..." : "📧 Envoyer le lien"}
            </button>
          </div>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="text-zinc-600 text-sm">ou</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>

          <p className="text-center text-zinc-400 text-sm">
            Vous souvenez du mot de passe ?{" "}
            <span
              onClick={() => router.push("/connexion")}
              className="text-green-400 font-semibold cursor-pointer hover:underline"
            >
              Se connecter
            </span>
          </p>
        </div>

        <p
          className="text-center text-zinc-600 text-sm mt-6 cursor-pointer hover:text-zinc-400 transition"
          onClick={() => router.push("/")}
        >
          ← Retour à l'accueil
        </p>

      </div>
    </main>
  );
}