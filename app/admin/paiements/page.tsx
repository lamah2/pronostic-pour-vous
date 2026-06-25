"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState<any[]>([]);

  useEffect(() => {
    chargerPaiements();
  }, []);

  async function chargerPaiements() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/";
      return;
    }

    if (session.user.email !== "lamalsibaa@gmail.com") {
      alert("Accès administrateur uniquement");
      window.location.href = "/";
      return;
    }

    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPaiements(data);
  }

  async function validerPaiement(p: any) {
    await supabase
      .from("payments")
      .update({ status: "Completed" })
      .eq("id", p.id);

    const debutVip = new Date();
    const finVip = new Date();

    if (p.plan === "weekly") {
      finVip.setDate(finVip.getDate() + 7);
    } else {
      finVip.setDate(finVip.getDate() + 30);
    }

    await supabase
      .from("profiles")
      .update({
        vip: true,
        date_debut_vip: debutVip.toISOString(),
        date_fin_vip: finVip.toISOString(),
      })
      .eq("email", p.email);

    alert("✅ VIP activé pour " + p.nom);
    chargerPaiements();
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-8">
        Gestion des paiements
      </h1>

      <div className="overflow-x-auto rounded-xl border border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800 text-green-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Nom</th>
              <th className="px-4 py-3 text-left">Téléphone</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Référence</th>
              <th className="px-4 py-3 text-left">Statut</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {paiements.map((p, index) => (
              <tr
                key={p.id}
                className={index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800"}
              >
                <td className="px-4 py-3 font-semibold">{p.nom}</td>
                <td className="px-4 py-3 text-gray-300">{p.telephone}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    p.plan === "weekly"
                      ? "bg-blue-600 text-white"
                      : "bg-purple-600 text-white"
                  }`}>
                    {p.plan === "weekly" ? "Hebdo" : "Mensuel"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {p.transaction_ref}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    p.status === "Completed"
                      ? "bg-green-700 text-green-200"
                      : "bg-yellow-700 text-yellow-200"
                  }`}>
                    {p.status === "Completed" ? "✅ Validé" : "⏳ En attente"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {p.status === "Pending" && (
                    <button
                      onClick={() => validerPaiement(p)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-bold transition"
                    >
                      Valider
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paiements.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            Aucun paiement reçu
          </div>
        )}
      </div>
    </main>
  );
}