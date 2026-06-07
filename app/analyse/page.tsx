"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";
export default function AnalysePage() {
  console.log("PAGE ANALYSE CHARGEE");
  const router = useRouter();
const [prediction, setPrediction] = useState<any>(null);

useEffect(() => {
  async function verifierConnexion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/connexion");
      return;
    }
    // Vérifier si l'utilisateur est VIP
const { data: profil, error } = await supabase
  .from("profiles")
  .select("vip")
  .eq("id", session.user.id)
  .single();

console.log("SESSION =", session.user.id);
console.log("PROFIL =", profil);
console.log("ERREUR =", error);
if (!profil?.vip) {
  alert("Accès réservé aux membres VIP");
  router.push("/");
  return;
}
if (!profil || profil.vip !== true) {
  alert("Accès réservé aux membres VIP");
  router.push("/");
  return;
}
    const { data, error, count } = await supabase
.from("predictions")
.select("*", { count: "exact" });



if (data && data.length > 0) {
  setPrediction(data[0]);
}

  }

  verifierConnexion();
}, [router]);
if (!prediction) {
  return <div className="text-white p-10">
    Aucune donnée reçue
  </div>;
}
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <button
  onClick={async () => {
    await supabase.auth.signOut();
    router.push("/connexion");
  }}
  className="mb-6 bg-red-600 px-4 py-2 rounded"
>
  Déconnexion
</button>
      <h1 className="text-5xl font-bold text-green-400 mb-8">
        Analyse Quinté+ 🐎
      </h1>

      <div className="bg-zinc-900 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-semibold mb-4">
  Quinté+ {prediction.hippodrome}
</h2>

<p className="text-gray-300 mb-2">
  Réunion {prediction.reunion} • Course {prediction.course}
</p>

        <div className="mt-6 space-y-4">
          <div className="bg-black p-4 rounded-xl border border-green-500">
            <h3 className="text-xl font-bold text-green-400">
              1er : JAGUAR DU RIB
            </h3>
            <p>Pourcentage IA : 92%</p>
          </div>

          <div className="bg-black p-4 rounded-xl border border-green-500">
            <h3 className="text-xl font-bold text-green-400">
              2ème : IBIS PETTEVINIERE
            </h3>
            <p>Pourcentage IA : 87%</p>
          </div>

          <div className="bg-black p-4 rounded-xl border border-green-500">
            <h3 className="text-xl font-bold text-green-400">
              3ème : HIRONDELLE FEE
            </h3>
            <p>Pourcentage IA : 81%</p>
          </div>
        </div>
      </div>
    </main>
  );
}