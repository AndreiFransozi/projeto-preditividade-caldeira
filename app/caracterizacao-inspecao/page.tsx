import type { Metadata } from "next";
import FormularioInspecao from "@/components/inspecao/FormularioInspecao";

export const metadata: Metadata = {
  title: "Caracterização de inspeção",
  description: "Cadastro dos dados e inspetores responsáveis pela inspeção.",
};

export default function CaracterizacaoInspecaoPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
            SafeLife AI · Equipamentos · Etapa 3
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Caracterização de inspeção
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Registre a empresa, os dados da inspeção e a equipe de engenharia responsável.
          </p>
        </header>

        <FormularioInspecao />
      </div>
    </main>
  );
}
