"use client";

import { useCallback, useEffect, useState } from "react";
import ClasseConservacaoBadge from "@/components/caldeira/ClasseConservacaoBadge";
import LegendaClassesConservacao from "@/components/caldeira/LegendaClassesConservacao";
import RegiaoDrawer from "@/components/caldeira/RegiaoDrawer";
import {
  getMinhasCaldeiras,
  getRegioesRankeadas,
  type CaldeiraResumo,
  type RegiaoCaldeira,
} from "@/lib/caldeira-dados";

const colunas = [
  { id: "item", titulo: "Item", fixa: true },
  { id: "nome", titulo: "Minhas Caldeiras", fixa: true },
  { id: "pmta", titulo: "PMTA (bar)", fixa: false },
  {
    id: "inspecao",
    titulo: "Próxima Inspeção (NR-13)",
    fixa: false,
  },
  {
    id: "vida",
    titulo: "Expectativa de Vida Calculada (anos)",
    fixa: false,
  },
  {
    id: "classe",
    titulo: "Classe de Conservação da Caldeira",
    fixa: false,
  },
  {
    id: "regiao",
    titulo: "Região Mais Comprometida",
    fixa: false,
  },
] as const;

type ColunaId = (typeof colunas)[number]["id"];

interface PreferenciasColunas {
  ordem: ColunaId[];
  visiveis: ColunaId[];
}

const chavePreferencias = "safelife:minhas-caldeiras:colunas:v1";
const ordemInicial = colunas.map((coluna) => coluna.id);
const preferenciasIniciais: PreferenciasColunas = {
  ordem: [...ordemInicial],
  visiveis: [...ordemInicial],
};

function normalizarPreferencias(valor: unknown): PreferenciasColunas {
  if (!valor || typeof valor !== "object") return preferenciasIniciais;
  const preferenciaSalva = valor as {
    ordem?: unknown;
    visiveis?: unknown;
  };
  const ids = new Set<string>(ordemInicial);
  const ordemSalva = Array.isArray(preferenciaSalva.ordem)
    ? preferenciaSalva.ordem.filter(
        (id): id is ColunaId => typeof id === "string" && ids.has(id)
      )
    : [];
  const ordemSemDuplicatas = [...new Set(ordemSalva)];
  const ordem = [
    ...ordemSemDuplicatas,
    ...ordemInicial.filter((id) => !ordemSemDuplicatas.includes(id)),
  ];
  const visiveisSalvas = Array.isArray(preferenciaSalva.visiveis)
    ? preferenciaSalva.visiveis.filter(
        (id): id is ColunaId => typeof id === "string" && ids.has(id)
      )
    : [...ordemInicial];
  const visiveis = [...new Set(visiveisSalvas)];

  for (const coluna of colunas) {
    if (coluna.fixa && !visiveis.includes(coluna.id)) {
      visiveis.push(coluna.id);
    }
  }

  return { ordem, visiveis };
}

function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(valor);
}

function formatarData(valor: string): string {
  const data = new Date(`${valor}T00:00:00.000Z`);
  if (!Number.isFinite(data.getTime())) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(data);
}

function CelulaCaldeira({
  coluna,
  caldeira,
  indice,
  regiao,
  onSelecionarRegiao,
}: {
  coluna: ColunaId;
  caldeira: CaldeiraResumo;
  indice: number;
  regiao?: RegiaoCaldeira;
  onSelecionarRegiao: (regiao: RegiaoCaldeira) => void;
}) {
  switch (coluna) {
    case "item":
      return <>{indice + 1}</>;
    case "nome":
      return <span className="font-semibold text-white">{caldeira.nome}</span>;
    case "pmta":
      return formatarNumero(caldeira.pmtaBar);
    case "inspecao":
      return formatarData(caldeira.proximaInspecao);
    case "vida":
      return formatarNumero(caldeira.expectativaVidaAnos);
    case "classe":
      return <ClasseConservacaoBadge classe={caldeira.classe} />;
    case "regiao":
      return regiao ? (
        <button
          type="button"
          onClick={() => onSelecionarRegiao(regiao)}
          className="text-left font-medium text-sky-300 underline decoration-sky-700 underline-offset-4 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {regiao.nome}
        </button>
      ) : (
        "Não informada"
      );
  }
}

export default function MinhasCaldeiras() {
  const caldeiras = getMinhasCaldeiras();
  const [preferencias, setPreferencias] =
    useState<PreferenciasColunas>(preferenciasIniciais);
  const [preferenciasCarregadas, setPreferenciasCarregadas] = useState(false);
  const [regiaoSelecionada, setRegiaoSelecionada] =
    useState<RegiaoCaldeira | null>(null);

  useEffect(() => {
    try {
      const salva = window.localStorage.getItem(chavePreferencias);
      if (salva) setPreferencias(normalizarPreferencias(JSON.parse(salva)));
    } catch (erro) {
      console.error("Não foi possível carregar as colunas salvas.", erro);
    } finally {
      setPreferenciasCarregadas(true);
    }
  }, []);

  useEffect(() => {
    if (!preferenciasCarregadas) return;
    try {
      window.localStorage.setItem(
        chavePreferencias,
        JSON.stringify(preferencias)
      );
    } catch (erro) {
      console.error("Não foi possível salvar as preferências de colunas.", erro);
    }
  }, [preferencias, preferenciasCarregadas]);

  const fecharDetalhes = useCallback(() => {
    setRegiaoSelecionada(null);
  }, []);

  function moverColuna(coluna: ColunaId, deslocamento: -1 | 1) {
    setPreferencias((atuais) => {
      const indice = atuais.ordem.indexOf(coluna);
      const destino = indice + deslocamento;
      if (destino < 0 || destino >= atuais.ordem.length) return atuais;
      const ordem = [...atuais.ordem];
      [ordem[indice], ordem[destino]] = [ordem[destino], ordem[indice]];
      return { ...atuais, ordem };
    });
  }

  function alternarColuna(coluna: ColunaId) {
    if (colunas.find((item) => item.id === coluna)?.fixa) return;
    setPreferencias((atuais) => ({
      ...atuais,
      visiveis: atuais.visiveis.includes(coluna)
        ? atuais.visiveis.filter((id) => id !== coluna)
        : [...atuais.visiveis, coluna],
    }));
  }

  const colunasVisiveis = preferencias.ordem.filter((coluna) =>
    preferencias.visiveis.includes(coluna)
  );

  return (
    <div>
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
          SafeLife AI · Equipamentos
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Minhas Caldeiras
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Acompanhe os dados de integridade e inspeção dos seus equipamentos.
        </p>
      </header>

      <section
        aria-labelledby="caldeiras-heading"
        className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 shadow-xl shadow-black/10"
      >
        <div className="flex flex-col gap-3 border-b border-slate-700 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="caldeiras-heading" className="text-lg font-semibold text-white">
            Caldeiras cadastradas
          </h2>
          <details className="group relative self-start sm:self-auto">
            <summary className="cursor-pointer rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
              Personalizar colunas
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-[min(90vw,28rem)] rounded-xl border border-slate-700 bg-slate-950 p-4 shadow-2xl">
              <p className="mb-3 text-sm text-slate-400">
                Escolha as colunas visíveis e ajuste a ordem.
              </p>
              <ul className="space-y-2">
                {preferencias.ordem.map((id, indice) => {
                  const coluna = colunas.find((item) => item.id === id);
                  if (!coluna) return null;
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3"
                    >
                      <label className="flex min-w-0 items-center gap-2 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={preferencias.visiveis.includes(id)}
                          disabled={coluna.fixa}
                          onChange={() => alternarColuna(id)}
                          className="h-4 w-4 rounded border-slate-500 bg-slate-800 text-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-70"
                        />
                        <span className="truncate">{coluna.titulo}</span>
                      </label>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          aria-label={`Mover ${coluna.titulo} para cima`}
                          disabled={indice === 0}
                          onClick={() => moverColuna(id, -1)}
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`Mover ${coluna.titulo} para baixo`}
                          disabled={indice === preferencias.ordem.length - 1}
                          onClick={() => moverColuna(id, 1)}
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </details>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-800/80 text-slate-200">
              <tr>
                {colunasVisiveis.map((id) => (
                  <th key={id} scope="col" className="px-4 py-3 font-semibold">
                    {colunas.find((item) => item.id === id)?.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {caldeiras.map((caldeira, indice) => {
                const regiao = getRegioesRankeadas(caldeira.id)[0];
                return (
                  <tr key={caldeira.id} className="hover:bg-slate-800/30">
                    {colunasVisiveis.map((coluna) => (
                      <td key={coluna} className="whitespace-nowrap px-4 py-4">
                        <CelulaCaldeira
                          coluna={coluna}
                          caldeira={caldeira}
                          indice={indice}
                          regiao={regiao}
                          onSelecionarRegiao={setRegiaoSelecionada}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <LegendaClassesConservacao />

      {regiaoSelecionada && (
        <RegiaoDrawer
          regiao={regiaoSelecionada}
          onClose={fecharDetalhes}
        />
      )}
    </div>
  );
}
