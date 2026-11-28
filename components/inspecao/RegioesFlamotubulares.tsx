"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type {
  InspecaoFormData,
  InspecaoFormInput,
} from "@/lib/schemas";
import {
  criarCaracterizacaoRegiaoVazia,
  normalizarTexto,
} from "@/lib/utils";
import CaracterizacaoRegiao, {
  obterStatusCaracterizacao,
} from "@/components/inspecao/CaracterizacaoRegiao";
import FieldError from "@/components/ui/FieldError";

type RegiaoFlamotubular =
  InspecaoFormInput["inspecao"]["regioesFlamotubulares"][number];

interface RegioesFlamotubularesProps {
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
  expandirRegiaoId: string | null;
  tentativaExpansao: number;
}

function criarIdRegiao() {
  return `flamotubular-${crypto.randomUUID()}`;
}

function EtiquetaStatus({ status }: { status: string }) {
  const classes =
    status === "Completa"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : status === "Incompleta"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : "border-slate-600 bg-slate-800 text-slate-300";

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {status}
    </span>
  );
}

function ItemRegiao({
  regiao,
  indice,
  aberto,
  idPainel,
  materiais,
  onAdicionarMaterial,
  onAlternar,
  onRemover,
  registrarBotao,
}: {
  regiao: RegiaoFlamotubular;
  indice: number;
  aberto: boolean;
  idPainel: string;
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
  onAlternar: () => void;
  onRemover: () => void;
  registrarBotao: (id: string, elemento: HTMLButtonElement | null) => void;
}) {
  const { control, getFieldState, formState } =
    useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const caminhoBase = `inspecao.regioesFlamotubulares.${indice}` as const;
  const caminhoCaracterizacao =
    `${caminhoBase}.caracterizacao` as const;
  const valores = useWatch({
    control,
    name: caminhoCaracterizacao,
  });
  const ehCamaraCombustao = regiao.id === "camara-combustao";
  const caminhoTipoCamara = `${caminhoBase}.tipoCamara` as const;
  const tipoCamara = useWatch({
    control,
    name: caminhoTipoCamara,
  });
  const status = obterStatusCaracterizacao(
    valores,
    ehCamaraCombustao ? tipoCamara : undefined
  );
  const erroTipoCamara = getFieldState(
    caminhoTipoCamara,
    formState
  ).error;
  const idBotao = `regiao-flamotubular-${regiao.id}-botao`;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-700 bg-slate-950/40">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          ref={(element) => registrarBotao(regiao.id, element)}
          id={idBotao}
          type="button"
          aria-expanded={aberto}
          aria-controls={idPainel}
          onClick={onAlternar}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 rounded-md text-left text-sm font-semibold text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <span>{regiao.nome}</span>
          <span className="flex items-center gap-3">
            <EtiquetaStatus status={status} />
            <span aria-hidden="true" className="text-slate-400">
              {aberto ? "−" : "+"}
            </span>
          </span>
        </button>
        {regiao.personalizada && (
          <button
            type="button"
            onClick={onRemover}
            aria-label={`Remover região ${regiao.nome}`}
            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Remover
          </button>
        )}
      </div>

      {aberto && (
        <div
          id={idPainel}
          role="region"
          aria-labelledby={idBotao}
          className="border-t border-slate-700 p-4 sm:p-5"
        >
          {ehCamaraCombustao && (
            <div className="mb-5 max-w-sm">
              <label
                htmlFor={`${regiao.id}-tipo-camara`}
                className="text-sm font-medium text-slate-200"
              >
                Tipo <span className="text-rose-300">*</span>
              </label>
              <Controller
                name={caminhoTipoCamara}
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      id={`${regiao.id}-tipo-camara`}
                      required
                      value={field.value ?? ""}
                      className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
                        erroTipoCamara
                          ? "border-rose-400"
                          : "border-slate-600"
                      }`}
                      aria-invalid={Boolean(erroTipoCamara)}
                      aria-describedby={
                        erroTipoCamara
                          ? `${regiao.id}-tipo-camara-erro`
                          : undefined
                      }
                    >
                      <option value="">Selecione...</option>
                      <option value="liso">Liso</option>
                      <option value="corrugado">Corrugado</option>
                    </select>
                    <FieldError
                      id={`${regiao.id}-tipo-camara-erro`}
                      message={erroTipoCamara?.message}
                    />
                  </>
                )}
              />
            </div>
          )}

          <CaracterizacaoRegiao
            caminho={caminhoCaracterizacao}
            idPrefixo={`regiao-flamotubular-${regiao.id}`}
            materiais={materiais}
            onAdicionarMaterial={onAdicionarMaterial}
            tipoCamara={
              ehCamaraCombustao ? (tipoCamara ?? "") : undefined
            }
          />
        </div>
      )}
    </article>
  );
}

export default function RegioesFlamotubulares({
  materiais,
  onAdicionarMaterial,
  expandirRegiaoId,
  tentativaExpansao,
}: RegioesFlamotubularesProps) {
  const {
    control,
    getValues,
    formState: { errors },
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "inspecao.regioesFlamotubulares",
    keyName: "fieldArrayKey",
  });
  const [regiaoAbertaId, setRegiaoAbertaId] = useState<string | null>(null);
  const [novaRegiao, setNovaRegiao] = useState("");
  const [erroNovaRegiao, setErroNovaRegiao] = useState("");
  const botoesRegiao = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (!expandirRegiaoId || !fields.some((item) => item.id === expandirRegiaoId)) {
      return;
    }

    setRegiaoAbertaId(expandirRegiaoId);
    requestAnimationFrame(() =>
      botoesRegiao.current[expandirRegiaoId]?.focus()
    );
  }, [expandirRegiaoId, tentativaExpansao, fields]);

  function adicionarRegiao() {
    const nome = novaRegiao.trim();
    if (!nome) return;

    const tipo = getValues("inspecao.tipoCaldeira");
    const regioesFlamotubulares =
      getValues("inspecao.regioesFlamotubulares") ?? [];
    const regioesAquatubulares =
      tipo === "mista"
        ? getValues("inspecao.regioesAquatubulares") ?? []
        : [];
    const duplicada = [
      ...regioesFlamotubulares.map((regiao) => regiao.nome),
      ...regioesAquatubulares.map((regiao) => regiao.nome),
    ].some(
      (regiaoExistente) =>
        normalizarTexto(regiaoExistente) === normalizarTexto(nome)
    );

    if (duplicada) {
      setErroNovaRegiao("Esta região já existe");
      return;
    }

    const id = criarIdRegiao();
    append(
      {
        id,
        nome,
        personalizada: true,
        caracterizacao: criarCaracterizacaoRegiaoVazia(),
      },
      { shouldFocus: false }
    );
    setNovaRegiao("");
    setErroNovaRegiao("");
    setRegiaoAbertaId(id);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-100">
        Regiões flamotubulares
      </h3>
      {fields.map((regiao, indice) => (
        <ItemRegiao
          key={regiao.fieldArrayKey}
          regiao={regiao}
          indice={indice}
          aberto={regiaoAbertaId === regiao.id}
          idPainel={`regiao-flamotubular-${regiao.id}-painel`}
          materiais={materiais}
          onAdicionarMaterial={onAdicionarMaterial}
          onAlternar={() =>
            setRegiaoAbertaId((atual) =>
              atual === regiao.id ? null : regiao.id
            )
          }
          onRemover={() => remove(indice)}
          registrarBotao={(id, elemento) => {
            botoesRegiao.current[id] = elemento;
          }}
        />
      ))}
      <FieldError
        id="regioes-flamotubulares-erro"
        message={errors.inspecao?.regioesFlamotubulares?.root?.message}
      />

      <div className="pt-2">
        <label
          htmlFor="nova-regiao-flamotubular"
          className="text-sm font-medium text-slate-200"
        >
          Nova região
        </label>
        <div className="mt-2 flex max-w-xl gap-2">
          <input
            id="nova-regiao-flamotubular"
            type="text"
            maxLength={60}
            value={novaRegiao}
            className={`min-h-11 min-w-0 flex-1 rounded-lg border bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
              erroNovaRegiao ? "border-rose-400" : "border-slate-600"
            }`}
            aria-invalid={Boolean(erroNovaRegiao)}
            aria-describedby={
              erroNovaRegiao ? "nova-regiao-flamotubular-erro" : undefined
            }
            onChange={(event) => {
              setNovaRegiao(event.target.value);
              setErroNovaRegiao("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                adicionarRegiao();
              }
            }}
          />
          <button
            type="button"
            aria-label="Adicionar região"
            onClick={adicionarRegiao}
            disabled={!novaRegiao.trim()}
            className="inline-flex min-h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-sky-400/50 text-xl font-semibold text-sky-200 transition hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
        {erroNovaRegiao && (
          <p
            id="nova-regiao-flamotubular-erro"
            className="mt-1.5 text-sm text-rose-300"
            role="alert"
          >
            {erroNovaRegiao}
          </p>
        )}
      </div>
    </div>
  );
}
