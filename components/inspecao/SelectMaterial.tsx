"use client";

import { useState, type KeyboardEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type {
  InspecaoFormData,
  InspecaoFormInput,
} from "@/lib/schemas";
import type { CaminhoMaterial } from "@/components/inspecao/CaracterizacaoRegiao";
import FieldError from "@/components/ui/FieldError";

const NOVO_MATERIAL = "__cadastrar_material__";
const inputClassName =
  "mt-2 block w-full rounded-lg border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30";

interface SelectMaterialProps {
  name: CaminhoMaterial;
  id: string;
  materiais: string[];
  obrigatorio: boolean;
  onAdicionarMaterial: (nome: string) => string;
}

export default function SelectMaterial({
  name,
  id,
  materiais,
  obrigatorio,
  onAdicionarMaterial,
}: SelectMaterialProps) {
  const { control } = useFormContext<
    InspecaoFormInput,
    unknown,
    InspecaoFormData
  >();
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [novoMaterial, setNovoMaterial] = useState("");
  const [erroCadastro, setErroCadastro] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        function adicionarMaterial() {
          const nome = novoMaterial.trim();
          if (!nome) {
            setErroCadastro("Informe o nome do material.");
            return;
          }

          field.onChange(onAdicionarMaterial(nome));
          setNovoMaterial("");
          setErroCadastro("");
          setMostrarCadastro(false);
        }

        function tratarEnter(event: KeyboardEvent<HTMLInputElement>) {
          if (event.key === "Enter") {
            event.preventDefault();
            adicionarMaterial();
          }
        }

        return (
          <div>
            <label
              htmlFor={id}
              className="text-sm font-medium text-slate-200"
            >
              Material{" "}
              {obrigatorio && <span className="text-rose-300">*</span>}
            </label>
            <select
              {...field}
              id={id}
              required={obrigatorio}
              className={`${inputClassName} ${
                fieldState.error ? "border-rose-400" : ""
              }`}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.error ? `${id}-erro` : undefined
              }
              onChange={(event) => {
                if (event.target.value === NOVO_MATERIAL) {
                  setMostrarCadastro(true);
                  setNovoMaterial("");
                  setErroCadastro("");
                  return;
                }

                setMostrarCadastro(false);
                field.onChange(event.target.value);
              }}
            >
              <option value="">Selecione...</option>
              {materiais.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
              <option value={NOVO_MATERIAL}>Cadastrar novo material...</option>
            </select>
            <FieldError
              id={`${id}-erro`}
              message={fieldState.error?.message}
            />

            {mostrarCadastro && (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <label
                  htmlFor={`${id}-novo-material`}
                  className="text-sm font-medium text-slate-200"
                >
                  Nome do material
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id={`${id}-novo-material`}
                    type="text"
                    maxLength={40}
                    value={novoMaterial}
                    className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus-visible:border-sky-400 focus-visible:ring-2 focus-visible:ring-sky-400/30"
                    aria-invalid={Boolean(erroCadastro)}
                    aria-describedby={
                      erroCadastro ? `${id}-novo-material-erro` : undefined
                    }
                    onChange={(event) => {
                      setNovoMaterial(event.target.value);
                      setErroCadastro("");
                    }}
                    onKeyDown={tratarEnter}
                  />
                  <button
                    type="button"
                    onClick={adicionarMaterial}
                    className="min-h-11 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                  >
                    Adicionar
                  </button>
                </div>
                {erroCadastro && (
                  <p
                    id={`${id}-novo-material-erro`}
                    className="mt-1.5 text-sm text-rose-300"
                    role="alert"
                  >
                    {erroCadastro}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
