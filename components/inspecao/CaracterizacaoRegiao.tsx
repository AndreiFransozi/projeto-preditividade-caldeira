"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { InspecaoFormInput, InspecaoFormData } from "@/lib/schemas";
import type { CaracterizacaoRegiaoFormData } from "@/lib/schemas";
import { dataEhFutura, formatarData, parseNumero, validarDataReal } from "@/lib/utils";
import FieldError from "@/components/ui/FieldError";
import SelectMaterial from "@/components/inspecao/SelectMaterial";

export type CaminhoCaracterizacao =
  | `inspecao.regioesFlamotubulares.${number}.caracterizacao`
  | `inspecao.regioesAquatubulares.${number}.subRegioes.${number}.caracterizacao`;
export type CaminhoMaterial = `${CaminhoCaracterizacao}.material`;

type CampoNumericoCaracterizacao =
  | "temperaturaCalculo"
  | "tensaoMaximaAdmissivel"
  | "pressaoCalculo"
  | "diametroExterno"
  | "espessuraMinimaCalculada"
  | "espessuraMinimaRecomendada"
  | "espessuraNominal";
type CaminhoCampo = `${CaminhoCaracterizacao}.${CampoNumericoCaracterizacao}`;

const camposNumericos: {
  campo: CampoNumericoCaracterizacao;
  rotulo: string;
  unidade: string;
}[] = [
  {
    campo: "temperaturaCalculo",
    rotulo: "Temperatura de cálculo",
    unidade: "°C",
  },
  {
    campo: "tensaoMaximaAdmissivel",
    rotulo: "Tensão máxima admissível",
    unidade: "MPa",
  },
  { campo: "pressaoCalculo", rotulo: "Pressão de cálculo", unidade: "MPa" },
  { campo: "diametroExterno", rotulo: "Diâmetro externo", unidade: "mm" },
  {
    campo: "espessuraMinimaCalculada",
    rotulo: "Espessura mínima calculada",
    unidade: "mm",
  },
  {
    campo: "espessuraMinimaRecomendada",
    rotulo: "Espessura mínima recomendada",
    unidade: "mm",
  },
  { campo: "espessuraNominal", rotulo: "Espessura nominal", unidade: "mm" },
];

const camposObrigatorios: (keyof CaracterizacaoRegiaoFormData)[] = [
  "material",
  ...camposNumericos.map(({ campo }) => campo),
  "dataInicioOperacao",
];

export type StatusCaracterizacao =
  | "Não preenchida"
  | "Incompleta"
  | "Completa";

export function obterStatusCaracterizacao(
  valores: CaracterizacaoRegiaoFormData,
  tipoCamara?: string
): StatusCaracterizacao {
  const possuiDados = camposObrigatorios.some((campo) =>
    valores[campo].trim()
  );
  if (!possuiDados && !tipoCamara) return "Não preenchida";
  if (camposObrigatorios.some((campo) => !valores[campo].trim())) {
    return "Incompleta";
  }
  if (tipoCamara === "") return "Incompleta";

  const numerosValidos = camposNumericos.every(({ campo }) => {
    const numero = parseNumero(valores[campo]);
    return Number.isFinite(numero) && numero > 0;
  });
  if (!numerosValidos) return "Incompleta";
  if (
    parseNumero(valores.espessuraNominal) <
    parseNumero(valores.espessuraMinimaRecomendada)
  ) {
    return "Incompleta";
  }
  if (
    !validarDataReal(valores.dataInicioOperacao) ||
    dataEhFutura(valores.dataInicioOperacao)
  ) {
    return "Incompleta";
  }
  return "Completa";
}

interface CaracterizacaoRegiaoProps {
  caminho: CaminhoCaracterizacao;
  idPrefixo: string;
  materiais: string[];
  onAdicionarMaterial: (nome: string) => string;
  tipoCamara?: string;
}

export default function CaracterizacaoRegiao({
  caminho,
  idPrefixo,
  materiais,
  onAdicionarMaterial,
  tipoCamara,
}: CaracterizacaoRegiaoProps) {
  const {
    control,
    register,
    getFieldState,
    formState,
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const valores = useWatch({ control, name: caminho });
  const possuiDados = camposObrigatorios.some((campo) =>
    valores?.[campo]?.trim()
  );
  const obrigatorio = Boolean(possuiDados || tipoCamara);
  const campoMaterial = `${caminho}.material` as CaminhoMaterial;
  const caminhoData = `${caminho}.dataInicioOperacao` as
    | `${CaminhoCaracterizacao}.dataInicioOperacao`;
  const dataState = getFieldState(caminhoData, formState);

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <SelectMaterial
          name={campoMaterial}
          id={`${idPrefixo}-material`}
          materiais={materiais}
          obrigatorio={obrigatorio}
          onAdicionarMaterial={onAdicionarMaterial}
        />

        {camposNumericos.map(({ campo, rotulo, unidade }) => {
          const name = `${caminho}.${campo}` as CaminhoCampo;
          const id = `${idPrefixo}-${campo}`;
          const error = getFieldState(name, formState).error?.message;

          return (
            <div key={campo}>
              <label
                htmlFor={id}
                className="text-sm font-medium text-slate-200"
              >
                {rotulo}{" "}
                {obrigatorio && <span className="text-rose-300">*</span>}
              </label>
              <div className="relative">
                <input
                  id={id}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required={obrigatorio}
                  className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-3 pr-16 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
                    error ? "border-rose-400" : "border-slate-600"
                  }`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? `${id}-erro` : undefined}
                  {...register(name)}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-slate-400"
                >
                  {unidade}
                </span>
              </div>
              <FieldError id={`${id}-erro`} message={error} />
            </div>
          );
        })}

        <div>
          <label
            htmlFor={`${idPrefixo}-data-inicio`}
            className="text-sm font-medium text-slate-200"
          >
            Data de início da operação desta região{" "}
            {obrigatorio && <span className="text-rose-300">*</span>}
          </label>
          <Controller
            name={caminhoData}
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  id={`${idPrefixo}-data-inicio`}
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                  required={obrigatorio}
                  className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
                    dataState.error ? "border-rose-400" : "border-slate-600"
                  }`}
                  aria-invalid={dataState.invalid}
                  aria-describedby={
                    dataState.error ? `${idPrefixo}-data-inicio-erro` : undefined
                  }
                  onChange={(event) =>
                    field.onChange(formatarData(event.target.value))
                  }
                />
                <FieldError
                  id={`${idPrefixo}-data-inicio-erro`}
                  message={dataState.error?.message}
                />
              </>
            )}
          />
        </div>
      </div>
    </div>
  );
}
