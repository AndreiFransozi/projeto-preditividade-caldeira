"use client";

import { useEffect, useRef } from "react";
import ClasseConservacaoBadge from "@/components/caldeira/ClasseConservacaoBadge";
import type { RegiaoCaldeira } from "@/lib/caldeira-dados";

export default function RegiaoDrawer({
  regiao,
  onClose,
}: {
  regiao: RegiaoCaldeira;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [onClose]);

  const formatarNumero = (valor: number | undefined, casas = 1) =>
    valor === undefined
      ? "Não informado"
      : new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: casas,
          maximumFractionDigits: casas,
        }).format(valor);
  const formatarEspessura = (valor: number | undefined) =>
    valor === undefined ? "Não informado" : `${formatarNumero(valor)} mm`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Fechar detalhes da região"
        className="absolute inset-0 cursor-default bg-black/65"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="regiao-detalhes-titulo"
        className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-slate-700 bg-slate-950 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-300">
              Região mais comprometida
            </p>
            <h2
              id="regiao-detalhes-titulo"
              className="mt-2 text-2xl font-bold text-white"
            >
              {regiao.nome}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Fechar
          </button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-300">
              Classe de conservação
            </h3>
            <div className="mt-2 flex items-center gap-3">
              <ClasseConservacaoBadge classe={regiao.classe} />
              <span className="text-slate-100">
                Classe {regiao.classe}
              </span>
            </div>
          </div>

          <section aria-labelledby="espessura-titulo">
            <h3
              id="espessura-titulo"
              className="text-sm font-semibold text-slate-300"
            >
              Espessura
            </h3>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-slate-900 p-4">
                <dt className="text-xs text-slate-400">Atual</dt>
                <dd className="mt-1 text-white">
                  {formatarEspessura(regiao.espessuraAtualMm)}
                </dd>
              </div>
              <div className="rounded-lg bg-slate-900 p-4">
                <dt className="text-xs text-slate-400">Mínima</dt>
                <dd className="mt-1 text-white">
                  {formatarEspessura(regiao.espessuraMinimaMm)}
                </dd>
              </div>
            </dl>
          </section>

          <div className="rounded-lg bg-slate-900 p-4">
            <h3 className="text-sm font-semibold text-slate-300">
              Vida remanescente
            </h3>
            <p className="mt-1 text-white">
              {formatarNumero(regiao.vidaRemanescenteAnos)} anos
            </p>
          </div>

          <div className="rounded-lg border border-sky-900 bg-sky-950/40 p-4">
            <h3 className="text-sm font-semibold text-sky-200">
              Conduta técnica recomendada
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              {regiao.condutaTecnica ?? "Não informada"}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
