"use client";

import { useState } from "react";
import { supabase } from "../supabase";

export default function PaiementPage() {
  const [email, setEmail] = useState("");
  const [numero, setNumero] = useState("");
  const [montant, setMontant] = useState("10000");
  const [loading, setLoading] = useState(false);

  async function enregistrerPaiement() {
    setLoading(true);

    const { error } = await supabase
      .from("payments")
      .insert([
        {
          email,
          amount: Number(montant),
          method: "Orange Money",
          status: "En attente",
          transaction_ref: "OM-" + Date.now(),
        },
      ]);

    setLoading(false);

    if (error) {
  console.log("ERREUR PAYMENT =", error);
  alert(JSON.stringify(error));

    } else {
      alert("Demande de paiement enregistrée");
      setEmail("");
      setNumero("");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-orange-500 mb-8">
        Paiement Orange Money
      </h1>

      <div className="max-w-md flex flex-col gap-4">

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 bg-gray-900 border border-gray-700 rounded"
        />

        <input
          type="text"
          placeholder="Numéro Orange Money"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="p-3 bg-gray-900 border border-gray-700 rounded"
        />

        <select
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          className="p-3 bg-gray-900 border border-gray-700 rounded"
        >
          <option value="10000">30 jours - 10 000 GNF</option>
          <option value="25000">90 jours - 25 000 GNF</option>
        </select>

        <button
          onClick={enregistrerPaiement}
          disabled={loading}
          className="bg-orange-500 text-black font-bold py-3 rounded"
        >
          {loading ? "Enregistrement..." : "Payer"}
        </button>

      </div>
    </main>
  );
}