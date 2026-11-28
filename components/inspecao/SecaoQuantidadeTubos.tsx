"use client";

import { useFormContext } from "react-hook-form";
import type {
  InspecaoFormData,
  InspecaoFormInput,
} from "@/lib/schemas";
import FieldError from "@/components/ui/FieldError";

type CaminhoQuantidadeTubo =
  `inspecao.quantidadeTubos.${keyof InspecaoFormInput["inspecao"]["quantidadeTubos"]}`;

const campos = [
  { nome: "paredeFrontal", rotulo: "Parede frontal" },
  { nome: "paredeTraseira", rotulo: "Parede traseira" },
  {
    nome: "paredeLateralEsquerda",
    rotulo: "Parede lateral esquerda",
  },
  {
    nome: "paredeLateralDireita",
    rotulo: "Parede lateral direita",
  },
] as const;

export default function SecaoQuantidadeTubos() {
  const {
    register,
    getFieldState,
    formState,
  } = useFormContext<InspecaoFormInput, unknown, InspecaoFormData>();

  return (
    <section
      aria-labelledby="quantidade-tubos-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 5
        </p>
        <h2
          id="quantidade-tubos-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Quantidade de tubos
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {campos.map(({ nome, rotulo }) => {
          const id = `quantidade-tubos-${nome}`;
          const caminho: CaminhoQuantidadeTubo =
            `inspecao.quantidadeTubos.${nome}`;
          const error = getFieldState(caminho, formState).error?.message;

          return (
            <div key={nome}>
              <label
                htmlFor={id}
                className="text-sm font-medium text-slate-200"
              >
                {rotulo}
              </label>
              <input
                id={id}
                type="text"
                maxLength={20}
                className={`mt-2 block min-h-11 w-full rounded-lg border bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30 ${
                  error ? "border-rose-400" : "border-slate-600"
                }`}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-erro` : undefined}
                {...register(caminho)}
              />
              <FieldError id={`${id}-erro`} message={error} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
