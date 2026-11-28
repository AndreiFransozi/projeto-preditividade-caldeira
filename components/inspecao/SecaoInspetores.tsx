"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { InspecaoFormData, InspecaoFormInput } from "@/lib/schemas";
import { normalizarTexto } from "@/lib/utils";
import FieldError from "@/components/ui/FieldError";

const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30";

interface SecaoInspetoresProps {
  nomeInspetor: string;
  qualificacao: string;
  onNomeInspetorChange: (valor: string) => void;
  onQualificacaoChange: (valor: string) => void;
  mostrarAvisoRascunho: boolean;
}

export default function SecaoInspetores({
  nomeInspetor,
  qualificacao,
  onNomeInspetorChange,
  onQualificacaoChange,
  mostrarAvisoRascunho,
}: SecaoInspetoresProps) {
  const { control, getFieldState, formState } =
    useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "inspecao.inspetores",
  });
  const [erroDuplicado, setErroDuplicado] = useState("");
  const nomeInspetorRef = useRef<HTMLInputElement>(null);
  const erroListaDaLista = getFieldState(
    "inspecao.inspetores",
    formState
  ).error;
  const erroLista = erroListaDaLista?.message ?? erroListaDaLista?.root?.message;
  const adicionarHabilitado = Boolean(
    nomeInspetor.trim() && qualificacao.trim()
  );

  function adicionarInspetor() {
    const nome = nomeInspetor.trim();
    const qualificacaoLimpa = qualificacao.trim();
    if (!nome || !qualificacaoLimpa) return;

    const duplicado = fields.some(
      (inspetor) =>
        normalizarTexto(inspetor.nome) === normalizarTexto(nome) &&
        normalizarTexto(inspetor.qualificacao) ===
          normalizarTexto(qualificacaoLimpa)
    );

    if (duplicado) {
      setErroDuplicado("Este inspetor já foi adicionado");
      return;
    }

    append(
      { nome, qualificacao: qualificacaoLimpa },
      { shouldFocus: false }
    );
    setErroDuplicado("");
    onNomeInspetorChange("");
    onQualificacaoChange("");
    nomeInspetorRef.current?.focus();
  }

  function tratarEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarInspetor();
    }
  }

  return (
    <section
      aria-labelledby="inspetores-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 3
        </p>
        <h2
          id="inspetores-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Inspetores de engenharia
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Adicione cada inspetor e sua qualificação.
        </p>
      </div>

      <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
        <div>
          <label
            htmlFor="novo-inspetor-nome"
            className="text-sm font-medium text-slate-200"
          >
            Inspetor <span className="text-rose-300">*</span>
          </label>
          <input
            ref={nomeInspetorRef}
            id="novo-inspetor-nome"
            type="text"
            value={nomeInspetor}
            required
            className={inputClassName}
            aria-required="true"
            aria-invalid={Boolean(erroDuplicado)}
            aria-describedby={
              erroDuplicado ? "inspetor-duplicado-erro" : undefined
            }
            onChange={(event) => {
              onNomeInspetorChange(event.target.value);
              setErroDuplicado("");
            }}
            onKeyDown={tratarEnter}
          />
        </div>

        <div>
          <label
            htmlFor="novo-inspetor-qualificacao"
            className="text-sm font-medium text-slate-200"
          >
            Qualificação <span className="text-rose-300">*</span>
          </label>
          <input
            id="novo-inspetor-qualificacao"
            type="text"
            value={qualificacao}
            required
            className={inputClassName}
            aria-required="true"
            aria-invalid={Boolean(erroDuplicado)}
            aria-describedby={
              erroDuplicado ? "inspetor-duplicado-erro" : undefined
            }
            onChange={(event) => {
              onQualificacaoChange(event.target.value);
              setErroDuplicado("");
            }}
            onKeyDown={tratarEnter}
          />
        </div>

        <button
          type="button"
          disabled={!adicionarHabilitado}
          onClick={adicionarInspetor}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-sky-400/50 px-5 py-2.5 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>

      {erroDuplicado && (
        <p
          id="inspetor-duplicado-erro"
          className="mt-2 text-sm text-rose-300"
          role="alert"
        >
          {erroDuplicado}
        </p>
      )}
      {mostrarAvisoRascunho && (
        <p className="mt-2 text-sm text-amber-300" role="alert">
          Você digitou um inspetor, mas não clicou em Adicionar
        </p>
      )}

      <div className="mt-6 space-y-3" aria-live="polite">
        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
            Nenhum inspetor adicionado
          </p>
        ) : (
          <ul className="space-y-3">
            {fields.map((inspetor, indice) => (
              <li
                key={inspetor.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm text-slate-100">
                  {inspetor.nome} — {inspetor.qualificacao}
                </span>
                <button
                  type="button"
                  aria-label={`Remover inspetor ${inspetor.nome}`}
                  onClick={() => remove(indice)}
                  className="self-start rounded-md px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:self-auto"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldError id="inspetores-lista-erro" message={erroLista} />
    </section>
  );
}
