"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import type {
  CaldeiraFormData,
  CaldeiraFormInput,
} from "@/lib/schemas";
import DropdownMenu, {
  type DropdownOption,
} from "@/components/ui/DropdownMenu";
import FieldError from "@/components/ui/FieldError";

export type CampoCombustivel = "principal" | "auxiliar1" | "auxiliar2";
type CaminhoTipo = `combustiveis.${CampoCombustivel}.tipo`;
type CaminhoTexto = `combustiveis.${CampoCombustivel}.outroTexto`;
type CaminhoSalvar = `combustiveis.${CampoCombustivel}.salvarComoOpcao`;
const NENHUM_VALUE = "__nenhum__";

const caminhosTexto: Record<CampoCombustivel, CaminhoTexto> = {
  principal: "combustiveis.principal.outroTexto",
  auxiliar1: "combustiveis.auxiliar1.outroTexto",
  auxiliar2: "combustiveis.auxiliar2.outroTexto",
};

const caminhosSalvar: Record<CampoCombustivel, CaminhoSalvar> = {
  principal: "combustiveis.principal.salvarComoOpcao",
  auxiliar1: "combustiveis.auxiliar1.salvarComoOpcao",
  auxiliar2: "combustiveis.auxiliar2.salvarComoOpcao",
};

interface SelectCombustivelProps {
  campo: CampoCombustivel;
  rotulo: string;
  aceitaNenhum?: boolean;
  desabilitado?: boolean;
  opcoes: DropdownOption[];
  onSalvarOpcao: (nome: string) => void;
}

export default function SelectCombustivel({
  campo,
  rotulo,
  aceitaNenhum = false,
  desabilitado = false,
  opcoes,
  onSalvarOpcao,
}: SelectCombustivelProps) {
  const { control, setValue } = useFormContext<
    CaldeiraFormInput,
    unknown,
    CaldeiraFormData
  >();
  const caminhoTipo = `combustiveis.${campo}.tipo` as CaminhoTipo;
  const caminhoTexto = caminhosTexto[campo];
  const caminhoSalvar = caminhosSalvar[campo];
  const tipoAtual = useWatch({ control, name: caminhoTipo });
  const textoAtual = useWatch({ control, name: caminhoTexto });
  const nomeCombustivel = textoAtual?.trim() ?? "";
  const opcoesMenu: DropdownOption[] = [
    ...(aceitaNenhum
      ? [{ value: NENHUM_VALUE, label: "Nenhum" }]
      : []),
    ...opcoes,
    { value: "outro", label: "Outro (especificar)" },
  ];

  return (
    <div>
      <label
        htmlFor={`${campo}-combustivel-trigger`}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        <span id={`${campo}-combustivel-label`}>{rotulo}</span>
        {campo === "principal" && (
          <span className="ml-1 text-rose-300">*</span>
        )}
      </label>

      <Controller
        name={caminhoTipo}
        control={control}
        render={({ field, fieldState }) => {
          const valor = field.value ?? "";
          const opcaoAtual = opcoesMenu.find(
            (opcao) => opcao.value === valor
          );

          return (
            <DropdownMenu
              id={`${campo}-combustivel-trigger`}
              labelledBy={`${campo}-combustivel-label`}
              buttonText={opcaoAtual?.label ?? "Selecione..."}
              options={opcoesMenu}
              value={valor}
              disabled={desabilitado}
              required={campo === "principal"}
              error={fieldState.error?.message}
              onSelect={(novoValor) => {
                const valorSelecionado =
                  novoValor === NENHUM_VALUE ? "" : novoValor;
                field.onChange(valorSelecionado);
                if (valorSelecionado !== "outro") {
                  setValue(caminhoSalvar, false, { shouldDirty: true });
                }

                if (valorSelecionado.startsWith("custom:")) {
                  const combustivelPersonalizado = opcoesMenu.find(
                    (opcao) => opcao.value === valorSelecionado
                  );
                  if (combustivelPersonalizado) {
                    setValue(caminhoTexto, combustivelPersonalizado.label, {
                      shouldDirty: true,
                    });
                  }
                }

                if (campo === "auxiliar1" && !valorSelecionado) {
                  setValue("combustiveis.auxiliar2.tipo", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue(
                    "combustiveis.auxiliar2.salvarComoOpcao",
                    false,
                    { shouldDirty: true }
                  );
                }
              }}
            />
          );
        }}
      />

      {tipoAtual === "outro" && (
        <Controller
          name={caminhoTexto}
          control={control}
          render={({ field, fieldState }) => (
            <div className="mt-4">
              <label
                htmlFor={`${campo}-outro-texto`}
                className="text-sm font-medium text-slate-200"
              >
                Qual combustível? <span className="text-rose-300">*</span>
              </label>
              <input
                {...field}
                id={`${campo}-outro-texto`}
                type="text"
                maxLength={60}
                className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
                placeholder="Informe o combustível"
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.error ? `${campo}-outro-erro` : undefined
                }
              />
              <FieldError
                id={`${campo}-outro-erro`}
                message={fieldState.error?.message}
              />
            </div>
          )}
        />
      )}

      {tipoAtual === "outro" && nomeCombustivel && (
        <Controller
          name={caminhoSalvar}
          control={control}
          render={({ field }) => (
            <label
              htmlFor={`${campo}-salvar-opcao`}
              className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-300"
            >
              <input
                ref={field.ref}
                id={`${campo}-salvar-opcao`}
                name={field.name}
                type="checkbox"
                checked={Boolean(field.value)}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const marcado = event.target.checked;
                  field.onChange(marcado);
                  if (marcado) onSalvarOpcao(nomeCombustivel);
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-500 bg-slate-800 text-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400"
              />
              <span>Salvar como opção</span>
            </label>
          )}
        />
      )}
    </div>
  );
}
