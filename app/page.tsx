"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
export default function Home() {

  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    async function charger() {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .limit(1)
        .single();

      console.log("PAGE PUBLIQUE =", data);
      console.log("ERREUR =", error);

      if (data) {
        setPrediction(data);
        
      }
      
    }

    charger();
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      
      <header className="flex justify-between items-center p-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-green-400">
          PRONOSTIC POUR VOUS
        </h1>

        <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-lg font-semibold">
          Connexion
        </button>
      </header>

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h2 className="text-6xl font-extrabold mb-6 leading-tight">
          Les meilleurs pronostics PMU 🚀
        </h2>

        <p className="text-gray-300 text-xl max-w-2xl mb-10">
          Analyse intelligente des chevaux, statistiques avancées,
          pourcentages automatiques et pronostics premium.
        </p>

        <div className="flex gap-4">
          <button className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl text-xl font-bold">
            Voir les pronostics
          </button>

          <button className="border border-gray-600 hover:border-green-400 px-8 py-4 rounded-xl text-xl">
            Abonnement VIP
          </button>
        </div>
      </section>
{prediction && (
  <div className="mx-10 mb-10 bg-gray-800 rounded-2xl p-6">
    <h2 className="text-3xl font-bold text-green-400 mb-4">
      Pronostic du jour
    </h2>

    <p><strong>Réunion :</strong> {prediction.reunion}</p>
    <p><strong>Course :</strong> {prediction.course}</p>
    <p><strong>Hippodrome :</strong> {prediction.hippodrome}</p>
    <p><strong>Distance :</strong> {prediction.distance} m</p>

    <br />

    <p><strong>Base :</strong> {prediction.bases}</p>
    <p><strong>Belle chance :</strong> {prediction.belles_chances}</p>
    <p><strong>Outsider :</strong> {prediction.outsiders}</p>

    <br />

    <p><strong>Ticket :</strong> {prediction.ticket}</p>

    <br />

    <p><strong>Analyse :</strong></p>
    <p>{prediction.analysis}</p>
  </div>
)}
      <section className="grid md:grid-cols-3 gap-8 px-10 pb-20">
        
        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4">
            Pronostics IA
          </h3>

          <p className="text-gray-300">
            Notre intelligence artificielle analyse automatiquement les performances des chevaux.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4">
            Courses du jour
          </h3>

          <p className="text-gray-300">
            Retrouvez toutes les réunions PMU et les meilleures sélections quotidiennes.
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="text-2xl font-bold text-green-400 mb-4">
            VIP Premium
          </h3>

          <p className="text-gray-300">
            Accès exclusif aux analyses premium et gros rapports PMU.
          </p>
        </div>

      </section>
<section className="px-10 pb-20">
  <h2 className="text-4xl font-bold text-green-400 mb-10">
    Courses du jour
  </h2>

  <div className="grid md:grid-cols-3 gap-6">

    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-3">
        Quinté+ Vincennes
      </h3>

      <p className="text-gray-300 mb-4">
        Réunion 1 • Course 4 • 15 Partants
      </p>

      <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-bold">
        Voir analyse
      </button>
    </div>

    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-3">
        Compiègne R2
      </h3>

      <p className="text-gray-300 mb-4">
        Réunion 2 • Course 5 • 14 Partants
      </p>

      <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-bold">
        Voir analyse
      </button>
    </div>

    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold mb-3">
        Lyon-Parilly
      </h3>

      <p className="text-gray-300 mb-4">
        Réunion 3 • Course 1 • 16 Partants
      </p>

      <button className="bg-green-500 hover:bg-green-600 px-5 py-3 rounded-xl font-bold">
        Voir analyse
      </button>
    </div>

  </div>
</section>
    </main>
  );
}