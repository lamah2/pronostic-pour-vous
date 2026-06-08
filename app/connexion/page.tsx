"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

async function connexion() {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
  alert(error.message);
} else {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profil?.role === "admin") {
    router.push("/admin");
  } else if (profil?.role === "vip") {
    router.push("/analyse");
  } else {
    router.push("/");
  }
}
}
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 p-10 rounded-2xl w-full max-w-md border border-green-500">
        
        <h1 className="text-4xl font-bold text-green-400 mb-8 text-center">
          Connexion 🔐
        </h1>

        <form className="space-y-5">
          
          <div>
            <label className="block mb-2 text-gray-300">
              Email
            </label>

            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Mot de passe
            </label>

            <input
              type="password"
              placeholder="********"
              className="w-full p-4 rounded-xl bg-black border border-zinc-700 text-white"

              value={password}
              onChange={(e) => setPassword(e.target.value)}
/>
          </div>

          <button
          type="button"
          onClick={connexion}
            className="w-full bg-green-500 hover:bg-green-600 transition p-4 rounded-xl font-bold text-xl"
          >
            Se connecter
          </button>

        </form>
      </div>
    </main>
  );
}