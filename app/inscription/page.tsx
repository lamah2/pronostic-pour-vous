"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function InscriptionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function inscription() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé avec succès !");
      router.push("/connexion");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-zinc-900 p-10 rounded-2xl w-full max-w-xl border border-green-500">

        <h1 className="text-4xl font-bold text-green-400 mb-8 text-center">
          Inscription 📝
        </h1>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Votre email"
            className="w-full p-4 rounded-xl bg-black border border-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-4 rounded-xl bg-black border border-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={inscription}
            className="w-full bg-green-500 hover:bg-green-600 p-4 rounded-xl font-bold text-2xl"
          >
            Créer un compte
          </button>

        </div>
      </div>
    </main>
  );
}