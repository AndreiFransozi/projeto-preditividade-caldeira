"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { tiposCaldeira } from "@/lib/constants";

export type TipoCaldeira = (typeof tiposCaldeira)[number];

interface TipoCaldeiraContextValue {
  tipoCaldeira: TipoCaldeira | null;
  setTipoCaldeira: (tipo: TipoCaldeira | null) => void;
}

const TipoCaldeiraContext = createContext<TipoCaldeiraContextValue | null>(null);

export function TipoCaldeiraProvider({ children }: { children: ReactNode }) {
  const [tipoCaldeira, setTipoCaldeira] = useState<TipoCaldeira | null>(null);
  // TODO: preencher o tipo a partir dos dados do equipamento retornados pela API.
  const value = useMemo(
    () => ({ tipoCaldeira, setTipoCaldeira }),
    [tipoCaldeira]
  );

  return (
    <TipoCaldeiraContext.Provider value={value}>
      {children}
    </TipoCaldeiraContext.Provider>
  );
}

export function useTipoCaldeira() {
  const context = useContext(TipoCaldeiraContext);
  if (!context) {
    throw new Error(
      "useTipoCaldeira precisa ser usado dentro de TipoCaldeiraProvider."
    );
  }
  return context;
}
