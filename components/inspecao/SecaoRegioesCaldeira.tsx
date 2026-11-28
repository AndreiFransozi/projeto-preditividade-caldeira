"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  useFormContext,
  useWatch,
  type FieldPath,
} from "react-hook-form";
import { materiaisRegiao } from "@/lib/constants";
import type { TipoCaldeira } from "@/contexts/TipoCaldeiraContext";
import type {
  InspecaoFormData,
  InspecaoFormInput,
} from "@/lib/schemas";
import { normalizarTexto } from "@/lib/utils";
import FieldError from "@/components/ui/FieldError";
import RegioesAquatubulares from "@/components/inspecao/RegioesAquatubulares";
import RegioesFlamotubulares from "@/components/inspecao/RegioesFlamotubulares";

type GrupoRegiao = "flamotubular" | "aquatubular";

interface AlvoExpansao {
  grupo: GrupoRegiao;
  id: string;
  tentativa: number;
}

interface SecaoRegioesCaldeiraProps {
  tipoDisponivelDoModelo: boolean;
}

const camposCaracterizacao = [
  "material",
  "temperaturaCalculo",
  "tensaoMaximaAdmissivel",
  "pressaoCalculo",
  "diametroExterno",
  "espessuraMinimaCalculada",
  "espessuraMinimaRecomendada",
  "espessuraNominal",
  "dataInicioOperacao",
] as const;

const rotuloTipo: Record<TipoCaldeira, string> = {
  aquatubular: "Aquatubular",
  flamotubular: "Flamotubular",
  mista: "Mista",
};

export default function SecaoRegioesCaldeira({
  tipoDisponivelDoModelo,
}: SecaoRegioesCaldeiraProps) {
  const {
    control,
    getFieldState,
    getValues,
    formState,
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const { errors, submitCount } = formState;
  const tipoCaldeira = useWatch({
    control,
    name: "inspecao.tipoCaldeira",
  });
  const [materiais, setMateriais] = useState<string[]>([
    ...materiaisRegiao,
  ]);
  const [alvoExpansao, setAlvoExpansao] = useState<AlvoExpansao | null>(null);
  const erroTipo = getFieldState(
    "inspecao.tipoCaldeira",
    formState
  ).error?.message;

  useEffect(() => {
    if (!submitCount) return;

    const tipo = getValues("inspecao.tipoCaldeira");
    const procurarErro = (caminho: string) =>
      getFieldState(
        caminho as FieldPath<InspecaoFormInput>,
        formState
      ).invalid;
    let alvo: Omit<AlvoExpansao, "tentativa"> | null = null;

    if (tipo === "flamotubular" || tipo === "mista") {
      const regioes = getValues("inspecao.regioesFlamotubulares") ?? [];
      for (let indice = 0; indice < regioes.length && !alvo; indice += 1) {
        const regiao = regioes[indice];
        const prefixo = `inspecao.regioesFlamotubulares.${indice}`;
        const caminhos = [
          `${prefixo}.nome`,
          `${prefixo}.tipoCamara`,
          ...camposCaracterizacao.map(
            (campo) => `${prefixo}.caracterizacao.${campo}`
          ),
        ];
        if (caminhos.some(procurarErro)) {
          alvo = { grupo: "flamotubular", id: regiao.id };
        }
      }
    }

    if (!alvo && (tipo === "aquatubular" || tipo === "mista")) {
      const regioes = getValues("inspecao.regioesAquatubulares") ?? [];
      for (let indice = 0; indice < regioes.length && !alvo; indice += 1) {
        const regiao = regioes[indice];
        const prefixo = `inspecao.regioesAquatubulares.${indice}`;
        const caminhos = [
          `${prefixo}.nome`,
          ...regiao.subRegioes.flatMap((_, indiceSubRegiao) =>
            camposCaracterizacao.map(
              (campo) =>
                `${prefixo}.subRegioes.${indiceSubRegiao}.caracterizacao.${campo}`
            )
          ),
          ...regiao.outrasSecoes.flatMap((_, indiceSecao) => [
            `${prefixo}.outrasSecoes.${indiceSecao}.nome`,
            `${prefixo}.outrasSecoes.${indiceSecao}.texto`,
          ]),
        ];
        if (caminhos.some(procurarErro)) {
          alvo = { grupo: "aquatubular", id: regiao.id };
        }
      }
    }

    setAlvoExpansao(
      alvo
        ? { ...alvo, tentativa: submitCount }
        : null
    );
  }, [
    errors,
    submitCount,
    getFieldState,
    getValues,
  ]);

  function adicionarMaterial(nome: string): string {
    const existente = materiais.find(
      (material) => normalizarTexto(material) === normalizarTexto(nome)
    );
    if (existente) return existente;

    setMateriais((atuais) => [...atuais, nome]);
    // TODO: persistir materiais personalizados na API.
    return nome;
  }

  return (
    <section
      aria-labelledby="regioes-caldeira-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 4
        </p>
        <h2
          id="regioes-caldeira-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Caracterização das regiões da caldeira
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Caracterize as regiões aplicáveis ao tipo de caldeira.
        </p>
      </div>

      {tipoDisponivelDoModelo ? (
        <p className="mb-6 rounded-lg border border-sky-400/20 bg-sky-400/5 px-4 py-3 text-sm text-sky-100">
          Tipo de caldeira identificado no modelo:{" "}
          <strong>
            {tipoCaldeira ? rotuloTipo[tipoCaldeira] : "Aguardando modelo"}
          </strong>
        </p>
      ) : (
        <div className="mb-6 max-w-xl">
          <label
            htmlFor="tipo-caldeira-inspecao"
            className="text-sm font-medium text-slate-200"
          >
            Tipo de caldeira <span className="text-rose-300">*</span>
          </label>
          <Controller
            name="inspecao.tipoCaldeira"
            control={control}
            render={({ field }) => (
              <>
                <select
                  {...field}
                  id="tipo-caldeira-inspecao"
                  required
                  className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
                    erroTipo ? "border-rose-400" : "border-slate-600"
                  }`}
                  aria-invalid={Boolean(erroTipo)}
                  aria-describedby={
                    erroTipo ? "tipo-caldeira-inspecao-erro" : undefined
                  }
                >
                  <option value="">Selecione...</option>
                  {(["aquatubular", "flamotubular", "mista"] as const).map(
                    (tipo) => (
                      <option key={tipo} value={tipo}>
                        {rotuloTipo[tipo]}
                      </option>
                    )
                  )}
                </select>
                <FieldError
                  id="tipo-caldeira-inspecao-erro"
                  message={erroTipo}
                />
              </>
            )}
          />
        </div>
      )}

      <div className="space-y-7">
        {(tipoCaldeira === "flamotubular" || tipoCaldeira === "mista") && (
          <RegioesFlamotubulares
            materiais={materiais}
            onAdicionarMaterial={adicionarMaterial}
            expandirRegiaoId={
              alvoExpansao?.grupo === "flamotubular"
                ? alvoExpansao.id
                : null
            }
            tentativaExpansao={alvoExpansao?.tentativa ?? 0}
          />
        )}
        {(tipoCaldeira === "aquatubular" || tipoCaldeira === "mista") && (
          <RegioesAquatubulares
            materiais={materiais}
            onAdicionarMaterial={adicionarMaterial}
            expandirRegiaoId={
              alvoExpansao?.grupo === "aquatubular"
                ? alvoExpansao.id
                : null
            }
            tentativaExpansao={alvoExpansao?.tentativa ?? 0}
          />
        )}
      </div>
    </section>
  );
}
