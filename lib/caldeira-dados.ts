import type { ClasseConservacao } from "@/lib/classes-conservacao";

export interface CaldeiraResumo {
  id: string;
  nome: string;
  pmtaBar: number;
  proximaInspecao: string;
  expectativaVidaAnos: number;
  classe: ClasseConservacao;
}

export interface RegiaoCaldeira {
  id: string;
  nome: string;
  classe: ClasseConservacao;
  criticidade: number;
  espessuraAtualMm?: number;
  espessuraMinimaMm?: number;
  vidaRemanescenteAnos?: number;
  condutaTecnica?: string;
}

const caldeiras: CaldeiraResumo[] = [
  {
    id: "cr-3",
    nome: "CR-3",
    pmtaBar: 86,
    proximaInspecao: "2027-02-20",
    expectativaVidaAnos: 13.4,
    classe: 2,
  },
  {
    id: "cr-2",
    nome: "CR-2",
    pmtaBar: 72.5,
    proximaInspecao: "2027-05-14",
    expectativaVidaAnos: 17.2,
    classe: 1,
  },
  {
    id: "cr-1",
    nome: "CR-1",
    pmtaBar: 64,
    proximaInspecao: "2026-12-10",
    expectativaVidaAnos: 8.6,
    classe: 3,
  },
];

const regioesPorCaldeira: Record<string, RegiaoCaldeira[]> = {
  "cr-3": [
    {
      id: "sh-1-curvas-inferiores",
      nome: "SH-1 Curvas Inferiores",
      classe: 2,
      criticidade: 72,
      espessuraAtualMm: 5.8,
      espessuraMinimaMm: 4.5,
      vidaRemanescenteAnos: 13.4,
      condutaTecnica:
        "Monitorar a evolução da espessura e registrar os resultados na próxima inspeção programada.",
    },
    {
      id: "economizador-1",
      nome: "Economizador 1",
      classe: 1,
      criticidade: 24,
      espessuraAtualMm: 7.2,
      espessuraMinimaMm: 5.1,
      vidaRemanescenteAnos: 21,
      condutaTecnica:
        "Manter a rotina regular de inspeção e manutenção preventiva.",
    },
  ],
  "cr-2": [
    {
      id: "parede-agua-leste",
      nome: "Parede d'água Leste",
      classe: 1,
      criticidade: 18,
      espessuraAtualMm: 6.4,
      espessuraMinimaMm: 4.8,
      vidaRemanescenteAnos: 17.2,
      condutaTecnica:
        "Manter a rotina regular de inspeção e manutenção preventiva.",
    },
  ],
  "cr-1": [
    {
      id: "tubos-2-passe",
      nome: "Tubos 2º passe",
      classe: 3,
      criticidade: 88,
      espessuraAtualMm: 3.9,
      espessuraMinimaMm: 3.6,
      vidaRemanescenteAnos: 8.6,
      condutaTecnica:
        "Planejar avaliação complementar e intervenção na próxima parada programada.",
    },
  ],
};

export function getMinhasCaldeiras(): CaldeiraResumo[] {
  return caldeiras.map((caldeira) => ({ ...caldeira }));
}

export function getRegioesRankeadas(
  caldeiraId: string
): RegiaoCaldeira[] {
  return [...(regioesPorCaldeira[caldeiraId] ?? [])].sort(
    (a, b) => b.criticidade - a.criticidade
  );
}
