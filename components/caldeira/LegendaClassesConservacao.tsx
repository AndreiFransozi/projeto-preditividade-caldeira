import { classesConservacao } from "@/lib/classes-conservacao";

export default function LegendaClassesConservacao() {
  return (
    <section
      aria-labelledby="legenda-classes-heading"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80"
    >
      <div className="border-b border-slate-700 px-5 py-4">
        <h2
          id="legenda-classes-heading"
          className="text-lg font-semibold text-white"
        >
          Classes de Conservação
        </h2>
        <p className="mt-1 text-sm text-amber-200">
          Sugestão, a ser revisada.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-200">
            <tr>
              <th scope="col" className="px-4 py-3">Classe</th>
              <th scope="col" className="px-4 py-3">Descrição</th>
              <th scope="col" className="px-4 py-3">
                Condição física e de integridade
              </th>
              <th scope="col" className="px-4 py-3">Conduta técnica</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {classesConservacao.map((item) => (
              <tr key={item.classe} className="align-top">
                <th scope="row" className="px-4 py-4 font-medium text-white">
                  {item.classe}
                </th>
                <td className="px-4 py-4 font-medium text-white">
                  {item.descricao}
                </td>
                <td className="px-4 py-4">{item.condicao}</td>
                <td className="px-4 py-4">{item.conduta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
