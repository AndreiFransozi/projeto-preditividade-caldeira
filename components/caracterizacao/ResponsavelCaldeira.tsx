"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { CaracterizacaoFormData } from "@/lib/schemas";
import { formatarTelefone } from "@/lib/utils";

const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60";

const funcoes = [
  { valor: "operacao", rotulo: "Operação", descricao: "Rotina e acompanhamento" },
  {
    valor: "manutencao",
    rotulo: "Manutenção",
    descricao: "Inspeção e conservação",
  },
] as const;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm text-rose-300" role="alert">
      {message}
    </p>
  );
}

export default function ResponsavelCaldeira() {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CaracterizacaoFormData>();
  const funcao = watch("responsavelCaldeira.funcao");
  const funcaoError = errors.responsavelCaldeira?.funcao?.message;
  const nomeError = errors.responsavelCaldeira?.nome?.message;

  return (
    <section
      aria-labelledby="responsavel-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 2
        </p>
        <h2
          id="responsavel-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Pessoa da caldeira
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Selecione uma função e informe a pessoa responsável.
        </p>
      </div>

      <Controller
        name="responsavelCaldeira.funcao"
        control={control}
        render={({ field }) => (
          <fieldset>
            <legend className="text-sm font-medium text-slate-200">
              Função <span className="text-rose-300">*</span>
            </legend>
            <div
              role="radiogroup"
              aria-label="Função da pessoa responsável"
              aria-describedby={funcaoError ? "responsavel-funcao-error" : undefined}
              className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {funcoes.map((opcao) => (
                <label key={opcao.valor} className="cursor-pointer">
                  <input
                    className="peer sr-only"
                    type="radio"
                    name={field.name}
                    value={opcao.valor}
                    checked={field.value === opcao.valor}
                    onChange={() => field.onChange(opcao.valor)}
                    onBlur={field.onBlur}
                    ref={opcao.valor === "operacao" ? field.ref : undefined}
                    aria-invalid={Boolean(funcaoError)}
                  />
                  <span className="flex min-h-20 flex-col justify-center rounded-lg border border-slate-600 bg-slate-950/60 px-4 py-3 transition hover:border-slate-400 peer-checked:border-sky-400 peer-checked:bg-sky-400/10 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400/50">
                    <span className="font-semibold text-slate-100">
                      {opcao.rotulo}
                    </span>
                    <span className="mt-0.5 text-xs text-slate-400">
                      {opcao.descricao}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError
              id="responsavel-funcao-error"
              message={funcaoError}
            />
          </fieldset>
        )}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="responsavel-nome"
            className="text-sm font-medium text-slate-200"
          >
            Nome <span className="text-rose-300">*</span>
          </label>
          <input
            id="responsavel-nome"
            autoComplete="name"
            className={inputClassName}
            placeholder="Nome da pessoa responsável"
            disabled={!funcao}
            required
            aria-invalid={Boolean(nomeError)}
            aria-describedby={nomeError ? "responsavel-nome-error" : undefined}
            {...register("responsavelCaldeira.nome")}
          />
          <FieldError id="responsavel-nome-error" message={nomeError} />
        </div>

        <div>
          <label
            htmlFor="responsavel-telefone"
            className="text-sm font-medium text-slate-200"
          >
            Telefone <span className="text-rose-300">*</span>
          </label>
          <Controller
            name="responsavelCaldeira.telefone"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input
                  {...field}
                  id="responsavel-telefone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={15}
                  className={inputClassName}
                  placeholder="(00) 00000-0000"
                  disabled={!funcao}
                  required
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "responsavel-telefone-error" : undefined
                  }
                  onChange={(event) =>
                    field.onChange(formatarTelefone(event.target.value))
                  }
                />
                <FieldError
                  id="responsavel-telefone-error"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </div>
      </div>
    </section>
  );
}
