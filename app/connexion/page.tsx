"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function connexion() {
    if (!email || !password) {
      alert("⚠️ Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      if (error.message === "Invalid login credentials") {
        alert("❌ Email ou mot de passe incorrect");
      } else {
        alert("❌ " + error.message);
      }
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      router.push("/connexion");
      return;
    }

    const { data: profil } = await supabase
      .from("profiles")
      .select("role, vip")
      .eq("id", session.user.id)
      .single();

    setLoading(false);

    if (profil?.role === "admin") {
      router.push("/admin");
    } else if (profil?.vip) {
      router.push("/vip");
    } else {
      router.push("/");
    }
  }

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
          <p className="text-zinc-500 text-sm">Connectez-vous pour accéder à vos pronostics</p>
        </div>

        {/* CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          <h2 className="text-2xl font-bold mb-6">Connexion 🔐</h2>

          <div className="space-y-5">

            {/* EMAIL */}
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && connexion()}
              />
            </div>

            {/* MOT DE PASSE */}
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && connexion()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition text-lg"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* MOT DE PASSE OUBLIÉ */}
            <div className="text-right">
              <span
                onClick={() => router.push("/mot-de-passe-oublie")}
                className="text-green-400 text-sm cursor-pointer hover:underline"
              >
                Mot de passe oublié ?
              </span>
            </div>

            {/* BOUTON CONNEXION */}
            <button
              type="button"
              onClick={connexion}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-xl font-bold text-lg transition disabled:opacity-50"
            >
              {loading ? "Connexion en cours..." : "Se connecter 🚀"}
            </button>

          </div>

          {/* SÉPARATEUR */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="text-zinc-600 text-sm">ou</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>

          {/* LIEN INSCRIPTION */}
          <p className="text-center text-zinc-400 text-sm">
            Pas encore de compte ?{" "}
            <span
              onClick={() => router.push("/inscription")}
              className="text-green-400 font-semibold cursor-pointer hover:underline"
            >
              Créer un compte gratuit
            </span>
          </p>

        </div>

        {/* RETOUR ACCUEIL */}
        <p className="text-center text-zinc-600 text-sm mt-6 cursor-pointer hover:text-zinc-400 transition"
          onClick={() => router.push("/")}
        >
          ← Retour à l'accueil
        </p>

      </div>
    </main>
  );
}