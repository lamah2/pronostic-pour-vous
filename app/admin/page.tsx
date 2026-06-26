"use client";
import DateDuJour from "@/app/components/DateDuJour";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"predictions" | "vip" | "paiements" | "statistiques" | "membres" | "vip_pronostics">("predictions");
  const [reunion, setReunion] = useState("");
  const [course, setCourse] = useState("");
  const [hippodrome, setHippodrome] = useState("");
  const [distance, setDistance] = useState("");
  const [base1, setBase1] = useState("");
  const [belle1, setBelle1] = useState("");
  const [outsider1, setOutsider1] = useState("");
  const [grosRapport, setGrosRapport] = useState("");
  const [ticket, setTicket] = useState("");
  const [analysis, setAnalysis] = useState("");

  const [emailVip, setEmailVip] = useState("");
  const [dureeVip, setDureeVip] = useState(30);
  const [loadingVip, setLoadingVip] = useState(false);

  const [paiements, setPaiements] = useState<any[]>([]);
  const [membresVip, setMembresVip] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenuTotal: 0,
    revenuSemaine: 0,
    revenuMois: 0,
    totalVip: 0,
    vipActifs: 0,
    vipExpires: 0,
  });
const [coupleVip, setCoupleVip] = useState("");
const [selectionVip, setSelectionVip] = useState("");
const [arriveeVip, setArriveeVip] = useState("");
  useEffect(() => { verifierAdmin(); }, []);

  async function verifierAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/connexion"); return; }

    const { data: profil } = await supabase
      .from("profiles").select("role").eq("id", session.user.id).single();

    if (!profil || profil.role !== "admin") {
      alert("Accès refusé");
      router.push("/");
      return;
    }

    await chargerPaiements();
    await chargerPrediction();
    await chargerMembresVip();
    await chargerVipPronostics();
    setLoading(false);
  }
async function chargerVipPronostics() {
  const { data } = await supabase
    .from("vip_pronostics")
    .select("*")
    .single();

  if (data) {
    setCoupleVip(data.couple_vip || "");
    setSelectionVip(data.selection_vip || "");
    setArriveeVip(data.arrivee || "");
  }
}
  async function chargerPrediction() {
    const { data } = await supabase.from("predictions").select("*").limit(1).single();
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

  async function chargerPaiements() {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setPaiements(data);

      const completed = data.filter((p: any) => p.status === "Completed");
      const now = new Date();
      const debutSemaine = new Date(now);
      debutSemaine.setDate(now.getDate() - 7);
      const debutMois = new Date(now);
      debutMois.setDate(now.getDate() - 30);

      setStats(s => ({
        ...s,
        total: data.length,
        pending: data.filter((p: any) => p.status === "Pending").length,
        completed: completed.length,
        revenuTotal: completed.reduce((acc: number, p: any) => acc + (p.amount || 0), 0),
        revenuSemaine: completed
          .filter((p: any) => new Date(p.created_at) >= debutSemaine)
          .reduce((acc: number, p: any) => acc + (p.amount || 0), 0),
        revenuMois: completed
          .filter((p: any) => new Date(p.created_at) >= debutMois)
          .reduce((acc: number, p: any) => acc + (p.amount || 0), 0),
      }));
    }
  }

  async function chargerMembresVip() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("vip", true)
      .order("date_fin_vip", { ascending: true });

    if (data) {
      setMembresVip(data);
      const now = new Date();
      setStats(s => ({
        ...s,
        totalVip: data.length,
        vipActifs: data.filter((p: any) => new Date(p.date_fin_vip) > now).length,
        vipExpires: data.filter((p: any) => new Date(p.date_fin_vip) <= now).length,
      }));
    }
  }
async function sauvegarderVip() {
  const { error } = await supabase
    .from("vip_pronostics")
    .update({
      couple_vip: coupleVip,
      selection_vip: selectionVip,
      arrivee: arriveeVip,
    })
    .eq("id", 1);

  if (error) {
    alert("❌ Erreur : " + error.message);
  } else {
    alert("✅ Pronostics VIP sauvegardés !");
  }


  alert("✅ Pronostics VIP sauvegardés !");
}
  async function sauvegarder() {
    const { error } = await supabase.from("predictions").update({
      reunion, course, hippodrome, distance,
      bases: base1, belles_chances: belle1, outsiders: outsider1,
      gros_rapports: grosRapport, ticket, analysis,
    }).eq("id", "a23e82ea-7ce4-4e28-ba74-22bb25a780e0");
    if (error) alert("❌ Erreur");
    else alert("✅ Sauvegarde réussie !");
  }

 async function validerPaiement(p: any) {
  await supabase.from("payments").update({ status: "Completed" }).eq("id", p.id);
  
  const debut = new Date();
  const fin = new Date();
  fin.setDate(fin.getDate() + (p.plan === "weekly" ? 7 : 30));
  
  await supabase.from("profiles").update({
    vip: true,
    date_debut_vip: debut.toISOString(),
    date_fin_vip: fin.toISOString(),
  }).eq("email", p.email);

  // ✅ Notification pour l'utilisateur
  await supabase.from("notifications").insert({
    user_email: p.email,
    message: `🎉 Votre abonnement VIP ${p.plan === "weekly" ? "hebdomadaire" : "mensuel"} a été activé ! Vous avez accès à tous les pronostics exclusifs.`,
    lu: false,
  });

  alert("✅ VIP activé pour " + p.nom);
  chargerPaiements();
  chargerMembresVip();
}

  async function activerVip() {
    setLoadingVip(true);
    const debut = new Date();
    const fin = new Date();
    fin.setDate(fin.getDate() + Number(dureeVip));
    const { data, error } = await supabase.from("profiles").update({
      vip: true, date_debut_vip: debut.toISOString(), date_fin_vip: fin.toISOString(),
    }).eq("email", emailVip.trim()).select("*");
    if (error) alert("❌ Erreur");
    else if (!data || data.length === 0) alert("⚠️ Aucun utilisateur trouvé");
    else alert("✅ VIP activé !");
    setEmailVip("");
    setLoadingVip(false);
    chargerMembresVip();
  }

  async function desactiverVip() {
    const { data, error } = await supabase.from("profiles").update({
      vip: false, date_debut_vip: null, date_fin_vip: null,
    }).eq("email", emailVip.trim()).select("*");
    if (error) alert("❌ Erreur");
    else if (!data || data.length === 0) alert("⚠️ Aucun utilisateur trouvé");
    else alert("✅ VIP désactivé !");
    setEmailVip("");
    chargerMembresVip();
  }

  async function desactiverMembreVip(email: string) {
    if (!confirm("Désactiver le VIP de " + email + " ?")) return;
    await supabase.from("profiles").update({
      vip: false, date_debut_vip: null, date_fin_vip: null,
    }).eq("email", email);
    alert("✅ VIP désactivé");
    chargerMembresVip();
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "short", year: "numeric"
    });
  }

  function joursRestants(dateStr: string) {
    if (!dateStr) return 0;
    const fin = new Date(dateStr);
    const now = new Date();
    return Math.max(0, Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }
const hippodromes = [
  { nom: "Vincennes", distance: "2700" },
  { nom: "Longchamp", distance: "2400" },
  { nom: "Chantilly", distance: "1600" },
  { nom: "Auteuil", distance: "3200" },
  { nom: "Saint-Cloud", distance: "2000" },
  { nom: "Deauville", distance: "1800" },
  { nom: "Compiègne", distance: "1600" },
  { nom: "Lyon-Parilly", distance: "1700" },
  { nom: "Marseille-Borély", distance: "1600" },
  { nom: "Cagnes-sur-Mer", distance: "1600" },
];

const reunions = ["R1", "R2", "R3", "R4", "R5", "R6", "R7"];
const courses = ["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10"];
  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🐎</div>
        <p className="text-green-400 text-2xl font-bold animate-pulse">Chargement...</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6 fixed h-full">
          <div className="mb-10">
            <h1 className="text-2xl font-extrabold text-green-400">🐎 PMU Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">Tableau de bord</p>
          </div>
           <DateDuJour />
          <nav className="flex flex-col gap-2 flex-1">
            {[
              { id: "statistiques", icon: "📈", label: "Statistiques" },
              { id: "predictions", icon: "📊", label: "Pronostics" },
              { id: "paiements", icon: "💰", label: "Paiements" },
              { id: "membres", icon: "👑", label: "Membres VIP" 
              },
              { id: "vip_pronostics", icon: "👑", label: "Pronostics VIP" },
              { id: "vip", icon: "⭐", label: "Gestion VIP" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
                {tab.id === "paiements" && stats.pending > 0 && (
                  <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.pending}
                  </span>
                )}
                {tab.id === "membres" && stats.vipExpires > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {stats.vipExpires}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={deconnexion}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 transition font-semibold"
          >
            🚪 Déconnexion
          </button>
        </aside>

        {/* CONTENU */}
        <div className="ml-64 flex-1 p-10">

          {/* ONGLET STATISTIQUES */}
          {activeTab === "statistiques" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-8">📈 Statistiques</h2>

              {/* REVENUS */}
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">💰 Revenus</h3>
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center">
                  <p className="text-zinc-500 text-sm mb-2">Cette semaine</p>
                  <p className="text-3xl font-extrabold text-green-400">
                    {stats.revenuSemaine.toLocaleString()}
                  </p>
                  <p className="text-zinc-600 text-sm mt-1">GNF</p>
                </div>
                <div className="bg-zinc-900 border border-blue-800 rounded-2xl p-6 text-center">
                  <p className="text-zinc-500 text-sm mb-2">Ce mois</p>
                  <p className="text-3xl font-extrabold text-blue-400">
                    {stats.revenuMois.toLocaleString()}
                  </p>
                  <p className="text-zinc-600 text-sm mt-1">GNF</p>
                </div>
                <div className="bg-zinc-900 border border-yellow-800 rounded-2xl p-6 text-center">
                  <p className="text-zinc-500 text-sm mb-2">Total général</p>
                  <p className="text-3xl font-extrabold text-yellow-400">
                    {stats.revenuTotal.toLocaleString()}
                  </p>
                  <p className="text-zinc-600 text-sm mt-1">GNF</p>
                </div>
              </div>

              {/* PAIEMENTS */}
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">💳 Paiements</h3>
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-white">{stats.total}</p>
                  <p className="text-zinc-500 mt-1">Total</p>
                </div>
                <div className="bg-zinc-900 border border-yellow-800 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-yellow-400">{stats.pending}</p>
                  <p className="text-zinc-500 mt-1">En attente</p>
                </div>
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-green-400">{stats.completed}</p>
                  <p className="text-zinc-500 mt-1">Validés</p>
                </div>
              </div>

              {/* MEMBRES VIP */}
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">👑 Membres VIP</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-white">{stats.totalVip}</p>
                  <p className="text-zinc-500 mt-1">Total VIP</p>
                </div>
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-green-400">{stats.vipActifs}</p>
                  <p className="text-zinc-500 mt-1">Actifs</p>
                </div>
                <div className="bg-zinc-900 border border-red-800 rounded-2xl p-6 text-center">
                  <p className="text-4xl font-extrabold text-red-400">{stats.vipExpires}</p>
                  <p className="text-zinc-500 mt-1">Expirés</p>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET PRONOSTICS */}
          {activeTab === "predictions" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">📊 Pronostics du jour</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">

  {/* RÉUNION */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Réunion</label>
    <select
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={reunion}
      onChange={(e) => setReunion(e.target.value)}
    >
      <option value="">-- Choisir --</option>
      {reunions.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  </div>

  {/* COURSE */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Course</label>
    <select
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={course}
      onChange={(e) => setCourse(e.target.value)}
    >
      <option value="">-- Choisir --</option>
      {courses.map((c) => (
        <option key={c} value={c}>{c}</option>
      ))}
    </select>
  </div>

 {/* HIPPODROME */}
<div>
  <label className="text-zinc-400 text-sm mb-1 block">Hippodrome</label>
  <input
    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
    placeholder="Ex: Enghien Soisy"
    value={hippodrome}
    onChange={(e) => setHippodrome(e.target.value)}
  />
</div>

{/* DISTANCE */}
<div>
  <label className="text-zinc-400 text-sm mb-1 block">Distance (m)</label>
  <input
    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
    placeholder="Ex: 1800"
    value={distance}
    onChange={(e) => setDistance(e.target.value)}
  />
</div>

  {/* BASE */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Base</label>
    <input
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={base1}
      onChange={(e) => setBase1(e.target.value)}
      placeholder="Ex: JAGUAR DU RIB"
    />
  </div>

  {/* BELLE CHANCE */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Belle chance</label>
    <input
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={belle1}
      onChange={(e) => setBelle1(e.target.value)}
      placeholder="Ex: IBIS PETTEVINIERE"
    />
  </div>

  {/* OUTSIDER */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Outsider</label>
    <input
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={outsider1}
      onChange={(e) => setOutsider1(e.target.value)}
      placeholder="Ex: HIRONDELLE FEE"
    />
  </div>

  {/* GROS RAPPORT */}
  <div>
    <label className="text-zinc-400 text-sm mb-1 block">Gros rapport</label>
    <input
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={grosRapport}
      onChange={(e) => setGrosRapport(e.target.value)}
      placeholder="Ex: CHEVAL SURPRISE"
    />
  </div>

  {/* TICKET */}
  <div className="col-span-2">
    <label className="text-zinc-400 text-sm mb-1 block">Ticket</label>
    <input
      className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
      value={ticket}
      onChange={(e) => setTicket(e.target.value)}
      placeholder="Ex: 4-7-9"
    />
  </div>

</div>

{/* ANALYSE */}
<div>
  <label className="text-zinc-400 text-sm mb-1 block">Analyse</label>
  <textarea
    rows={5}
    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
    value={analysis}
    onChange={(e) => setAnalysis(e.target.value)}
    placeholder="Votre analyse complète..."
  />
</div>

<button
  onClick={sauvegarder}
  className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-lg transition"
>
  💾 Sauvegarder
</button>
            </div>
          </div>
        )}

          {/* ONGLET PAIEMENTS */}
          {activeTab === "paiements" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">💰 Paiements reçus</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-green-400 uppercase text-xs">
                    <tr>
                      <th className="px-5 py-4 text-left">Nom</th>
                      <th className="px-5 py-4 text-left">Email</th>
                      <th className="px-5 py-4 text-left">Plan</th>
                      <th className="px-5 py-4 text-left">Référence</th>
                      <th className="px-5 py-4 text-left">Montant</th>
                      <th className="px-5 py-4 text-left">Statut</th>
                      <th className="px-5 py-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                        <td className="px-5 py-4 font-semibold">{p.nom}</td>
                        <td className="px-5 py-4 text-zinc-400 text-xs">{p.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            p.plan === "weekly" ? "bg-blue-900 text-blue-300" : "bg-purple-900 text-purple-300"
                          }`}>
                            {p.plan === "weekly" ? "Hebdo" : "Mensuel"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-zinc-400 font-mono text-xs">{p.transaction_ref}</td>
                        <td className="px-5 py-4 text-yellow-400 font-bold">{p.amount?.toLocaleString()} GNF</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            p.status === "Completed"
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}>
                            {p.status === "Completed" ? "✅ Validé" : "⏳ En attente"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {p.status === "Pending" && (
                            <button
                              onClick={() => validerPaiement(p)}
                              className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm font-bold transition"
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
                  <div className="text-center text-zinc-500 py-16">Aucun paiement reçu</div>
                )}
              </div>
            </div>
          )}

          {/* ONGLET MEMBRES VIP */}
          {activeTab === "membres" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">👑 Membres VIP</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-green-400 uppercase text-xs">
                    <tr>
                      <th className="px-5 py-4 text-left">Email</th>
                      <th className="px-5 py-4 text-left">Début</th>
                      <th className="px-5 py-4 text-left">Fin</th>
                      <th className="px-5 py-4 text-left">Jours restants</th>
                      <th className="px-5 py-4 text-left">Statut</th>
                      <th className="px-5 py-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membresVip.map((m, i) => {
                      const jours = joursRestants(m.date_fin_vip);
                      const actif = jours > 0;
                      return (
                        <tr key={m.id} className={i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"}>
                          <td className="px-5 py-4 font-semibold">{m.email}</td>
                          <td className="px-5 py-4 text-zinc-400">{formatDate(m.date_debut_vip)}</td>
                          <td className="px-5 py-4 text-zinc-400">{formatDate(m.date_fin_vip)}</td>
                          <td className="px-5 py-4">
                            <span className={`font-bold ${
                              jours <= 0 ? "text-red-400"
                              : jours <= 3 ? "text-orange-400"
                              : "text-green-400"
                            }`}>
                              {jours <= 0 ? "Expiré" : `${jours} jour${jours > 1 ? "s" : ""}`}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              actif ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"
                            }`}>
                              {actif ? "✅ Actif" : "❌ Expiré"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => desactiverMembreVip(m.email)}
                              className="bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                              Désactiver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {membresVip.length === 0 && (
                  <div className="text-center text-zinc-500 py-16">Aucun membre VIP</div>
                )}
              </div>
            </div>
          )}
{/* ONGLET PRONOSTICS VIP */}
{activeTab === "vip_pronostics" && (
  <div>
    <h2 className="text-3xl font-bold text-yellow-400 mb-6">
      👑 Pronostics VIP du jour
    </h2>

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 max-w-xl">

      <div>
        <label className="text-zinc-400 text-sm mb-1 block">
          💛 Couplé VIP
        </label>
        <input
          className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
          placeholder="Ex: 3-7"
          value={coupleVip}
          onChange={(e) => setCoupleVip(e.target.value)}
        />
      </div>

      <div>
        <label className="text-zinc-400 text-sm mb-1 block">
          🎯 Sélection Tiercé Quarté Quinté (6)
        </label>
        <input
          className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
          placeholder="Ex: 3-7-12-1-13-11"
          value={selectionVip}
          onChange={(e) => setSelectionVip(e.target.value)}
        />
      </div>

      <div>
        <label className="text-zinc-400 text-sm mb-1 block">
          🏆 Arrivée
        </label>
        <input
          className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition"
          placeholder="Ex: 3-7-12-1-13"
          value={arriveeVip}
          onChange={(e) => setArriveeVip(e.target.value)}
        />
      </div>

      <button
        onClick={sauvegarderVip}
        className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-lg transition"
      >
        💾 Sauvegarder les pronostics VIP
      </button>
    </div>
  </div>
)}
          {/* ONGLET GESTION VIP */}
          {activeTab === "vip" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">⭐ Gestion VIP</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 max-w-lg">
                <div>
                  <label className="text-zinc-400 text-sm mb-1 block">Email utilisateur</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    value={emailVip}
                    onChange={(e) => setEmailVip(e.target.value)}
                    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-sm mb-1 block">Durée VIP</label>
                  <select
                    value={dureeVip}
                    onChange={(e) => setDureeVip(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white"
                  >
                    <option value={7}>7 jours</option>
                    <option value={30}>30 jours</option>
                    <option value={90}>90 jours</option>
                    <option value={365}>365 jours</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={activerVip}
                    disabled={loadingVip}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition"
                  >
                    ⭐ Activer VIP
                  </button>
                  <button
                    onClick={desactiverVip}
                    className="flex-1 bg-red-700 hover:bg-red-800 py-3 rounded-xl font-bold transition"
                  >
                    🚫 Désactiver
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}