export const ufsCrea = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export const materiaisRegiao = [
  "SA-210 A1",
  "SA-210 C",
  "SA-106 Gr. B",
  "SA-178 A",
  "SA-192",
  "SA-516 Gr. 70",
  "SA-213 T11",
  "SA-213 T22",
] as const;

export const tiposCaldeira = [
  "aquatubular",
  "flamotubular",
  "mista",
] as const;

export const categoriasNr13 = [
  "A – Recuperação de Álcalis",
  "A",
  "B",
] as const;

export const formasConstrutivasCaldeira = [
  "Flamotubular",
  "Aquotubular",
  "Mista",
  "Elétrica",
] as const;

export const tiposVaporGerado = ["Saturado", "Superaquecido"] as const;

export const regioesFlamotubularesFixas = [
  { id: "camara-combustao", nome: "Câmara de combustão" },
  { id: "camara-reversao-gases", nome: "Câmara de reversão de gases" },
  {
    id: "espelho-camara-reversao",
    nome: "Espelho de câmara de reversão",
  },
  { id: "espelho-frontal", nome: "Espelho frontal" },
  { id: "tubos-2-passe", nome: "Tubos 2º passe" },
  { id: "tubos-3-passe", nome: "Tubos 3º passe" },
  { id: "corpo-principal", nome: "Corpo principal" },
] as const;

export const regioesAquatubularesFixas = [
  { id: "piso-tubo-composto", nome: "Piso em tubo composto" },
  { id: "piso-tubo-aco-carbono", nome: "Piso em tubo de aço carbono" },
  {
    id: "parede-agua-tubo-composto",
    nome: "Parede d'água em tubo composto",
  },
  {
    id: "parede-agua-tubo-aco-carbono",
    nome: "Parede d'água em tubo de aço carbono",
  },
  { id: "economizador-1", nome: "Economizador 1 (ECO-1)" },
  { id: "economizador-2", nome: "Economizador 2 (ECO-2)" },
  { id: "superaquecedor-1", nome: "Superaquecedor 1 (SH-1)" },
  {
    id: "superaquecedor-1-alta",
    nome: "Superaquecedor 1 Alta (SH-1 Alta)",
  },
  { id: "superaquecedor-2", nome: "Superaquecedor 2 (SH-2)" },
  { id: "superaquecedor-3", nome: "Superaquecedor 3 (SH-3)" },
  { id: "tubos-cortina", nome: "Tubos da cortina (SCREEN)" },
] as const;

export const subRegioesAquatubularesFixas = [
  { id: "tubos", nome: "tubos" },
  { id: "coletores-inferiores", nome: "coletores-inferiores" },
  { id: "coletores-superiores", nome: "coletores-superiores" },
] as const;
