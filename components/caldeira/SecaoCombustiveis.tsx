"use client";

import { useState } from "react";
import SelectCombustivel, {
  type CampoCombustivel,
} from "@/components/caldeira/SelectCombustivel";
import {
  combustiveisDisponiveis,
  type CaldeiraFormData,
  type CaldeiraFormInput,
} from "@/lib/schemas";
import { normalizarTexto } from "@/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import type { DropdownOption } from "@/components/ui/DropdownMenu";

const campos: {
  campo: CampoCombustivel;
  rotulo: string;
  aceitaNenhum: boolean;
}[] = [
  {
    campo: "principal",
    rotulo: "Combustível principal",
    aceitaNenhum: false,
  },
  {
    campo: "auxiliar1",
    rotulo: "Combustível auxiliar 1",
    aceitaNenhum: true,
  },
  {
    campo: "auxiliar2",
    rotulo: "Combustível auxiliar 2",
    aceitaNenhum: true,
  },
];

export default function SecaoCombustiveis() {
  const [opcoesPersonalizadas, setOpcoesPersonalizadas] = useState<
    DropdownOption[]
  >([]);
  const { control } = useFormContext<
    CaldeiraFormInput,
    unknown,
    CaldeiraFormData
  >();
  const tipoAuxiliar1 = useWatch({
    control,
    name: "combustiveis.auxiliar1.tipo",
  });

  function salvarOpcao(nome: string) {
    const nomeNormalizado = normalizarTexto(nome);
    if (!nomeNormalizado) return;
    if (
      combustiveisDisponiveis.some(
        (opcao) => normalizarTexto(opcao.label) === nomeNormalizado
      )
    ) {
      return;
    }

    setOpcoesPersonalizadas((atuais) => {
      if (
        atuais.some(
          (opcao) => normalizarTexto(opcao.label) === nomeNormalizado
        )
      ) {
        return atuais;
      }

      const slug = nomeNormalizado
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const id = `${slug || "combustivel"}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`;

      return [...atuais, { value: `custom:${id}`, label: nome.trim() }];
    });
    // TODO: persistir a opção de combustível na API.
  }

  const opcoes: DropdownOption[] = [
    ...combustiveisDisponiveis,
    ...opcoesPersonalizadas,
  ];

  return (
    <section
      aria-labelledby="combustiveis-heading"
      className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5 shadow-xl shadow-black/10 sm:p-7"
    >
      <div className="mb-6 border-b border-slate-700 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
          Seção 5
        </p>
        <h2
          id="combustiveis-heading"
          className="mt-1 text-xl font-semibold text-white"
        >
          Combustíveis
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Defina o combustível principal e, se necessário, os auxiliares.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {campos.map(({ campo, rotulo, aceitaNenhum }) => (
          <SelectCombustivel
            key={campo}
            campo={campo}
            rotulo={rotulo}
            aceitaNenhum={aceitaNenhum}
            desabilitado={campo === "auxiliar2" && !tipoAuxiliar1}
            opcoes={opcoes}
            onSalvarOpcao={salvarOpcao}
          />
        ))}
      </div>
    </section>
  );
}
