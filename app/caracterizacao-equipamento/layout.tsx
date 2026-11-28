import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Caracterização de equipamento",
  description: "Cadastro dos dados do proprietário e da pessoa responsável pela caldeira.",
};

export default function CaracterizacaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
