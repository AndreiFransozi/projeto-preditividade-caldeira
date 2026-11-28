"use client";

import { Controller, useFormContext } from "react-hook-form";
import type { InspecaoFormData, InspecaoFormInput } from "@/lib/schemas";
import { formatarData } from "@/lib/utils";
import FieldError from "@/components/ui/FieldError";

const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30";

export default function SecaoDadosInspecao() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();
  const erros = errors.inspecao;

  return (
    <section
      aria-labelledby="dados-inspecao-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 2
        </p>
        <h2
          id="dados-inspecao-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Dados da inspeção
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="data-inspecao"
            className="text-sm font-medium text-slate-200"
          >
            Data de inspeção <span className="text-rose-300">*</span>
          </label>
          <Controller
            name="inspecao.dataInspecao"
            control={control}
            render={({ field, fieldState }) => (
              <>
                <input
                  {...field}
                  id="data-inspecao"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                  required
                  className={inputClassName}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.error ? "data-inspecao-erro" : undefined
                  }
                  onChange={(event) =>
                    field.onChange(formatarData(event.target.value))
                  }
                />
                <FieldError
                  id="data-inspecao-erro"
                  message={fieldState.error?.message}
                />
              </>
            )}
          />
        </div>

        <div>
          <label
            htmlFor="numero-art"
            className="text-sm font-medium text-slate-200"
          >
            Número da Anotação de Responsabilidade Técnica (ART) do CREA{" "}
            <span className="text-rose-300">*</span>
          </label>
          <input
            id="numero-art"
            type="text"
            maxLength={20}
            autoComplete="off"
            required
            className={inputClassName}
            aria-invalid={Boolean(erros?.numeroArt)}
            aria-describedby={
              erros?.numeroArt ? "numero-art-erro" : undefined
            }
            {...register("inspecao.numeroArt")}
          />
          <FieldError
            id="numero-art-erro"
            message={erros?.numeroArt?.message}
          />
        </div>
      </div>
    </section>
  );
}
