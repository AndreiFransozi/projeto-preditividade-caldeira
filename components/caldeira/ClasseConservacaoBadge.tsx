import { getClasseConservacao } from "@/lib/classes-conservacao";

export default function ClasseConservacaoBadge({
  classe,
}: {
  classe: number;
}) {
  const dados = getClasseConservacao(classe);
  if (!dados) return <span aria-label="Classe não informada">—</span>;

  return (
    <span
      title={dados.descricao}
      aria-label={`Classe ${dados.classe}: ${dados.descricao}`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${dados.cor}`}
    >
      {dados.classe}
    </span>
  );
}
