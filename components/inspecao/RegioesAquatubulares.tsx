"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  useFieldArray,
  useFormContext,
  useWatch,
  type FieldPath,
} from "react-hook-form";
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

type RegiaoAquatubular =
  InspecaoFormInput["inspecao"]["regioesAquatubulares"][number];
type SubRegiaoAquatubular = RegiaoAquatubular["subRegioes"][number];
type OutraSecao = RegiaoAquatubular["outrasSecoes"][number];

interface RegioesAquatubularesProps {
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
  expandirRegiaoId: string | null;
  tentativaExpansao: number;
}

function criarIdRegiao() {
  return `aquatubular-${crypto.randomUUID()}`;
}

function EtiquetaStatus({
  status,
}: {
  status: "Não preenchida" | "Incompleta" | "Completa";
}) {
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

function SubRegiao({
  subRegiao,
  indiceRegiao,
  indiceSubRegiao,
  materiais,
  onAdicionarMaterial,
}: {
  subRegiao: SubRegiaoAquatubular;
  indiceRegiao: number;
  indiceSubRegiao: number;
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
}) {
  const { control } = useFormContext<
    InspecaoFormInput,
    unknown,
    InspecaoFormData
  >();
  const caminho =
    `inspecao.regioesAquatubulares.${indiceRegiao}.subRegioes.${indiceSubRegiao}.caracterizacao` as const;
  const caracterizacao = useWatch({ control, name: caminho });
  const status = obterStatusCaracterizacao(caracterizacao);

  return (
    <div className="border-l-2 border-slate-700 pl-4 sm:ml-2 sm:pl-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-semibold text-slate-100">
          {subRegiao.nome === "coletores-inferiores"
            ? "Coletores inferiores"
            : subRegiao.nome === "coletores-superiores"
              ? "Coletores superiores"
              : "Tubos"}
        </h4>
        <EtiquetaStatus status={status} />
      </div>
      <CaracterizacaoRegiao
        caminho={caminho}
        idPrefixo={`regiao-aquatubular-${indiceRegiao}-subregiao-${subRegiao.id}`}
        materiais={materiais}
        onAdicionarMaterial={onAdicionarMaterial}
      />
    </div>
  );
}

function CampoOutraSecao({
  secao,
  indiceRegiao,
  indiceSecao,
  onRemover,
}: {
  secao: OutraSecao & { extraArrayKey?: string };
  indiceRegiao: number;
  indiceSecao: number;
  onRemover: () => void;
}) {
  const { register, getFieldState, formState } =
    useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const caminhoBase =
    `inspecao.regioesAquatubulares.${indiceRegiao}.outrasSecoes.${indiceSecao}` as const;
  const caminhoNome =
    `${caminhoBase}.nome` as FieldPath<InspecaoFormInput>;
  const caminhoTexto =
    `${caminhoBase}.texto` as FieldPath<InspecaoFormInput>;
  const erroNome = getFieldState(caminhoNome, formState).error?.message;
  const erroTexto = getFieldState(caminhoTexto, formState).error?.message;
  const id = `outra-secao-${indiceRegiao}-${indiceSecao}`;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        {secao.personalizada ? (
          <div className="min-w-0 flex-1">
            <label
              htmlFor={`${id}-nome`}
              className="text-sm font-medium text-slate-200"
            >
              Nome da seção
            </label>
            <input
              id={`${id}-nome`}
              type="text"
              maxLength={60}
              className="mt-2 block min-h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
              aria-invalid={Boolean(erroNome)}
              aria-describedby={erroNome ? `${id}-nome-erro` : undefined}
              {...register(caminhoNome)}
            />
            <FieldError id={`${id}-nome-erro`} message={erroNome} />
          </div>
        ) : (
          <h5 className="text-sm font-semibold text-slate-100">
            {secao.nome}
          </h5>
        )}
        {secao.personalizada && (
          <button
            type="button"
            aria-label={`Remover seção ${secao.nome}`}
            onClick={onRemover}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            Remover
          </button>
        )}
      </div>
      <label
        htmlFor={`${id}-texto`}
        className="text-sm font-medium text-slate-300"
      >
        Caracterização
      </label>
      <textarea
        id={`${id}-texto`}
        rows={3}
        maxLength={200}
        className="mt-2 block w-full resize-y rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
        aria-invalid={Boolean(erroTexto)}
        aria-describedby={erroTexto ? `${id}-texto-erro` : undefined}
        {...register(caminhoTexto)}
      />
      <FieldError id={`${id}-texto-erro`} message={erroTexto} />
    </div>
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
  regiao: RegiaoAquatubular & { fieldArrayKey?: string };
  indice: number;
  aberto: boolean;
  idPainel: string;
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
  onAlternar: () => void;
  onRemover: () => void;
  registrarBotao: (id: string, elemento: HTMLButtonElement | null) => void;
}) {
  const {
    control,
    getFieldState,
    formState,
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const caminhoSubRegioes =
    `inspecao.regioesAquatubulares.${indice}.subRegioes` as const;
  const caminhoOutrasSecoes =
    `inspecao.regioesAquatubulares.${indice}.outrasSecoes` as const;
  const { fields: subRegioes } = useFieldArray({
    control,
    name: caminhoSubRegioes,
    keyName: "subArrayKey",
  });
  const {
    fields: outrasSecoes,
    append: appendOutraSecao,
    remove: removerOutraSecao,
  } = useFieldArray({
    control,
    name: caminhoOutrasSecoes,
    keyName: "extraArrayKey",
  });
  const valoresSubRegioes = useWatch({
    control,
    name: caminhoSubRegioes,
  });
  const [mostrarNovaSecao, setMostrarNovaSecao] = useState(false);
  const [nomeNovaSecao, setNomeNovaSecao] = useState("");
  const [textoNovaSecao, setTextoNovaSecao] = useState("");
  const [erroNovaSecao, setErroNovaSecao] = useState("");
  const idBotao = `regiao-aquatubular-${regiao.id}-botao`;
  const statusSubRegioes = (valoresSubRegioes ?? []).map((subRegiao) =>
    obterStatusCaracterizacao(subRegiao.caracterizacao)
  );
  const status =
    statusSubRegioes.every((item) => item === "Não preenchida")
      ? "Não preenchida"
      : statusSubRegioes.some((item) => item === "Incompleta")
        ? "Incompleta"
        : "Completa";
  const caminhoNovaSecao =
    `inspecao.regioesAquatubulares.${indice}.outrasSecoes` as const;
  const erroListaSecoes = getFieldState(
    caminhoNovaSecao,
    formState
  ).error?.root?.message;

  function adicionarOutraSecao() {
    const nome = nomeNovaSecao.trim();
    if (!nome) {
      setErroNovaSecao("Informe o nome da seção.");
      return;
    }

    appendOutraSecao({
      id: `outra-secao-${crypto.randomUUID()}`,
      nome,
      texto: textoNovaSecao,
      personalizada: true,
    });
    setNomeNovaSecao("");
    setTextoNovaSecao("");
    setErroNovaSecao("");
    setMostrarNovaSecao(false);
  }

  function tratarEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarOutraSecao();
    }
  }

  const idPainelNovaSecao = `regiao-aquatubular-${regiao.id}-nova-secao`;

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
          className="space-y-7 border-t border-slate-700 p-4 sm:p-5"
        >
          <div className="space-y-6">
            {subRegioes.map((subRegiao, indiceSubRegiao) => (
              <SubRegiao
                key={subRegiao.subArrayKey}
                subRegiao={subRegiao}
                indiceRegiao={indice}
                indiceSubRegiao={indiceSubRegiao}
                materiais={materiais}
                onAdicionarMaterial={onAdicionarMaterial}
              />
            ))}
          </div>

          <section
            aria-labelledby={`${idPainel}-outras-heading`}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 sm:p-5"
          >
            <h4
              id={`${idPainel}-outras-heading`}
              className="text-base font-semibold text-slate-100"
            >
              Outras seções
            </h4>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {outrasSecoes.map((secao, indiceSecao) => (
                <CampoOutraSecao
                  key={secao.extraArrayKey}
                  secao={secao}
                  indiceRegiao={indice}
                  indiceSecao={indiceSecao}
                  onRemover={() => removerOutraSecao(indiceSecao)}
                />
              ))}
            </div>
            <FieldError
              id={`${idPainel}-outras-erro`}
              message={erroListaSecoes}
            />

            <button
              type="button"
              aria-expanded={mostrarNovaSecao}
              aria-controls={idPainelNovaSecao}
              onClick={() => setMostrarNovaSecao((aberto) => !aberto)}
              className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-sky-400/50 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              + Adicionar outra seção
            </button>

            {mostrarNovaSecao && (
              <div
                id={idPainelNovaSecao}
                className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-slate-700 bg-slate-950/50 p-4"
              >
                <div>
                  <label
                    htmlFor={`${idPainelNovaSecao}-nome`}
                    className="text-sm font-medium text-slate-200"
                  >
                    Nome da seção
                  </label>
                  <input
                    id={`${idPainelNovaSecao}-nome`}
                    type="text"
                    maxLength={60}
                    value={nomeNovaSecao}
                    className="mt-2 block min-h-10 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
                    aria-invalid={Boolean(erroNovaSecao)}
                    aria-describedby={
                      erroNovaSecao
                        ? `${idPainelNovaSecao}-erro`
                        : undefined
                    }
                    onChange={(event) => {
                      setNomeNovaSecao(event.target.value);
                      setErroNovaSecao("");
                    }}
                    onKeyDown={tratarEnter}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPainelNovaSecao}-texto`}
                    className="text-sm font-medium text-slate-200"
                  >
                    Caracterização
                  </label>
                  <textarea
                    id={`${idPainelNovaSecao}-texto`}
                    rows={3}
                    maxLength={200}
                    value={textoNovaSecao}
                    className="mt-2 block w-full resize-y rounded-lg border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
                    onChange={(event) => setTextoNovaSecao(event.target.value)}
                  />
                </div>
                {erroNovaSecao && (
                  <p
                    id={`${idPainelNovaSecao}-erro`}
                    className="text-sm text-rose-300"
                    role="alert"
                  >
                    {erroNovaSecao}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarNovaSecao(false);
                      setErroNovaSecao("");
                    }}
                    className="min-h-10 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={adicionarOutraSecao}
                    className="min-h-10 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </article>
  );
}

export default function RegioesAquatubulares({
  materiais,
  onAdicionarMaterial,
  expandirRegiaoId,
  tentativaExpansao,
}: RegioesAquatubularesProps) {
  const { control, getValues } = useFormContext<
    InspecaoFormInput,
    unknown,
    InspecaoFormData
  >();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "inspecao.regioesAquatubulares",
    keyName: "fieldArrayKey",
  });
  const [regiaoAbertaId, setRegiaoAbertaId] = useState<string | null>(null);
  const [mostrarNovaRegiao, setMostrarNovaRegiao] = useState(false);
  const [novaRegiao, setNovaRegiao] = useState("");
  const [erroNovaRegiao, setErroNovaRegiao] = useState("");
  const botoesRegiao = useRef<Record<string, HTMLButtonElement | null>>({});
  const idPainelNovaRegiao = "painel-nova-regiao-aquatubular";

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
    if (!nome) {
      setErroNovaRegiao("Informe o nome da região.");
      return;
    }

    const tipo = getValues("inspecao.tipoCaldeira");
    const regioesAquatubulares =
      getValues("inspecao.regioesAquatubulares") ?? [];
    const regioesFlamotubulares =
      tipo === "mista"
        ? getValues("inspecao.regioesFlamotubulares") ?? []
        : [];
    const duplicada = [
      ...regioesAquatubulares.map((regiao) => regiao.nome),
      ...regioesFlamotubulares.map((regiao) => regiao.nome),
    ].some(
      (regiaoExistente) =>
        normalizarTexto(regiaoExistente) === normalizarTexto(nome)
    );

    if (duplicada) {
      setErroNovaRegiao("Esta região já existe");
      return;
    }

    const id = criarIdRegiao();
    const subRegioes = [
      {
        id: "tubos",
        nome: "tubos" as const,
        caracterizacao: criarCaracterizacaoRegiaoVazia(),
      },
      {
        id: "coletores-inferiores",
        nome: "coletores-inferiores" as const,
        caracterizacao: criarCaracterizacaoRegiaoVazia(),
      },
      {
        id: "coletores-superiores",
        nome: "coletores-superiores" as const,
        caracterizacao: criarCaracterizacaoRegiaoVazia(),
      },
    ];
    append(
      {
        id,
        nome,
        personalizada: true,
        subRegioes,
        outrasSecoes: [
          {
            id: `outra-secao-${crypto.randomUUID()}`,
            nome: "Tubos trecho reto",
            texto: "",
            personalizada: false,
          },
          {
            id: `outra-secao-${crypto.randomUUID()}`,
            nome: "Curvas inferiores",
            texto: "",
            personalizada: false,
          },
        ],
      },
      { shouldFocus: false }
    );
    setNovaRegiao("");
    setErroNovaRegiao("");
    setMostrarNovaRegiao(false);
    setRegiaoAbertaId(id);
  }

  function tratarEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      adicionarRegiao();
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-100">
        Regiões aquatubulares
      </h3>
      {fields.map((regiao, indice) => (
        <ItemRegiao
          key={regiao.fieldArrayKey}
          regiao={regiao}
          indice={indice}
          aberto={regiaoAbertaId === regiao.id}
          idPainel={`regiao-aquatubular-${regiao.id}-painel`}
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

      <button
        type="button"
        aria-expanded={mostrarNovaRegiao}
        aria-controls={idPainelNovaRegiao}
        onClick={() => {
          setMostrarNovaRegiao((aberto) => !aberto);
          setNovaRegiao("");
          setErroNovaRegiao("");
        }}
        className="inline-flex min-h-11 items-center rounded-lg border border-sky-400/50 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        Adicionar região
      </button>

      {mostrarNovaRegiao && (
        <div
          id={idPainelNovaRegiao}
          className="max-w-2xl rounded-xl border border-slate-700 bg-slate-950/50 p-4"
        >
          <label
            htmlFor="nova-regiao-aquatubular"
            className="text-sm font-medium text-slate-200"
          >
            Nome da nova região
          </label>
          <input
            id="nova-regiao-aquatubular"
            type="text"
            maxLength={60}
            value={novaRegiao}
            className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-2.5 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
              erroNovaRegiao ? "border-rose-400" : "border-slate-600"
            }`}
            aria-invalid={Boolean(erroNovaRegiao)}
            aria-describedby={
              erroNovaRegiao ? "nova-regiao-aquatubular-erro" : undefined
            }
            onChange={(event) => {
              setNovaRegiao(event.target.value);
              setErroNovaRegiao("");
            }}
            onKeyDown={tratarEnter}
          />
          {erroNovaRegiao && (
            <p
              id="nova-regiao-aquatubular-erro"
              className="mt-1.5 text-sm text-rose-300"
              role="alert"
            >
              {erroNovaRegiao}
            </p>
          )}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setMostrarNovaRegiao(false);
                setErroNovaRegiao("");
              }}
              className="min-h-10 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={adicionarRegiao}
              className="min-h-10 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
