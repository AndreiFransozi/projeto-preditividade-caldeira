"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUS_LABEL = {
  normal: "Normal",
  atencao: "Atenção",
  alarme: "Alarme",
  desligada: "Desligada",
};

export default function BoilerGrid({ boilers, initialReadings }) {
  // initialReadings: { [boiler_id]: ultima leitura }
  const [readings, setReadings] = useState(initialReadings);

  // Atualiza em tempo real quando chegar uma nova leitura (Supabase Realtime)
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("readings-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "readings" },
        (payload) => {
          setReadings((prev) => ({
            ...prev,
            [payload.new.boiler_id]: payload.new,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (boilers.length === 0) {
    return (
      <p className="empty">
        Nenhuma caldeira cadastrada. Insira uma na tabela <b>boilers</b> do
        Supabase.
      </p>
    );
  }

  return (
    <div className="grid">
      {boilers.map((b) => {
        const r = readings[b.id];
        const status = r?.status ?? "desligada";

        return (
          <div className="card" key={b.id}>
            <h2>{b.name}</h2>
            <div className="sub">
              {b.location || "Sem local"} · {b.model || "Sem modelo"}
            </div>

            <div className="metrics">
              <div className="metric">
                <div className="value">{r ? r.pressure : "--"}</div>
                <div className="label">Pressão (kgf/cm²)</div>
              </div>
              <div className="metric">
                <div className="value">{r ? r.temperature : "--"}</div>
                <div className="label">Temp. (°C)</div>
              </div>
              <div className="metric">
                <div className="value">{r ? r.water_level : "--"}</div>
                <div className="label">Nível (%)</div>
              </div>
            </div>

            <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>
            {r && (
              <div className="sub" style={{ marginTop: 8 }}>
                Atualizado em {new Date(r.created_at).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
