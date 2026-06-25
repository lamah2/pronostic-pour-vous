"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    chargerNotifications();
  }, []);

  async function chargerNotifications() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_email", session.user.email)
      .eq("lu", false)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      setNotifications(data);
      setVisible(true);
    }
  }

  async function marquerCommeLu(id: string) {
    await supabase.from("notifications").update({ lu: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notifications.length <= 1) setVisible(false);
  }

  async function marquerTousCommeLus() {
    const ids = notifications.map((n) => n.id);
    await supabase.from("notifications").update({ lu: true }).in("id", ids);
    setNotifications([]);
    setVisible(false);
  }

  if (!visible || notifications.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-zinc-900 border border-green-600 rounded-2xl p-5 shadow-2xl shadow-green-900/30"
        >
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-green-400 font-bold text-sm mb-1">
                  Notification VIP
                </p>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {n.message}
                </p>
                <p className="text-zinc-600 text-xs mt-2">
                  {new Date(n.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => marquerCommeLu(n.id)}
              className="text-zinc-500 hover:text-white transition text-lg shrink-0"
            >
              ✕
            </button>
          </div>

          <button
            onClick={() => marquerCommeLu(n.id)}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 py-2 rounded-xl text-sm font-bold transition"
          >
            ✅ Accéder au VIP
          </button>
        </div>
      ))}

      {notifications.length > 1 && (
        <button
          onClick={marquerTousCommeLus}
          className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-xl text-sm text-zinc-400 transition"
        >
          Tout marquer comme lu
        </button>
      )}
    </div>
  );
}