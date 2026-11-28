"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  useFormContext,
  type FieldPath,
} from "react-hook-form";
import { useState } from "react";
import FieldError from "@/components/ui/FieldError";
import {
  categoriasNr13,
  formasConstrutivasCaldeira,
  tiposVaporGerado,
} from "@/lib/constants";
import {
  caracterizacaoCaldeiraSchema,
  type CaracterizacaoCaldeiraData,
  type CaracterizacaoCaldeiraInput,
} from "@/lib/schemas";

const valoresIniciais: CaracterizacaoCaldeiraInput = {
  identificacao: {
    descricaoCurta: "",
    numeroEquipamento: "",
    descricaoEquipamento: "",
    numeroPosicaoOperacional: "",
    descricaoPosicao: "",
    categoriaNr13: "",
    dataInicioOperacao: "",
  },
  fabricante: {
    nome: "",
    modelo: "",
    numeroSerie: "",
    numeroOrdemFabricacao: "",
    formaConstrutiva: "",
    vaporGerado: "",
  },
  dadosTecnicos: {
    capacidadeGeracaoVapor: "",
    capacidadeQueimaSolidos: "",
    pmta: "",
    pressaoNominalTrabalho: "",
    pressaoSaidaVapor: "",
    temperaturaVaporProcesso: "",
    naturezaVaporGerado: "",
    superficieAquecimento: "",
    formaConstrutiva: "",
  },
  combustiveis: {
    principal: "",
    auxiliar1: "",
    auxiliar2: "",
  },
};

const inputClassName =
  "mt-2 block min-h-11 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/40";

function CampoTexto({
  id,
  label,
  name,
  error,
  type = "text",
  required = true,
}: {
  id: string;
  label: string;
  name: FieldPath<CaracterizacaoCaldeiraInput>;
  error?: string;
  type?: "text" | "date";
  required?: boolean;
}) {
  const { register } = useFormContext<
    CaracterizacaoCaldeiraInput,
    unknown,
    CaracterizacaoCaldeiraData
  >();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label}
        {required && <span className="ml-1 text-rose-300">*</span>}
      </label>
      <input
        id={id}
        type={type}
        lang={type === "date" ? "pt-BR" : undefined}
        required={required}
        className={inputClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        {...register(name)}
      />
      <FieldError id={`${id}-erro`} message={error} />
    </div>
  );
}

function CampoNumerico({
  id,
  label,
  name,
  error,
}: {
  id: string;
  label: string;
  name: FieldPath<CaracterizacaoCaldeiraInput>;
  error?: string;
}) {
  const { register } = useFormContext<
    CaracterizacaoCaldeiraInput,
    unknown,
    CaracterizacaoCaldeiraData
  >();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label} <span className="ml-1 text-rose-300">*</span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        required
        placeholder="0,0"
        className={inputClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        {...register(name)}
      />
      <FieldError id={`${id}-erro`} message={error} />
    </div>
  );
}

function CampoSelect({
  id,
  label,
  name,
  options,
  error,
}: {
  id: string;
  label: string;
  name: FieldPath<CaracterizacaoCaldeiraInput>;
  options: readonly string[];
  error?: string;
}) {
  const { register } = useFormContext<
    CaracterizacaoCaldeiraInput,
    unknown,
    CaracterizacaoCaldeiraData
  >();

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-200">
        {label} <span className="ml-1 text-rose-300">*</span>
      </label>
      <select
        id={id}
        required
        className={inputClassName}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        {...register(name)}
      >
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-erro`} message={error} />
    </div>
  );
}

function CabecalhoSecao({
  numero,
  titulo,
  id,
}: {
  numero: number;
  titulo: string;
  id: string;
}) {
  return (
    <div className="mb-5 border-b border-slate-700 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
        Seção {numero}
      </p>
      <h2 id={id} className="mt-1 text-lg font-semibold text-white">
        {titulo}
      </h2>
    </div>
  );
}

export default function FormularioCaldeira() {
  const [feedback, setFeedback] = useState<{
    tipo: "sucesso" | "erro" | "info";
    mensagem: string;
  } | null>(null);
  const form = useForm<
    CaracterizacaoCaldeiraInput,
    unknown,
    CaracterizacaoCaldeiraData
  >({
    resolver: zodResolver(caracterizacaoCaldeiraSchema),
    defaultValues: valoresIniciais,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const errosIdentificacao = form.formState.errors.identificacao;
  const errosFabricante = form.formState.errors.fabricante;
  const errosTecnicos = form.formState.errors.dadosTecnicos;
  const errosCombustiveis = form.formState.errors.combustiveis;

  function onSubmit(dados: CaracterizacaoCaldeiraData) {
    void dados;
    setFeedback({
      tipo: "sucesso",
      mensagem:
        "Dados validados. O envio para gravação no servidor ainda não está disponível.",
    });
    // TODO: integrar o envio com a API de cadastro de equipamentos.
  }

  function cancelar() {
    form.reset(valoresIniciais);
    setFeedback({
      tipo: "info",
      mensagem: "As alterações deste formulário foram descartadas.",
    });
  }

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit, () =>
          setFeedback({
            tipo: "erro",
            mensagem: "Não foi possível validar. Revise os campos indicados.",
          })
        )}
        className="space-y-5"
      >
        <p className="text-sm text-slate-400">
          <span className="text-rose-300">*</span> Campos obrigatórios
        </p>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
          <section
            aria-labelledby="identificacao-heading"
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/10"
          >
            <CabecalhoSecao
              numero={1}
              titulo="Identificação"
              id="identificacao-heading"
            />
            <div className="space-y-4">
              <CampoTexto
                id="descricao-curta"
                label="Descrição Curta"
                name="identificacao.descricaoCurta"
                error={errosIdentificacao?.descricaoCurta?.message}
              />
              <CampoTexto
                id="numero-equipamento"
                label="Nr. Equipamento"
                name="identificacao.numeroEquipamento"
                error={errosIdentificacao?.numeroEquipamento?.message}
              />
              <CampoTexto
                id="descricao-equipamento"
                label="Descrição do Equipamento"
                name="identificacao.descricaoEquipamento"
                error={errosIdentificacao?.descricaoEquipamento?.message}
              />
              <CampoTexto
                id="numero-posicao-operacional"
                label="Nr. Posição Operacional"
                name="identificacao.numeroPosicaoOperacional"
                error={errosIdentificacao?.numeroPosicaoOperacional?.message}
              />
              <CampoTexto
                id="descricao-posicao"
                label="Descrição da Posição"
                name="identificacao.descricaoPosicao"
                error={errosIdentificacao?.descricaoPosicao?.message}
              />
              <CampoSelect
                id="categoria-nr13"
                label="Categoria NR-13"
                name="identificacao.categoriaNr13"
                options={categoriasNr13}
                error={errosIdentificacao?.categoriaNr13?.message}
              />
              <CampoTexto
                id="data-inicio-operacao"
                label="Data do Início de Operação"
                name="identificacao.dataInicioOperacao"
                type="date"
                error={errosIdentificacao?.dataInicioOperacao?.message}
              />
            </div>
          </section>

          <section
            aria-labelledby="fabricante-heading"
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/10"
          >
            <CabecalhoSecao
              numero={2}
              titulo="Fabricante"
              id="fabricante-heading"
            />
            <div className="space-y-4">
              <CampoTexto
                id="fabricante-nome"
                label="Nome do Fabricante"
                name="fabricante.nome"
                error={errosFabricante?.nome?.message}
              />
              <CampoTexto
                id="fabricante-modelo"
                label="Modelo do Fabricante"
                name="fabricante.modelo"
                error={errosFabricante?.modelo?.message}
              />
              <CampoTexto
                id="fabricante-numero-serie"
                label="Nr. de Série"
                name="fabricante.numeroSerie"
                error={errosFabricante?.numeroSerie?.message}
              />
              <CampoTexto
                id="ordem-fabricacao"
                label="Nr. Ordem de Fabricação"
                name="fabricante.numeroOrdemFabricacao"
                error={errosFabricante?.numeroOrdemFabricacao?.message}
              />
              <CampoSelect
                id="fabricante-forma-construtiva"
                label="Forma Construtiva"
                name="fabricante.formaConstrutiva"
                options={formasConstrutivasCaldeira}
                error={errosFabricante?.formaConstrutiva?.message}
              />
              <CampoSelect
                id="fabricante-vapor-gerado"
                label="Vapor Gerado"
                name="fabricante.vaporGerado"
                options={tiposVaporGerado}
                error={errosFabricante?.vaporGerado?.message}
              />
            </div>
          </section>

          <section
            aria-labelledby="dados-tecnicos-heading"
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/10"
          >
            <CabecalhoSecao
              numero={3}
              titulo="Dados Técnicos"
              id="dados-tecnicos-heading"
            />
            <div className="space-y-4">
              <CampoNumerico
                id="capacidade-geracao-vapor"
                label="Capacidade de Geração de Vapor (kg/hr)"
                name="dadosTecnicos.capacidadeGeracaoVapor"
                error={errosTecnicos?.capacidadeGeracaoVapor?.message}
              />
              <CampoNumerico
                id="capacidade-queima-solidos"
                label="Capacidade de Queima de Sólidos Secos (tss/Dia)"
                name="dadosTecnicos.capacidadeQueimaSolidos"
                error={errosTecnicos?.capacidadeQueimaSolidos?.message}
              />
              <CampoNumerico
                id="pmta"
                label="PMTA (bar)"
                name="dadosTecnicos.pmta"
                error={errosTecnicos?.pmta?.message}
              />
              <CampoNumerico
                id="pressao-nominal-trabalho"
                label="Pressão Nominal de Trabalho (bar)"
                name="dadosTecnicos.pressaoNominalTrabalho"
                error={errosTecnicos?.pressaoNominalTrabalho?.message}
              />
              <CampoNumerico
                id="pressao-saida-vapor"
                label="Pressão de Saída de Vapor (bar)"
                name="dadosTecnicos.pressaoSaidaVapor"
                error={errosTecnicos?.pressaoSaidaVapor?.message}
              />
              <CampoNumerico
                id="temperatura-vapor-processo"
                label="Temperatura de Vapor p/ Processo (°C)"
                name="dadosTecnicos.temperaturaVaporProcesso"
                error={errosTecnicos?.temperaturaVaporProcesso?.message}
              />
              <CampoSelect
                id="natureza-vapor-gerado"
                label="Natureza do Vapor Gerado"
                name="dadosTecnicos.naturezaVaporGerado"
                options={tiposVaporGerado}
                error={errosTecnicos?.naturezaVaporGerado?.message}
              />
              <CampoNumerico
                id="superficie-aquecimento"
                label="Superfície de Aquecimento (m²)"
                name="dadosTecnicos.superficieAquecimento"
                error={errosTecnicos?.superficieAquecimento?.message}
              />
              <CampoSelect
                id="dados-forma-construtiva"
                label="Forma Construtiva"
                name="dadosTecnicos.formaConstrutiva"
                options={formasConstrutivasCaldeira}
                error={errosTecnicos?.formaConstrutiva?.message}
              />
            </div>
            {/* TODO: confirmar se a forma construtiva dos dados técnicos deve permanecer duplicada. */}
          </section>

          <section
            aria-labelledby="combustiveis-heading"
            className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-black/10"
          >
            <CabecalhoSecao
              numero={4}
              titulo="Combustíveis"
              id="combustiveis-heading"
            />
            <div className="space-y-4">
              <CampoTexto
                id="combustivel-principal"
                label="Combustível Principal"
                name="combustiveis.principal"
                error={errosCombustiveis?.principal?.message}
              />
              <CampoTexto
                id="combustivel-auxiliar-1"
                label="Combustível auxiliar-1"
                name="combustiveis.auxiliar1"
                required={false}
                error={errosCombustiveis?.auxiliar1?.message}
              />
              <CampoTexto
                id="combustivel-auxiliar-2"
                label="Combustível auxiliar-2"
                name="combustiveis.auxiliar2"
                required={false}
                error={errosCombustiveis?.auxiliar2?.message}
              />
            </div>
          </section>
        </div>

        {/* TODO: confirmar se Vapor Gerado e Natureza do Vapor Gerado são campos distintos. */}
        {feedback && (
          <p
            role={feedback.tipo === "erro" ? "alert" : "status"}
            className={`rounded-lg border px-4 py-3 text-sm ${
              feedback.tipo === "erro"
                ? "border-rose-800 bg-rose-950/50 text-rose-200"
                : feedback.tipo === "sucesso"
                  ? "border-emerald-800 bg-emerald-950/40 text-emerald-200"
                  : "border-slate-700 bg-slate-900 text-slate-200"
            }`}
          >
            {feedback.mensagem}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelar}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Cancelar
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
