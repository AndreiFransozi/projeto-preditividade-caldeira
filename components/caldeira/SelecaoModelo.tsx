"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type {
  CaldeiraFormData,
  CaldeiraFormInput,
} from "@/lib/schemas";
import { normalizarTexto } from "@/lib/utils";
import { useTipoCaldeira, type TipoCaldeira } from "@/contexts/TipoCaldeiraContext";
import DropdownMenu, { type DropdownOption } from "@/components/ui/DropdownMenu";

const modelosPadrao: DropdownOption[] = [
  { value: "Aquatubular", label: "Aquatubular" },
  { value: "Flamotubular", label: "Flamotubular" },
  { value: "Mista", label: "Mista" },
];

export default function SelecaoModelo() {
  const { control } = useFormContext<
    CaldeiraFormInput,
    unknown,
    CaldeiraFormData
  >();
  const modeloSelecionado = useWatch({
    control,
    name: "identificacao.modelo",
  });
  const { setTipoCaldeira } = useTipoCaldeira();
  const [modelosPersonalizados, setModelosPersonalizados] = useState<string[]>(
    []
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeModelo, setNomeModelo] = useState("");
  const [erroModelo, setErroModelo] = useState("");

  const opcoes: DropdownOption[] = [
    ...modelosPadrao,
    ...modelosPersonalizados.map((modelo) => ({
      value: modelo,
      label: modelo,
    })),
  ];

  useEffect(() => {
    const tipoPorModelo: Record<string, TipoCaldeira> = {
      aquatubular: "aquatubular",
      flamotubular: "flamotubular",
      mista: "mista",
    };
    setTipoCaldeira(
      tipoPorModelo[normalizarTexto(modeloSelecionado ?? "")] ?? null
    );
  }, [modeloSelecionado, setTipoCaldeira]);

  return (
    <Controller
      name="identificacao.modelo"
      control={control}
      render={({ field, fieldState }) => {
        function cadastrarModelo() {
          const nome = nomeModelo.trim();
          if (!nome) {
            setErroModelo("Informe o nome do modelo.");
            return;
          }

          const existente = opcoes.find(
            (opcao) => normalizarTexto(opcao.label) === normalizarTexto(nome)
          );
          const modeloSelecionado = existente?.value ?? nome;

          if (!existente) {
            setModelosPersonalizados((atuais) => [...atuais, nome]);
            // TODO: persistir o modelo personalizado na API.
          }

          field.onChange(modeloSelecionado);
          setModalAberto(false);
          setNomeModelo("");
          setErroModelo("");
        }

        return (
          <>
          <DropdownMenu
            id="identificacao-modelo-trigger"
            labelledBy="identificacao-modelo-label"
            buttonText={
              field.value ? `Modelo: ${field.value}` : "Modelos"
            }
            options={opcoes}
            value={field.value ?? ""}
            onSelect={field.onChange}
            actionLabel="Cadastrar modelo..."
            required
            onAction={() => {
              setNomeModelo("");
              setErroModelo("");
              setModalAberto(true);
            }}
            error={fieldState.error?.message}
          />

          {modalAberto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setModalAberto(false);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setModalAberto(false);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="novo-modelo-titulo"
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/50"
              >
                <h2
                  id="novo-modelo-titulo"
                  className="text-xl font-semibold text-white"
                >
                  Cadastrar modelo
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Adicione um modelo à lista deste cadastro.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="novo-modelo-nome"
                    className="text-sm font-medium text-slate-200"
                  >
                    Nome do modelo <span className="text-rose-300">*</span>
                  </label>
                  <input
                    id="novo-modelo-nome"
                    autoFocus
                    value={nomeModelo}
                    required
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        cadastrarModelo();
                      }
                    }}
                    onChange={(event) => {
                      setNomeModelo(event.target.value);
                      setErroModelo("");
                    }}
                    className="mt-2 block w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
                    aria-invalid={Boolean(erroModelo)}
                    aria-describedby={
                      erroModelo ? "novo-modelo-erro" : undefined
                    }
                  />
                  {erroModelo && (
                    <p
                      id="novo-modelo-erro"
                      role="alert"
                      className="mt-1.5 text-sm text-rose-300"
                    >
                      {erroModelo}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setModalAberto(false);
                      setErroModelo("");
                    }}
                    className="min-h-11 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={cadastrarModelo}
                    className="min-h-11 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
        );
      }}
    />
  );
}
