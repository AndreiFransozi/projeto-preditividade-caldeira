"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormularioProprietario from "@/components/caracterizacao/FormularioProprietario";
import ResponsavelCaldeira from "@/components/caracterizacao/ResponsavelCaldeira";
import {
  caracterizacaoSchema,
  type CaracterizacaoFormData,
} from "@/lib/schemas";

export default function CaracterizacaoEquipamentoPage() {
  const form = useForm<CaracterizacaoFormData>({
    resolver: zodResolver(caracterizacaoSchema),
    defaultValues: {
      proprietario: {
        nome: "",
        endereco: "",
        cnpj: "",
      },
      responsavelCaldeira: {
        nome: "",
        telefone: "",
      },
    },
    mode: "onSubmit",
  });

  function onSubmit(dados: CaracterizacaoFormData) {
    console.log("Caracterização do equipamento:", dados);
    // TODO: integrar com a API de cadastro de equipamentos.
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
            SafeLife AI · Equipamentos
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Caracterização de equipamento
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Cadastre os dados do proprietário e indique a pessoa responsável pela
            operação ou manutenção da caldeira.
          </p>
        </header>

        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FormularioProprietario />
            <ResponsavelCaldeira />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => form.reset()}
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
      </div>
    </main>
  );
}
