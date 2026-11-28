"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { CaracterizacaoFormData } from "@/lib/schemas";
import { formatarCnpj } from "@/lib/utils";

const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 disabled:cursor-not-allowed disabled:opacity-60";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm text-rose-300" role="alert">
      {message}
    </p>
  );
}

export default function FormularioProprietario() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CaracterizacaoFormData>();

  const nomeError = errors.proprietario?.nome?.message;
  const enderecoError = errors.proprietario?.endereco?.message;

  return (
    <section
      aria-labelledby="proprietario-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 1
        </p>
        <h2
          id="proprietario-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Cadastro do proprietário
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Informe os dados da empresa responsável pelo equipamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="proprietario-nome"
            className="text-sm font-medium text-slate-200"
          >
            Nome <span className="text-rose-300">*</span>
          </label>
          <input
            id="proprietario-nome"
            autoComplete="organization"
            className={inputClassName}
            placeholder="Razão social ou nome do proprietário"
            required
            aria-invalid={Boolean(nomeError)}
            aria-describedby={nomeError ? "proprietario-nome-error" : undefined}
            {...register("proprietario.nome")}
          />
          <FieldError id="proprietario-nome-error" message={nomeError} />
        </div>

        <div>
          <label
            htmlFor="proprietario-cnpj"
            className="text-sm font-medium text-slate-200"
          >
            CNPJ <span className="text-rose-300">*</span>
          </label>
          <Controller
            name="proprietario.cnpj"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input
                  {...field}
                  id="proprietario-cnpj"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={18}
                  className={inputClassName}
                  placeholder="00.000.000/0000-00"
                  required
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "proprietario-cnpj-error" : undefined
                  }
                  onChange={(event) =>
                    field.onChange(formatarCnpj(event.target.value))
                  }
                />
                <FieldError
                  id="proprietario-cnpj-error"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="proprietario-endereco"
            className="text-sm font-medium text-slate-200"
          >
            Endereço <span className="text-rose-300">*</span>
          </label>
          <input
            id="proprietario-endereco"
            autoComplete="street-address"
            className={inputClassName}
            placeholder="Rua, número, complemento, cidade e estado"
            required
            aria-invalid={Boolean(enderecoError)}
            aria-describedby={
              enderecoError ? "proprietario-endereco-error" : undefined
            }
            {...register("proprietario.endereco")}
          />
          <FieldError id="proprietario-endereco-error" message={enderecoError} />
        </div>
      </div>
    </section>
  );
}
