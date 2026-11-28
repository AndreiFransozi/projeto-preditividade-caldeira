"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { InspecaoFormData, InspecaoFormInput } from "@/lib/schemas";
import { ufsCrea } from "@/lib/constants";
import FieldError from "@/components/ui/FieldError";

const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30";

export default function SecaoEmpresaResponsavel() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const erros = errors.inspecao;

  return (
    <section
      aria-labelledby="empresa-responsavel-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 1
        </p>
        <h2
          id="empresa-responsavel-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Empresa e responsável técnico
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Informe a empresa de inspeção e os dados do profissional legalmente habilitado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label
            htmlFor="empresa-inspecao"
            className="text-sm font-medium text-slate-200"
          >
            Empresa de inspeção <span className="text-rose-300">*</span>
          </label>
          <input
            id="empresa-inspecao"
            autoComplete="organization"
            required
            className={inputClassName}
            aria-invalid={Boolean(erros?.empresaInspecao)}
            aria-describedby={
              erros?.empresaInspecao ? "empresa-inspecao-erro" : undefined
            }
            {...register("inspecao.empresaInspecao")}
          />
          <FieldError
            id="empresa-inspecao-erro"
            message={erros?.empresaInspecao?.message}
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="responsavel-tecnico"
            className="text-sm font-medium text-slate-200"
          >
            Responsável técnico (PLH){" "}
            <span className="text-rose-300">*</span>
          </label>
          <input
            id="responsavel-tecnico"
            autoComplete="name"
            required
            className={inputClassName}
            aria-invalid={Boolean(erros?.responsavelTecnico)}
            aria-describedby={
              erros?.responsavelTecnico
                ? "responsavel-tecnico-erro"
                : undefined
            }
            {...register("inspecao.responsavelTecnico")}
          />
          <FieldError
            id="responsavel-tecnico-erro"
            message={erros?.responsavelTecnico?.message}
          />
        </div>

        <div>
          <label
            htmlFor="numero-crea-plh"
            className="text-sm font-medium text-slate-200"
          >
            Número do CREA do PLH <span className="text-rose-300">*</span>
          </label>
          <Controller
            name="inspecao.numeroCreaPlh"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input
                  {...field}
                  id="numero-crea-plh"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "numero-crea-plh-erro" : undefined
                  }
                  onChange={(event) =>
                    field.onChange(event.target.value.replace(/\D/g, ""))
                  }
                />
                <FieldError
                  id="numero-crea-plh-erro"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </div>

        <div>
          <label
            htmlFor="uf-crea"
            className="text-sm font-medium text-slate-200"
          >
            UF do CREA <span className="text-rose-300">*</span>
          </label>
          <select
            id="uf-crea"
            required
            className={`${inputClassName} ${
              erros?.ufCrea ? "border-rose-400" : ""
            }`}
            aria-invalid={Boolean(erros?.ufCrea)}
            aria-describedby={erros?.ufCrea ? "uf-crea-erro" : undefined}
            {...register("inspecao.ufCrea")}
          >
            <option value="">Selecione...</option>
            {ufsCrea.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
          <FieldError id="uf-crea-erro" message={erros?.ufCrea?.message} />
        </div>
      </div>
    </section>
  );
}
