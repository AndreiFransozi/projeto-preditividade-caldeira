import type { Metadata } from "next";
import FormularioCaldeira from "@/components/caldeira/FormularioCaldeira";

export const metadata: Metadata = {
  title: "Caracterização da Caldeira",
  description: "Identificação e dados técnicos da caldeira.",
};

export default function CaldeiraPage() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
            SafeLife AI · Equipamentos · Etapa 2
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Caracterização da Caldeira
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Preencha a identificação, os dados do fabricante, as informações
            técnicas e os combustíveis da caldeira.
          </p>
        </header>

        <FormularioCaldeira />
      </div>
    </main>
  );
}
