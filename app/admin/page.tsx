"use client";
import DateDuJour from "@/app/components/DateDuJour";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"predictions" | "vip" | "paiements" | "statistiques" | "membres" | "vip_pronostics" | "historique" | "analyseur">("predictions");
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
  const [historique, setHistorique] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenuTotal: 0, revenuSemaine: 0, revenuMois: 0, totalVip: 0, vipActifs: 0, vipExpires: 0 });
  const [coupleVip, setCoupleVip] = useState("");
  const [selectionVip, setSelectionVip] = useState("");
  const [arriveeVip, setArriveeVip] = useState("");

  // ANALYSEUR
  const [textesPct, setTextesPct] = useState("");
  const [textesNum, setTextesNum] = useState("");
  const [imgPct, setImgPct] = useState<string | null>(null);
  const [imgNum, setImgNum] = useState<string | null>(null);
  const [prevPct, setPrevPct] = useState<string | null>(null);
  const [prevNum, setPrevNum] = useState<string | null>(null);
  const [modePct, setModePct] = useState<"texte" | "image">("texte");
  const [modeNum, setModeNum] = useState<"texte" | "image">("texte");
  const [resultat, setResultat] = useState<{num: number; nom: string; pct: number}[]>([]);
  const [analyLoading, setAnalyLoading] = useState(false);
  const [analyError, setAnalyError] = useState("");
  const fileRefPct = useRef<HTMLInputElement>(null);
  const fileRefNum = useRef<HTMLInputElement>(null);

  useEffect(() => { verifierAdmin(); }, []);

  async function verifierAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/connexion"); return; }
    const { data: profil } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (!profil || profil.role !== "admin") { alert("Accès refusé"); router.push("/"); return; }
    await chargerPaiements(); await chargerPrediction(); await chargerMembresVip(); await chargerVipPronostics(); await chargerHistorique();
    setLoading(false);
  }

  async function chargerHistorique() {
    const { data } = await supabase.from("historique_predictions").select("*").order("created_at", { ascending: false });
    if (data) setHistorique(data);
  }
  async function chargerVipPronostics() {
    const { data } = await supabase.from("vip_pronostics").select("*").single();
    if (data) { setCoupleVip(data.couple_vip || ""); setSelectionVip(data.selection_vip || ""); setArriveeVip(data.arrivee || ""); }
  }
  async function chargerPrediction() {
    const { data } = await supabase.from("predictions").select("*").limit(1).single();
    if (data) { setReunion(data.reunion||""); setCourse(data.course||""); setHippodrome(data.hippodrome||""); setDistance(data.distance||""); setBase1(data.bases||""); setBelle1(data.belles_chances||""); setOutsider1(data.outsiders||""); setGrosRapport(data.gros_rapports||""); setTicket(data.ticket||""); setAnalysis(data.analysis||""); }
  }
  async function chargerPaiements() {
    const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (data) {
      setPaiements(data);
      const completed = data.filter((p: any) => p.status === "Completed");
      const now = new Date();
      const dS = new Date(now); dS.setDate(now.getDate()-7);
      const dM = new Date(now); dM.setDate(now.getDate()-30);
      setStats(s => ({ ...s, total: data.length, pending: data.filter((p:any)=>p.status==="Pending").length, completed: completed.length, revenuTotal: completed.reduce((a:number,p:any)=>a+(p.amount||0),0), revenuSemaine: completed.filter((p:any)=>new Date(p.created_at)>=dS).reduce((a:number,p:any)=>a+(p.amount||0),0), revenuMois: completed.filter((p:any)=>new Date(p.created_at)>=dM).reduce((a:number,p:any)=>a+(p.amount||0),0) }));
    }
  }
  async function chargerMembresVip() {
    const { data } = await supabase.from("profiles").select("*").eq("vip", true).order("date_fin_vip", { ascending: true });
    if (data) { setMembresVip(data); const now=new Date(); setStats(s=>({...s,totalVip:data.length,vipActifs:data.filter((p:any)=>new Date(p.date_fin_vip)>now).length,vipExpires:data.filter((p:any)=>new Date(p.date_fin_vip)<=now).length})); }
  }
  async function sauvegarderVip() {
    const { error } = await supabase.from("vip_pronostics").update({ couple_vip: coupleVip, selection_vip: selectionVip, arrivee: arriveeVip }).eq("id", 1);
    if (error) { alert("❌ Erreur : " + error.message); return; }
    await supabase.from("vip_pronostics_historique").insert({ couple_vip: coupleVip, selection_vip: selectionVip, arrivee: arriveeVip });
    alert("✅ Pronostics VIP sauvegardés et ajoutés à l'historique !");
  }
  async function sauvegarder() {
    const { error } = await supabase.from("predictions").update({ reunion, course, hippodrome, distance, bases: base1, belles_chances: belle1, outsiders: outsider1, gros_rapports: grosRapport, ticket, analysis }).eq("id", "a23e82ea-7ce4-4e28-ba74-22bb25a780e0");
    if (error) { alert("❌ Erreur lors de la sauvegarde"); return; }
    await supabase.from("historique_predictions").insert({ reunion, course, hippodrome, distance, bases: base1, belles_chances: belle1, outsiders: outsider1, gros_rapports: grosRapport, ticket, analysis });
    alert("✅ Sauvegarde réussie et ajoutée à l'historique !"); await chargerHistorique();
  }
  async function supprimerHistorique(id: string) {
    if (!confirm("Supprimer cet enregistrement ?")) return;
    await supabase.from("historique_predictions").delete().eq("id", id); await chargerHistorique();
  }
  async function validerPaiement(p: any) {
    await supabase.from("payments").update({ status: "Completed" }).eq("id", p.id);
    const debut=new Date(); const fin=new Date(); fin.setDate(fin.getDate()+(p.plan==="weekly"?7:30));
    await supabase.from("profiles").update({ vip: true, date_debut_vip: debut.toISOString(), date_fin_vip: fin.toISOString() }).eq("email", p.email);
    await supabase.from("notifications").insert({ user_email: p.email, message: `🎉 Votre abonnement VIP ${p.plan==="weekly"?"hebdomadaire":"mensuel"} a été activé !`, lu: false });
    alert("✅ VIP activé pour " + p.nom); chargerPaiements(); chargerMembresVip();
  }
  async function activerVip() {
    setLoadingVip(true);
    const debut=new Date(); const fin=new Date(); fin.setDate(fin.getDate()+Number(dureeVip));
    const { data, error } = await supabase.from("profiles").update({ vip: true, date_debut_vip: debut.toISOString(), date_fin_vip: fin.toISOString() }).eq("email", emailVip.trim()).select("*");
    if (error) alert("❌ Erreur"); else if (!data||data.length===0) alert("⚠️ Aucun utilisateur trouvé"); else alert("✅ VIP activé !");
    setEmailVip(""); setLoadingVip(false); chargerMembresVip();
  }
  async function desactiverVip() {
    const { data, error } = await supabase.from("profiles").update({ vip: false, date_debut_vip: null, date_fin_vip: null }).eq("email", emailVip.trim()).select("*");
    if (error) alert("❌ Erreur"); else if (!data||data.length===0) alert("⚠️ Aucun utilisateur trouvé"); else alert("✅ VIP désactivé !");
    setEmailVip(""); chargerMembresVip();
  }
  async function desactiverMembreVip(email: string) {
    if (!confirm("Désactiver le VIP de " + email + " ?")) return;
    await supabase.from("profiles").update({ vip: false, date_debut_vip: null, date_fin_vip: null }).eq("email", email);
    alert("✅ VIP désactivé"); chargerMembresVip();
  }
  function formatDate(d: string) { if (!d) return "—"; return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}); }
  function formatDateHeure(d: string) { if (!d) return "—"; return new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
  function joursRestants(d: string) { if (!d) return 0; return Math.max(0,Math.ceil((new Date(d).getTime()-new Date().getTime())/(1000*60*60*24))); }
  async function deconnexion() { await supabase.auth.signOut(); router.push("/connexion"); }

  // ====== ANALYSEUR ======
  function processFilePct(f: File) {
    const r = new FileReader();
    r.onload = (ev) => { const s = ev.target?.result as string; setImgPct(s.split(",")[1]); setPrevPct(s); };
    r.readAsDataURL(f);
  }
  function processFileNum(f: File) {
    const r = new FileReader();
    r.onload = (ev) => { const s = ev.target?.result as string; setImgNum(s.split(",")[1]); setPrevNum(s); };
    r.readAsDataURL(f);
  }

  async function extraireAvecIA(base64: string, type: "pct" | "num"): Promise<any[]> {
    const prompt = type === "pct"
      ? "Extrait tous les noms de chevaux et leurs pourcentages. Réponds UNIQUEMENT en JSON: [{\"nom\":\"NomCheval\",\"pct\":14.98},...]. Convertis virgules en points."
      : "Extrait tous les numéros et noms de chevaux de ce tableau. Réponds UNIQUEMENT en JSON: [{\"num\":1,\"nom\":\"MARILOU\"},...].";
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6", max_tokens: 1000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
          { type: "text", text: prompt }
        ]}]
      })
    });
    const d = await resp.json();
    const txt = d.content.map((i: any) => i.text || "").join("");
    return JSON.parse(txt.replace(/```json|```/g, "").trim());
  }

  function parsePct(texte: string): {nom: string; pct: number}[] {
    const re = /^(.*?)\s*[\(\[\{]?\s*(\d+[,\.]\d+)\s*%?\s*[\)\]\}]?$/;
    return texte.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.match(re);
      if (!m) return null;
      return { nom: m[1].trim().toUpperCase(), pct: parseFloat(m[2].replace(",", ".")) };
    }).filter(Boolean) as {nom: string; pct: number}[];
  }

  function parseNum(texte: string): {num: number; nom: string}[] {
    const re = /^(\d+)[.\s\-]+(.+)$/;
    return texte.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const m = l.match(re);
      if (!m) return null;
      return { num: parseInt(m[1]), nom: m[2].trim().toUpperCase() };
    }).filter(Boolean) as {num: number; nom: string}[];
  }

  function normaliser(nom: string) {
    return nom.toUpperCase().replace(/[^A-Z0-9]/g, " ").replace(/\s+/g, " ").trim();
  }

  async function analyser() {
    setAnalyError(""); setResultat([]); setAnalyLoading(true);
    try {
      let listePct: {nom: string; pct: number}[] = [];
      let listeNum: {num: number; nom: string}[] = [];

      // Champ 1 : pourcentages
      if (modePct === "texte") {
        if (!textesPct.trim()) { setAnalyError("Collez la liste des pourcentages dans le champ 1."); setAnalyLoading(false); return; }
        listePct = parsePct(textesPct);
      } else {
        if (!imgPct) { setAnalyError("Chargez une image pour le champ 1."); setAnalyLoading(false); return; }
        listePct = await extraireAvecIA(imgPct, "pct");
      }

      // Champ 2 : numéros
      if (modeNum === "texte") {
        if (!textesNum.trim()) { setAnalyError("Collez la liste des numéros dans le champ 2."); setAnalyLoading(false); return; }
        listeNum = parseNum(textesNum);
      } else {
        if (!imgNum) { setAnalyError("Chargez une image pour le champ 2."); setAnalyLoading(false); return; }
        listeNum = await extraireAvecIA(imgNum, "num");
      }

      if (!listePct.length) { setAnalyError("Aucun pourcentage trouvé dans le champ 1."); setAnalyLoading(false); return; }
      if (!listeNum.length) { setAnalyError("Aucun cheval trouvé dans le champ 2."); setAnalyLoading(false); return; }

      // Croiser les deux listes
      const croises: {num: number; nom: string; pct: number}[] = [];
      for (const chNum of listeNum) {
        const nomN = normaliser(chNum.nom);
        // Chercher dans listePct par similarité
        let meilleur = listePct.find(p => normaliser(p.nom) === nomN);
        if (!meilleur) {
          // Recherche partielle
          meilleur = listePct.find(p => normaliser(p.nom).includes(nomN) || nomN.includes(normaliser(p.nom)));
        }
        if (meilleur) croises.push({ num: chNum.num, nom: chNum.nom, pct: meilleur.pct });
      }

      if (!croises.length) { setAnalyError("Aucune correspondance trouvée entre les deux listes. Vérifiez les noms."); setAnalyLoading(false); return; }

      // Trier par pourcentage décroissant
      croises.sort((a, b) => b.pct - a.pct);
      setResultat(croises);
    } catch (e: any) {
      setAnalyError("Erreur : " + e.message);
    }
    setAnalyLoading(false);
  }

  function getBadge(i: number) {
    if (i === 0) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-900 text-green-300">🎯 Base</span>;
    if (i === 1 || i === 2) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">💙 Belle chance</span>;
    if (i === 3 || i === 4) return <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-900 text-orange-300">🔥 Outsider</span>;
    return null;
  }

  const reunions = ["R1","R2","R3","R4","R5","R6","R7"];
  const courses = ["C1","C2","C3","C4","C5","C6","C7","C8","C9","C10"];

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-4">🐎</div><p className="text-green-400 text-2xl font-bold animate-pulse">Chargement...</p></div>
    </main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-6 fixed h-full overflow-y-auto">
          <div className="mb-10"><h1 className="text-2xl font-extrabold text-green-400">🐎 PMU Admin</h1><p className="text-zinc-500 text-sm mt-1">Tableau de bord</p></div>
          <DateDuJour />
          <nav className="flex flex-col gap-2 flex-1">
            {[
              { id: "statistiques", icon: "📈", label: "Statistiques" },
              { id: "predictions", icon: "📊", label: "Pronostics" },
              { id: "historique", icon: "🕘", label: "Historique" },
              { id: "analyseur", icon: "🔍", label: "Analyseur" },
              { id: "paiements", icon: "💰", label: "Paiements" },
              { id: "membres", icon: "👑", label: "Membres VIP" },
              { id: "vip_pronostics", icon: "⭐", label: "Pronostics VIP" },
              { id: "vip", icon: "🔧", label: "Gestion VIP" },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold transition ${activeTab === tab.id ? "bg-green-600 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                <span className="text-xl">{tab.icon}</span>{tab.label}
                {tab.id === "paiements" && stats.pending > 0 && <span className="ml-auto bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{stats.pending}</span>}
                {tab.id === "membres" && stats.vipExpires > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.vipExpires}</span>}
                {tab.id === "historique" && historique.length > 0 && <span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{historique.length}</span>}
              </button>
            ))}
          </nav>
          <button onClick={deconnexion} className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/30 transition font-semibold">🚪 Déconnexion</button>
        </aside>

        <div className="ml-64 flex-1 p-10">

          {/* STATISTIQUES */}
          {activeTab === "statistiques" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-8">📈 Statistiques</h2>
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">💰 Revenus</h3>
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center"><p className="text-zinc-500 text-sm mb-2">Cette semaine</p><p className="text-3xl font-extrabold text-green-400">{stats.revenuSemaine.toLocaleString()}</p><p className="text-zinc-600 text-sm mt-1">GNF</p></div>
                <div className="bg-zinc-900 border border-blue-800 rounded-2xl p-6 text-center"><p className="text-zinc-500 text-sm mb-2">Ce mois</p><p className="text-3xl font-extrabold text-blue-400">{stats.revenuMois.toLocaleString()}</p><p className="text-zinc-600 text-sm mt-1">GNF</p></div>
                <div className="bg-zinc-900 border border-yellow-800 rounded-2xl p-6 text-center"><p className="text-zinc-500 text-sm mb-2">Total général</p><p className="text-3xl font-extrabold text-yellow-400">{stats.revenuTotal.toLocaleString()}</p><p className="text-zinc-600 text-sm mt-1">GNF</p></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">💳 Paiements</h3>
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-white">{stats.total}</p><p className="text-zinc-500 mt-1">Total</p></div>
                <div className="bg-zinc-900 border border-yellow-800 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-yellow-400">{stats.pending}</p><p className="text-zinc-500 mt-1">En attente</p></div>
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-green-400">{stats.completed}</p><p className="text-zinc-500 mt-1">Validés</p></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-wide mb-4">👑 Membres VIP</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-white">{stats.totalVip}</p><p className="text-zinc-500 mt-1">Total VIP</p></div>
                <div className="bg-zinc-900 border border-green-800 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-green-400">{stats.vipActifs}</p><p className="text-zinc-500 mt-1">Actifs</p></div>
                <div className="bg-zinc-900 border border-red-800 rounded-2xl p-6 text-center"><p className="text-4xl font-extrabold text-red-400">{stats.vipExpires}</p><p className="text-zinc-500 mt-1">Expirés</p></div>
              </div>
            </div>
          )}

          {/* PRONOSTICS */}
          {activeTab === "predictions" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">📊 Pronostics du jour</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-zinc-400 text-sm mb-1 block">Réunion</label><select className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={reunion} onChange={(e)=>setReunion(e.target.value)}><option value="">-- Choisir --</option>{reunions.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Course</label><select className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={course} onChange={(e)=>setCourse(e.target.value)}><option value="">-- Choisir --</option>{courses.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Hippodrome</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" placeholder="Ex: Enghien Soisy" value={hippodrome} onChange={(e)=>setHippodrome(e.target.value)}/></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Distance (m)</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" placeholder="Ex: 1800" value={distance} onChange={(e)=>setDistance(e.target.value)}/></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Base</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={base1} onChange={(e)=>setBase1(e.target.value)} placeholder="Ex: JAGUAR DU RIB"/></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Belle chance</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={belle1} onChange={(e)=>setBelle1(e.target.value)} placeholder="Ex: IBIS PETTEVINIERE"/></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Outsider</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={outsider1} onChange={(e)=>setOutsider1(e.target.value)} placeholder="Ex: HIRONDELLE FEE"/></div>
                  <div><label className="text-zinc-400 text-sm mb-1 block">Gros rapport</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={grosRapport} onChange={(e)=>setGrosRapport(e.target.value)} placeholder="Ex: CHEVAL SURPRISE"/></div>
                  <div className="col-span-2"><label className="text-zinc-400 text-sm mb-1 block">Ticket</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={ticket} onChange={(e)=>setTicket(e.target.value)} placeholder="Ex: 4-7-9"/></div>
                </div>
                <div><label className="text-zinc-400 text-sm mb-1 block">Analyse</label><textarea rows={5} className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition" value={analysis} onChange={(e)=>setAnalysis(e.target.value)} placeholder="Votre analyse complète..."/></div>
                <button onClick={sauvegarder} className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-bold text-lg transition">💾 Sauvegarder</button>
              </div>
            </div>
          )}

          {/* HISTORIQUE */}
          {activeTab === "historique" && (
            <div>
              <h2 className="text-3xl font-bold text-blue-400 mb-2">🕘 Historique des pronostics</h2>
              <p className="text-zinc-500 mb-6 text-sm">Tous les pronostics sauvegardés depuis le début</p>
              {historique.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-16 text-center text-zinc-500"><p className="text-4xl mb-4">📭</p><p>Aucun historique pour le moment.</p></div>
              ) : (
                <div className="space-y-4">
                  {historique.map((h) => (
                    <div key={h.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-blue-900 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">📅 {formatDateHeure(h.created_at)}</span>
                          {h.reunion && <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full">{h.reunion} • {h.course}</span>}
                          {h.hippodrome && <span className="bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1 rounded-full">🏟 {h.hippodrome} {h.distance && `• ${h.distance}m`}</span>}
                        </div>
                        <button onClick={()=>supprimerHistorique(h.id)} className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg hover:bg-red-900/30 transition">🗑 Supprimer</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {h.bases && <div className="bg-green-900/30 border border-green-800 rounded-xl p-3"><p className="text-green-400 text-xs font-bold mb-1">🎯 Base</p><p className="text-white text-sm font-semibold">{h.bases}</p></div>}
                        {h.belles_chances && <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-3"><p className="text-blue-400 text-xs font-bold mb-1">💙 Belle chance</p><p className="text-white text-sm font-semibold">{h.belles_chances}</p></div>}
                        {h.outsiders && <div className="bg-orange-900/30 border border-orange-800 rounded-xl p-3"><p className="text-orange-400 text-xs font-bold mb-1">🔥 Outsider</p><p className="text-white text-sm font-semibold">{h.outsiders}</p></div>}
                        {h.gros_rapports && <div className="bg-purple-900/30 border border-purple-800 rounded-xl p-3"><p className="text-purple-400 text-xs font-bold mb-1">💜 Gros rapport</p><p className="text-white text-sm font-semibold">{h.gros_rapports}</p></div>}
                      </div>
                      {h.ticket && <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-3 mb-4"><p className="text-yellow-400 text-xs font-bold mb-1">🎫 Ticket</p><p className="text-white font-bold tracking-wider">{h.ticket}</p></div>}
                      {h.analysis && <div className="bg-zinc-800/50 rounded-xl p-3"><p className="text-zinc-400 text-xs font-bold mb-1">📝 Analyse</p><p className="text-zinc-300 text-sm leading-relaxed">{h.analysis}</p></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ✅ ANALYSEUR AMÉLIORÉ */}
          {activeTab === "analyseur" && (
            <div>
              <h2 className="text-3xl font-bold text-purple-400 mb-2">🔍 Analyseur de chevaux</h2>
              <p className="text-zinc-500 mb-8 text-sm">Entrez les deux listes — l'analyseur croise les données et classe par pourcentage</p>

              <div className="grid grid-cols-2 gap-6 mb-6">

                {/* CHAMP 1 : POURCENTAGES */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-purple-300 mb-1">📊 Champ 1 — Pourcentages</h3>
                  <p className="text-zinc-500 text-xs mb-4">Liste boturfers.fr avec les % de chaque cheval</p>
                  <div className="flex gap-2 mb-4">
                    <button onClick={()=>setModePct("texte")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${modePct==="texte"?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-400 hover:text-white"}`}>📋 Texte</button>
                    <button onClick={()=>setModePct("image")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${modePct==="image"?"bg-purple-600 text-white":"bg-zinc-800 text-zinc-400 hover:text-white"}`}>🖼 Image</button>
                  </div>
                  {modePct === "texte" ? (
                    <textarea rows={8} className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono text-xs focus:border-purple-500 focus:outline-none transition" placeholder={"Florida Bi (11,60%)\nMarinella Vrie (14,98%)\nGoggia (8,40%)\n..."} value={textesPct} onChange={(e)=>setTextesPct(e.target.value)}/>
                  ) : (
                    <div>
                      <div className="border-2 border-dashed border-zinc-600 hover:border-purple-500 rounded-xl p-6 text-center cursor-pointer transition" onClick={()=>fileRefPct.current?.click()}>
                        {prevPct ? <img src={prevPct} className="max-h-40 mx-auto rounded-lg object-contain"/> : <><p className="text-3xl mb-2">📸</p><p className="text-zinc-400 text-sm">Cliquez pour charger</p></>}
                      </div>
                      <input ref={fileRefPct} type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)processFilePct(f);}}/>
                    </div>
                  )}
                </div>

                {/* CHAMP 2 : NUMÉROS */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-blue-300 mb-1">🏇 Champ 2 — Numéros de course</h3>
                  <p className="text-zinc-500 text-xs mb-4">Liste des chevaux avec leur numéro dans la course</p>
                  <div className="flex gap-2 mb-4">
                    <button onClick={()=>setModeNum("texte")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${modeNum==="texte"?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:text-white"}`}>📋 Texte</button>
                    <button onClick={()=>setModeNum("image")} className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${modeNum==="image"?"bg-blue-600 text-white":"bg-zinc-800 text-zinc-400 hover:text-white"}`}>🖼 Image</button>
                  </div>
                  {modeNum === "texte" ? (
                    <textarea rows={8} className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono text-xs focus:border-blue-500 focus:outline-none transition" placeholder={"1 MARILOU\n2 PANERAI\n3 FLORIDA BI\n4 LA FORMIDABLE\n..."} value={textesNum} onChange={(e)=>setTextesNum(e.target.value)}/>
                  ) : (
                    <div>
                      <div className="border-2 border-dashed border-zinc-600 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition" onClick={()=>fileRefNum.current?.click()}>
                        {prevNum ? <img src={prevNum} className="max-h-40 mx-auto rounded-lg object-contain"/> : <><p className="text-3xl mb-2">📸</p><p className="text-zinc-400 text-sm">Cliquez pour charger</p></>}
                      </div>
                      <input ref={fileRefNum} type="file" accept="image/*" className="hidden" onChange={(e)=>{const f=e.target.files?.[0];if(f)processFileNum(f);}}/>
                    </div>
                  )}
                </div>
              </div>

              {analyError && <p className="text-red-400 text-sm mb-4 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3">{analyError}</p>}

              <button onClick={analyser} disabled={analyLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-4 rounded-xl font-bold text-lg transition mb-8">
                {analyLoading ? "⏳ Analyse en cours..." : "🔍 Analyser et classer"}
              </button>

              {/* RÉSULTATS */}
              {resultat.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{resultat.length} chevaux classés par % décroissant</h3>
                    <span className="text-zinc-500 text-sm">N° de course • Nom • Pourcentage</span>
                  </div>
                  <div className="space-y-3">
                    {resultat.map((c, i) => {
                      const max = resultat[0].pct;
                      const barW = Math.round((c.pct / max) * 100);
                      const rankColor = i===0?"bg-yellow-500 text-yellow-900":i===1?"bg-zinc-400 text-zinc-900":i===2?"bg-orange-700 text-orange-100":"bg-zinc-700 text-zinc-300";
                      return (
                        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${rankColor}`}>{i+1}</div>
                          <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center font-extrabold text-white text-lg flex-shrink-0">
                            {c.num}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-white">{c.nom}</span>
                              {getBadge(i)}
                            </div>
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{width:`${barW}%`}}/>
                            </div>
                          </div>
                          <span className="text-purple-300 font-bold text-base flex-shrink-0 w-14 text-right">{c.pct.toFixed(2)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAIEMENTS */}
          {activeTab === "paiements" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">💰 Paiements reçus</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-green-400 uppercase text-xs"><tr><th className="px-5 py-4 text-left">Nom</th><th className="px-5 py-4 text-left">Email</th><th className="px-5 py-4 text-left">Plan</th><th className="px-5 py-4 text-left">Référence</th><th className="px-5 py-4 text-left">Montant</th><th className="px-5 py-4 text-left">Statut</th><th className="px-5 py-4 text-left">Action</th></tr></thead>
                  <tbody>
                    {paiements.map((p,i)=>(
                      <tr key={p.id} className={i%2===0?"bg-zinc-900":"bg-zinc-800/50"}>
                        <td className="px-5 py-4 font-semibold">{p.nom}</td>
                        <td className="px-5 py-4 text-zinc-400 text-xs">{p.email}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.plan==="weekly"?"bg-blue-900 text-blue-300":"bg-purple-900 text-purple-300"}`}>{p.plan==="weekly"?"Hebdo":"Mensuel"}</span></td>
                        <td className="px-5 py-4 text-zinc-400 font-mono text-xs">{p.transaction_ref}</td>
                        <td className="px-5 py-4 text-yellow-400 font-bold">{p.amount?.toLocaleString()} GNF</td>
                        <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status==="Completed"?"bg-green-900 text-green-300":"bg-yellow-900 text-yellow-300"}`}>{p.status==="Completed"?"✅ Validé":"⏳ En attente"}</span></td>
                        <td className="px-5 py-4">{p.status==="Pending"&&<button onClick={()=>validerPaiement(p)} className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg text-sm font-bold transition">Valider</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {paiements.length===0&&<div className="text-center text-zinc-500 py-16">Aucun paiement reçu</div>}
              </div>
            </div>
          )}

          {/* MEMBRES VIP */}
          {activeTab === "membres" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">👑 Membres VIP</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-800 text-green-400 uppercase text-xs"><tr><th className="px-5 py-4 text-left">Email</th><th className="px-5 py-4 text-left">Début</th><th className="px-5 py-4 text-left">Fin</th><th className="px-5 py-4 text-left">Jours restants</th><th className="px-5 py-4 text-left">Statut</th><th className="px-5 py-4 text-left">Action</th></tr></thead>
                  <tbody>
                    {membresVip.map((m,i)=>{
                      const jours=joursRestants(m.date_fin_vip); const actif=jours>0;
                      return(<tr key={m.id} className={i%2===0?"bg-zinc-900":"bg-zinc-800/50"}>
                        <td className="px-5 py-4 font-semibold">{m.email}</td>
                        <td className="px-5 py-4 text-zinc-400">{formatDate(m.date_debut_vip)}</td>
                        <td className="px-5 py-4 text-zinc-400">{formatDate(m.date_fin_vip)}</td>
                        <td className="px-5 py-4"><span className={`font-bold ${jours<=0?"text-red-400":jours<=3?"text-orange-400":"text-green-400"}`}>{jours<=0?"Expiré":`${jours} jour${jours>1?"s":""}`}</span></td>
                        <td className="px-5 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${actif?"bg-green-900 text-green-300":"bg-red-900 text-red-300"}`}>{actif?"✅ Actif":"❌ Expiré"}</span></td>
                        <td className="px-5 py-4"><button onClick={()=>desactiverMembreVip(m.email)} className="bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-xs font-bold transition">Désactiver</button></td>
                      </tr>);
                    })}
                  </tbody>
                </table>
                {membresVip.length===0&&<div className="text-center text-zinc-500 py-16">Aucun membre VIP</div>}
              </div>
            </div>
          )}

          {/* PRONOSTICS VIP */}
          {activeTab === "vip_pronostics" && (
            <div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">👑 Pronostics VIP du jour</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 max-w-xl">
                <div><label className="text-zinc-400 text-sm mb-1 block">💛 Couplé VIP</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition" placeholder="Ex: 3-7" value={coupleVip} onChange={(e)=>setCoupleVip(e.target.value)}/></div>
                <div><label className="text-zinc-400 text-sm mb-1 block">🎯 Sélection Tiercé Quarté Quinté (6)</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition" placeholder="Ex: 3-7-12-1-13-11" value={selectionVip} onChange={(e)=>setSelectionVip(e.target.value)}/></div>
                <div><label className="text-zinc-400 text-sm mb-1 block">🏆 Arrivée</label><input className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-yellow-500 focus:outline-none transition" placeholder="Ex: 3-7-12-1-13" value={arriveeVip} onChange={(e)=>setArriveeVip(e.target.value)}/></div>
                <button onClick={sauvegarderVip} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold text-lg transition">💾 Sauvegarder les pronostics VIP</button>
              </div>
            </div>
          )}

          {/* GESTION VIP */}
          {activeTab === "vip" && (
            <div>
              <h2 className="text-3xl font-bold text-green-400 mb-6">🔧 Gestion VIP</h2>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6 max-w-lg">
                <div><label className="text-zinc-400 text-sm mb-1 block">Email utilisateur</label><input type="email" placeholder="user@email.com" value={emailVip} onChange={(e)=>setEmailVip(e.target.value)} className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none transition"/></div>
                <div><label className="text-zinc-400 text-sm mb-1 block">Durée VIP</label><select value={dureeVip} onChange={(e)=>setDureeVip(Number(e.target.value))} className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white"><option value={7}>7 jours</option><option value={30}>30 jours</option><option value={90}>90 jours</option><option value={365}>365 jours</option></select></div>
                <div className="flex gap-4">
                  <button onClick={activerVip} disabled={loadingVip} className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold transition">⭐ Activer VIP</button>
                  <button onClick={desactiverVip} className="flex-1 bg-red-700 hover:bg-red-800 py-3 rounded-xl font-bold transition">🚫 Désactiver</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
