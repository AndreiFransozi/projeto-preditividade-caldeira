"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import {
  regioesAquatubularesFixas,
  regioesFlamotubularesFixas,
  subRegioesAquatubularesFixas,
} from "@/lib/constants";
import { useTipoCaldeira, type TipoCaldeira } from "@/contexts/TipoCaldeiraContext";
import { criarCaracterizacaoRegiaoVazia } from "@/lib/utils";
import SecaoDadosInspecao from "@/components/inspecao/SecaoDadosInspecao";
import SecaoEmpresaResponsavel from "@/components/inspecao/SecaoEmpresaResponsavel";
import SecaoInspetores from "@/components/inspecao/SecaoInspetores";
import SecaoRegioesCaldeira from "@/components/inspecao/SecaoRegioesCaldeira";
import SecaoQuantidadeTubos from "@/components/inspecao/SecaoQuantidadeTubos";
import {
  inspecaoSchema,
  type InspecaoFormData,
  type InspecaoFormInput,
} from "@/lib/schemas";

function criarValoresIniciais(
  tipoCaldeira: TipoCaldeira | null
): InspecaoFormInput {
  return {
    inspecao: {
      tipoCaldeira: tipoCaldeira ?? "",
      empresaInspecao: "",
      responsavelTecnico: "",
      numeroCreaPlh: "",
      ufCrea: "",
      dataInspecao: "",
      numeroArt: "",
      inspetores: [],
      regioesFlamotubulares: regioesFlamotubularesFixas.map((regiao) => ({
        ...regiao,
        personalizada: false,
        ...(regiao.id === "camara-combustao" ? { tipoCamara: "" as const } : {}),
        caracterizacao: criarCaracterizacaoRegiaoVazia(),
      })),
      regioesAquatubulares: regioesAquatubularesFixas.map((regiao) => ({
        ...regiao,
        personalizada: false,
        subRegioes: subRegioesAquatubularesFixas.map((subRegiao) => ({
          ...subRegiao,
          caracterizacao: criarCaracterizacaoRegiaoVazia(),
        })),
        outrasSecoes: [
          {
            id: "tubos-trecho-reto",
            nome: "Tubos trecho reto",
            texto: "",
            personalizada: false,
          },
          {
            id: "curvas-inferiores",
            nome: "Curvas inferiores",
            texto: "",
            personalizada: false,
          },
        ],
      })),
      quantidadeTubos: {
        paredeFrontal: "",
        paredeTraseira: "",
        paredeLateralEsquerda: "",
        paredeLateralDireita: "",
      },
    },
  };
}

export default function FormularioInspecao() {
  const { tipoCaldeira } = useTipoCaldeira();
  const [nomeInspetor, setNomeInspetor] = useState("");
  const [qualificacao, setQualificacao] = useState("");
  const [mostrarAvisoRascunho, setMostrarAvisoRascunho] = useState(false);
  const form = useForm<InspecaoFormInput, unknown, InspecaoFormData>({
    resolver: zodResolver(inspecaoSchema),
    defaultValues: criarValoresIniciais(tipoCaldeira),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  function onSubmit(dados: InspecaoFormData) {
    console.log("Caracterização de inspeção:", dados);
    // TODO: integrar com a API de cadastro de inspeções.
  }

  function limparFormulario() {
    form.reset();
    setNomeInspetor("");
    setQualificacao("");
    setMostrarAvisoRascunho(false);
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => {
          if (nomeInspetor.trim() || qualificacao.trim()) {
            event.preventDefault();
            setMostrarAvisoRascunho(true);
            return;
          }

          setMostrarAvisoRascunho(false);
          void form.handleSubmit(onSubmit)(event);
        }}
        className="space-y-5"
      >
        <SecaoEmpresaResponsavel />
        <SecaoDadosInspecao />
        <SecaoInspetores
          nomeInspetor={nomeInspetor}
          qualificacao={qualificacao}
          onNomeInspetorChange={(valor) => {
            setNomeInspetor(valor);
            setMostrarAvisoRascunho(false);
          }}
          onQualificacaoChange={(valor) => {
            setQualificacao(valor);
            setMostrarAvisoRascunho(false);
          }}
          mostrarAvisoRascunho={mostrarAvisoRascunho}
        />
        <SecaoRegioesCaldeira
          tipoDisponivelDoModelo={Boolean(tipoCaldeira)}
        />
        <SecaoQuantidadeTubos />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={limparFormulario}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Salvar
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
