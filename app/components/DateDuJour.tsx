"use client";

import { useEffect, useState } from "react";

export default function DateDuJour() {
  const [date, setDate] = useState("");

  useEffect(() => {
    const maintenant = new Date();
    const dateFormatee = maintenant.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    setDate(dateFormatee.charAt(0).toUpperCase() + dateFormatee.slice(1));
  }, []);

  return (
    <span className="bg-zinc-800 border border-zinc-700 text-green-400 text-sm font-semibold px-4 py-2 rounded-xl">
      📅 {date}
    </span>
  );
}