export const classesConservacao = [
  {
    classe: 1,
    descricao: "Íntegro / Em Conformidade",
    condicao:
      "Sem anomalias relevantes; parâmetros e acessórios dentro dos limites de projeto e da norma.",
    conduta:
      "Manter rotina regular de inspeção e manutenção preventiva.",
    cor: "bg-green-500 text-white",
  },
  {
    classe: 2,
    descricao: "Desgaste Controlado",
    condicao:
      "Alterações leves ou degradação incipiente com margem ampla frente aos limites críticos; sem risco imediato.",
    conduta:
      "Monitorar evolução, registrar tendências e acompanhar na próxima parada programada.",
    cor: "bg-sky-300 text-slate-950",
  },
  {
    classe: 3,
    descricao: "Atenção / Intervenção Programada",
    condicao:
      "Degradação relevante (perda de espessura, desvio operacional) que exige ação antes de comprometer a segurança.",
    conduta:
      "Planejar reparo/substituição em parada programada, revisar intervalos e aprofundar análise (ex.: espessura/vida remanescente/investigar áreas próximas).",
    cor: "bg-yellow-400 text-slate-950",
  },
  {
    classe: 4,
    descricao: "Crítico / Interdição ou Ação Imediata",
    condicao:
      "Dano severo, falha em item que pode vir a comprometer a segurança ou condição operacional.",
    conduta:
      "Restringir prazo regulamentar até próxima inspeção/interditar caldeira, conforme o caso, e executar correção imediata ou reavaliação formal antes de operar.",
    cor: "bg-red-600 text-white",
  },
] as const;

export type ClasseConservacao =
  (typeof classesConservacao)[number]["classe"];

export function getClasseConservacao(classe: number) {
  return classesConservacao.find((item) => item.classe === classe);
}
