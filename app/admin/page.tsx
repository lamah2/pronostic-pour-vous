"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
async function deconnexion() {
  await supabase.auth.signOut();
  window.location.href = "/connexion";
}
useEffect(() => {
  
  verifierAdmin();
}, []);

async function verifierAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    router.push("/connexion");
    return;
    setLoading(false);
  }

  const { data: profil, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  console.log("PROFIL ADMIN =", profil);
  console.log("ERREUR ADMIN =", error);

  if (!profil || profil.role !== "admin") {
    alert("Accès administrateur refusé");
    router.push("/");
    return;
  }
  setLoading(false);
}


  const [reunion, setReunion] = useState("");
  const [course, setCourse] = useState("");
  const [hippodrome, setHippodrome] = useState("");
  const [distance, setDistance] = useState("");

const [base1, setBase1] = useState("");
const [base2, setBase2] = useState("");

const [belle1, setBelle1] = useState("");
const [belle2, setBelle2] = useState("");

const [outsider1, setOutsider1] = useState("");
const [outsider2, setOutsider2] = useState("");

const [grosRapport, setGrosRapport] = useState("");
const [ticket, setTicket] = useState("");
const [analysis, setAnalysis] = useState("");
  useEffect(() => {
  async function charger() {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .limit(1)
      .single();

  
    
    

   if (data) {
  setReunion(data.reunion || "");
  setCourse(data.course || "");
  setHippodrome(data.hippodrome || "");
  setDistance(data.distance || "");

  setBase1(data.bases || "");
  setBelle1(data.belles_chances || "");
  setOutsider1(data.outsiders || "");

  setGrosRapport(data.gros_rapports || "");
  setTicket(data.ticket || "");
  setAnalysis(data.analysis || "");
}
  }

  charger();
}, []);
async function sauvegarder() {
  
const { data, error } = await supabase
  .from("predictions")
  .update({
  reunion,
  course,
  hippodrome,
  distance,
  bases: base1,
  belles_chances: belle1,
  outsiders: outsider1,
  gros_rapports: grosRapport,
  ticket,
  analysis,
})
  .eq("id", "a23e82ea-7ce4-4e28-ba74-22bb25a780e0")
  .select("*");
  




  if (error) {
    
    alert("Erreur lors de la sauvegarde");
  } else {
    alert("Sauvegarde réussie !");
  }
}
if (loading) {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <h1 className="text-green-400 text-3xl">
        Vérification...
      </h1>
    </main>
  );
}
  return (
    <main className="min-h-screen bg-black text-white p-10">
      <button
  onClick={deconnexion}
  className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-bold"
>
  Déconnexion
</button>
      <h1 className="text-5xl font-bold text-green-400 mb-8">
        Administration 🛠️
      </h1>

      <div className="bg-zinc-900 p-6 rounded-2xl space-y-4">

        <input
          className="w-full p-3 rounded bg-black border border-zinc-700"
          placeholder="Réunion"
          value={reunion}
          onChange={(e) => setReunion(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-black border border-zinc-700"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-black border border-zinc-700"
          placeholder="Hippodrome"
          value={hippodrome}
          onChange={(e) => setHippodrome(e.target.value)}
        />
<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Distance"
  value={distance}
  onChange={(e) => setDistance(e.target.value)}
/>

<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Base 1"
  value={base1}
  onChange={(e) => setBase1(e.target.value)}
/>

<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Belle chance"
  value={belle1}
  onChange={(e) => setBelle1(e.target.value)}
/>

<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Outsider"
  value={outsider1}
  onChange={(e) => setOutsider1(e.target.value)}
/>

<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Gros rapport"
  value={grosRapport}
  onChange={(e) => setGrosRapport(e.target.value)}
/>

<input
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Ticket"
  value={ticket}
  onChange={(e) => setTicket(e.target.value)}
/>

<textarea
  className="w-full p-3 rounded bg-black border border-zinc-700"
  placeholder="Analyse"
  value={analysis}
  onChange={(e) => setAnalysis(e.target.value)}
></textarea>
   <button
  onClick={sauvegarder}
  className="bg-green-500 px-6 py-3 rounded font-bold"
>
  Sauvegarder
</button>

      </div>
    </main>
  );
}