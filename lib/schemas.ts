import { z } from "zod";
import {
  categoriasNr13,
  formasConstrutivasCaldeira,
  tiposVaporGerado,
  tiposCaldeira,
  ufsCrea,
} from "@/lib/constants";
import {
  dataEhFutura,
  normalizarTexto,
  parseNumero,
  validarCnpj,
  validarDataReal,
  validarTelefone,
} from "@/lib/utils";

export const caracterizacaoSchema = z.object({
  proprietario: z.object({
    nome: z.string().trim().min(1, "Informe o nome do proprietário."),
    endereco: z.string().trim().min(1, "Informe o endereço."),
    cnpj: z.string().refine(validarCnpj, "Informe um CNPJ válido."),
  }),
  responsavelCaldeira: z.object({
    funcao: z.enum(["operacao", "manutencao"], {
      error: "Selecione Operação ou Manutenção.",
    }),
    nome: z.string().trim().min(1, "Informe o nome do responsável."),
    telefone: z
      .string()
      .refine(validarTelefone, "Informe um telefone válido com DDD."),
  }),
});

export type CaracterizacaoFormData = z.infer<typeof caracterizacaoSchema>;

const numeroPositivo = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${campo}.`)
    .pipe(
      z
        .string()
        .refine(
          (valor) => Number.isFinite(parseNumero(valor)),
          `Informe ${campo} usando um número válido.`
        )
    )
    .transform(parseNumero)
    .pipe(z.number().gt(0, "O valor deve ser maior que zero."));

const tipoCombustivelSchema = z.union([
  z.enum([
    "licor-negro",
    "oleo-xisto",
    "oleo-bpf-a1",
    "oleo-bpf-a2",
    "oleo-diesel",
    "gas-natural",
    "glp",
    "eletrica",
    "outro",
  ], {
    error: "Selecione um combustível válido.",
  }),
  z.string().regex(/^custom:[a-z0-9-]+$/, {
    error: "Selecione um combustível válido.",
  }),
]);
const tipoCombustivelInputSchema = z.union([
  tipoCombustivelSchema,
  z.literal(""),
]);

const selecaoCombustivelSchema = z.object({
  tipo: tipoCombustivelInputSchema,
  outroTexto: z.string().max(60, "Use no máximo 60 caracteres.").optional(),
  salvarComoOpcao: z.boolean().optional(),
});

const selecaoCombustivelPrincipalSchema = selecaoCombustivelSchema.extend({
  tipo: tipoCombustivelInputSchema.pipe(tipoCombustivelSchema),
});

const selecaoCombustivelAuxiliarSchema = selecaoCombustivelSchema
  .optional()
  .transform((selecao) => (selecao?.tipo ? selecao : undefined));

export { categoriasNr13 } from "@/lib/constants";

export const combustiveisDisponiveis = [
  { value: "licor-negro", label: "Licor negro" },
  { value: "oleo-xisto", label: "Óleo de xisto" },
  { value: "oleo-bpf-a1", label: "Óleo BPF A1" },
  { value: "oleo-bpf-a2", label: "Óleo BPF A2" },
  { value: "oleo-diesel", label: "Óleo diesel" },
  { value: "gas-natural", label: "Gás natural" },
  { value: "glp", label: "Gás liquefeito de petróleo (GLP)" },
  { value: "eletrica", label: "Elétrica" },
] as const;

const categoriaNr13Schema = z.enum(categoriasNr13, {
  error: "Selecione a categoria NR-13.",
});
const naturezaVaporSchema = z.enum(["superaquecido", "saturado"], {
  error: "Selecione a natureza do vapor",
});

export const caldeiraSchema = z
  .object({
    identificacao: z.object({
      numeroIdentificacao: z
        .string()
        .trim()
        .min(1, "Informe o número de identificação do equipamento."),
      denominacaoProprietario: z
        .string()
        .trim()
        .min(1, "Informe a denominação do proprietário."),
      modelo: z.string().trim().min(1, "Selecione um modelo."),
    }),
    fabricante: z.object({
      nome: z.string().trim().min(1, "Informe o nome do fabricante."),
      modelo: z.string().trim().min(1, "Informe o modelo do fabricante."),
      numeroOrdemFabricacao: z
        .string()
        .trim()
        .min(1, "Informe o número de ordem de fabricação."),
    }),
    classificacao: z.object({
      categoriaNr13: z
        .union([categoriaNr13Schema, z.literal("")])
        .pipe(categoriaNr13Schema),
    }),
    dadosTecnicos: z.object({
      capacidadeVapor: numeroPositivo("a capacidade de geração de vapor"),
      capacidadeQueimaSolidos: numeroPositivo(
        "a capacidade de queima de sólidos secos"
      ),
      pmta: numeroPositivo("a PMTA"),
      pressaoNominalTrabalho: numeroPositivo(
        "a pressão nominal de trabalho"
      ),
      superficieAquecimento: numeroPositivo(
        "a superfície de aquecimento"
      ),
      superficieAquecimentoData: z
        .string()
        .trim()
        .min(1, "Informe a data da superfície de aquecimento.")
        .refine(
          validarDataReal,
          "Informe uma data real no formato DD/MM/AAAA."
        ),
      temperaturaVapor: numeroPositivo(
        "a temperatura de vapor para o processo"
      ),
      naturezaVapor: z
        .union([naturezaVaporSchema, z.literal("")])
        .pipe(naturezaVaporSchema),
    }),
    combustiveis: z.object({
      principal: selecaoCombustivelPrincipalSchema,
      auxiliar1: selecaoCombustivelAuxiliarSchema,
      auxiliar2: selecaoCombustivelAuxiliarSchema,
    }),
  })
  .superRefine((dados, contexto) => {
    const { dadosTecnicos, combustiveis } = dados;

    if (
      dadosTecnicos.pressaoNominalTrabalho > dadosTecnicos.pmta
    ) {
      contexto.addIssue({
        code: "custom",
        path: ["dadosTecnicos", "pressaoNominalTrabalho"],
        message:
          "A pressão nominal de trabalho não pode ser maior que a PMTA",
      });
    }

    const selecoes = [
      { campo: "principal", selecao: combustiveis.principal },
      { campo: "auxiliar1", selecao: combustiveis.auxiliar1 },
      { campo: "auxiliar2", selecao: combustiveis.auxiliar2 },
    ] as const;
    const vistos = new Set<string>();

    for (const { campo, selecao } of selecoes) {
      if (!selecao?.tipo) continue;

      const usaTextoLivre =
        selecao.tipo === "outro" || selecao.tipo.startsWith("custom:");
      const texto = selecao.outroTexto?.trim() ?? "";

      if (selecao.tipo === "outro" && !texto) {
        contexto.addIssue({
          code: "custom",
          path: ["combustiveis", campo, "outroTexto"],
          message: "Informe o combustível",
        });
      } else if (selecao.tipo.startsWith("custom:") && !texto) {
        contexto.addIssue({
          code: "custom",
          path: ["combustiveis", campo, "outroTexto"],
          message: "Informe o combustível",
        });
      }

      const rotuloPadrao = combustiveisDisponiveis.find(
        (combustivel) => combustivel.value === selecao.tipo
      )?.label;
      const identificador = usaTextoLivre
        ? normalizarTexto(texto)
        : normalizarTexto(rotuloPadrao ?? selecao.tipo);
      if (!identificador) continue;

      if (vistos.has(identificador)) {
        contexto.addIssue({
          code: "custom",
          path: ["combustiveis", campo, "tipo"],
          message: "Este combustível já foi selecionado em outro campo",
        });
      } else {
        vistos.add(identificador);
      }
    }

    if (
      combustiveis.auxiliar2?.tipo &&
      !combustiveis.auxiliar1?.tipo
    ) {
      contexto.addIssue({
        code: "custom",
        path: ["combustiveis", "auxiliar2", "tipo"],
        message: "Selecione o combustível auxiliar 1 antes do auxiliar 2.",
      });
    }
  });

export type CaldeiraFormInput = z.input<typeof caldeiraSchema>;
export type CaldeiraFormData = z.output<typeof caldeiraSchema>;

const textoObrigatorio = (campo: string) =>
  z.string().trim().min(1, `Informe ${campo}.`);

const numeroNaoNegativo = (campo: string) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${campo}.`)
    .refine(
      (valor) => Number.isFinite(parseNumero(valor)),
      `Informe ${campo} com um número válido. Use vírgula para decimais.`
    )
    .refine(
      (valor) => parseNumero(valor) >= 0,
      `${campo} não pode ser negativo.`
    )
    .transform(parseNumero);

const dataIsoObrigatoria = z
  .string()
  .min(1, "Informe a data do início de operação.")
  .refine((valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const data = new Date(`${valor}T00:00:00.000Z`);
    return (
      Number.isFinite(data.getTime()) &&
      data.toISOString().slice(0, 10) === valor
    );
  }, "Informe uma data válida.");

const selecaoObrigatoria = <
  T extends readonly [string, ...string[]],
>(
  opcoes: T,
  mensagem: string
) =>
  z
    .union([z.enum(opcoes), z.literal("")])
    .pipe(z.enum(opcoes, { error: mensagem }));

export const caracterizacaoCaldeiraSchema = z.object({
  identificacao: z.object({
    descricaoCurta: textoObrigatorio("a descrição curta."),
    numeroEquipamento: textoObrigatorio("o número do equipamento."),
    descricaoEquipamento: textoObrigatorio("a descrição do equipamento."),
    numeroPosicaoOperacional: textoObrigatorio(
      "o número da posição operacional."
    ),
    descricaoPosicao: textoObrigatorio("a descrição da posição."),
    categoriaNr13: selecaoObrigatoria(
      categoriasNr13,
      "Selecione a categoria NR-13."
    ),
    dataInicioOperacao: dataIsoObrigatoria,
  }),
  fabricante: z.object({
    nome: textoObrigatorio("o nome do fabricante."),
    modelo: textoObrigatorio("o modelo do fabricante."),
    numeroSerie: textoObrigatorio("o número de série."),
    numeroOrdemFabricacao: textoObrigatorio(
      "o número da ordem de fabricação."
    ),
    formaConstrutiva: selecaoObrigatoria(
      formasConstrutivasCaldeira,
      "Selecione a forma construtiva do fabricante."
    ),
    vaporGerado: selecaoObrigatoria(
      tiposVaporGerado,
      "Selecione o tipo de vapor gerado."
    ),
  }),
  dadosTecnicos: z.object({
    capacidadeGeracaoVapor: numeroNaoNegativo(
      "a capacidade de geração de vapor."
    ),
    capacidadeQueimaSolidos: numeroNaoNegativo(
      "a capacidade de queima de sólidos secos."
    ),
    pmta: numeroNaoNegativo("a PMTA."),
    pressaoNominalTrabalho: numeroNaoNegativo(
      "a pressão nominal de trabalho."
    ),
    pressaoSaidaVapor: numeroNaoNegativo("a pressão de saída de vapor."),
    temperaturaVaporProcesso: numeroNaoNegativo(
      "a temperatura de vapor para processo."
    ),
    naturezaVaporGerado: selecaoObrigatoria(
      tiposVaporGerado,
      "Selecione a natureza do vapor gerado."
    ),
    superficieAquecimento: numeroNaoNegativo(
      "a superfície de aquecimento."
    ),
    formaConstrutiva: selecaoObrigatoria(
      formasConstrutivasCaldeira,
      "Selecione a forma construtiva dos dados técnicos."
    ),
  }),
  combustiveis: z.object({
    principal: textoObrigatorio("o combustível principal."),
    auxiliar1: z.string().trim().max(120, "Use no máximo 120 caracteres."),
    auxiliar2: z.string().trim().max(120, "Use no máximo 120 caracteres."),
  }),
});

export type CaracterizacaoCaldeiraInput = z.input<
  typeof caracterizacaoCaldeiraSchema
>;
export type CaracterizacaoCaldeiraData = z.output<
  typeof caracterizacaoCaldeiraSchema
>;

const ufCreaSchema = z
  .union([z.enum(ufsCrea), z.literal("")])
  .refine(
    (uf): uf is (typeof ufsCrea)[number] => uf !== "",
    "Selecione a UF do CREA."
  );

const tipoCaldeiraSchema = z
  .union([z.enum(tiposCaldeira), z.literal("")])
  .refine(
    (tipo): tipo is (typeof tiposCaldeira)[number] => tipo !== "",
    "Selecione o tipo de caldeira."
  );

export const caracterizacaoRegiaoSchema = z.object({
  material: z.string(),
  temperaturaCalculo: z.string(),
  tensaoMaximaAdmissivel: z.string(),
  pressaoCalculo: z.string(),
  diametroExterno: z.string(),
  espessuraMinimaCalculada: z.string(),
  espessuraMinimaRecomendada: z.string(),
  espessuraNominal: z.string(),
  dataInicioOperacao: z.string(),
});
export type CaracterizacaoRegiaoFormData = z.infer<
  typeof caracterizacaoRegiaoSchema
>;

const tipoCamaraSchema = z.union([
  z.enum(["liso", "corrugado"]),
  z.literal(""),
]);

const subRegiaoAquatubularSchema = z.object({
  id: z.string(),
  nome: z.enum([
    "tubos",
    "coletores-inferiores",
    "coletores-superiores",
  ]),
  caracterizacao: caracterizacaoRegiaoSchema,
});

const outraSecaoAquatubularSchema = z.object({
  id: z.string(),
  nome: z.string().trim().min(1, "Informe o nome da seção.").max(60),
  texto: z.string().max(200, "Use no máximo 200 caracteres."),
  personalizada: z.boolean(),
});

const regiaoFlamotubularSchema = z.object({
  id: z.string(),
  nome: z.string().trim().min(1, "Informe o nome da região.").max(60),
  personalizada: z.boolean(),
  tipoCamara: tipoCamaraSchema.optional(),
  caracterizacao: caracterizacaoRegiaoSchema,
});

const regiaoAquatubularSchema = z.object({
  id: z.string(),
  nome: z.string().trim().min(1, "Informe o nome da região.").max(60),
  personalizada: z.boolean(),
  subRegioes: z.array(subRegiaoAquatubularSchema),
  outrasSecoes: z.array(outraSecaoAquatubularSchema),
});

const camposCaracterizacao = [
  "material",
  "temperaturaCalculo",
  "tensaoMaximaAdmissivel",
  "pressaoCalculo",
  "diametroExterno",
  "espessuraMinimaCalculada",
  "espessuraMinimaRecomendada",
  "espessuraNominal",
  "dataInicioOperacao",
] as const;

const camposNumericosCaracterizacao = new Set<string>([
  "temperaturaCalculo",
  "tensaoMaximaAdmissivel",
  "pressaoCalculo",
  "diametroExterno",
  "espessuraMinimaCalculada",
  "espessuraMinimaRecomendada",
  "espessuraNominal",
]);

export const inspecaoSchema = z
  .object({
    inspecao: z.object({
      tipoCaldeira: tipoCaldeiraSchema,
      empresaInspecao: z
        .string()
        .trim()
        .min(1, "Informe a empresa de inspeção."),
      responsavelTecnico: z
        .string()
        .trim()
        .min(1, "Informe o responsável técnico (PLH)."),
      numeroCreaPlh: z
        .string()
        .trim()
        .min(1, "Informe o número do CREA do PLH.")
        .regex(/^\d+$/, "O número do CREA deve conter apenas números."),
      ufCrea: ufCreaSchema,
      dataInspecao: z.string(),
      numeroArt: z
        .string()
        .trim()
        .min(1, "Informe o número da ART.")
        .max(20, "O número da ART deve ter no máximo 20 caracteres.")
        .regex(/^[A-Za-z0-9]+$/, "Use apenas letras e números na ART."),
      inspetores: z.array(
        z.object({
          nome: z.string().trim().min(1, "Informe o nome do inspetor."),
          qualificacao: z
            .string()
            .trim()
            .min(1, "Informe a qualificação do inspetor."),
        })
      ),
      regioesFlamotubulares: z.array(regiaoFlamotubularSchema),
      regioesAquatubulares: z.array(regiaoAquatubularSchema),
      quantidadeTubos: z.object({
        paredeFrontal: z.string().max(20, "Use no máximo 20 caracteres."),
        paredeTraseira: z.string().max(20, "Use no máximo 20 caracteres."),
        paredeLateralEsquerda: z
          .string()
          .max(20, "Use no máximo 20 caracteres."),
        paredeLateralDireita: z
          .string()
          .max(20, "Use no máximo 20 caracteres."),
      }),
    }),
  })
  .superRefine(({ inspecao }, contexto) => {
    if (!validarDataReal(inspecao.dataInspecao)) {
      contexto.addIssue({
        code: "custom",
        path: ["inspecao", "dataInspecao"],
        message: "Informe uma data válida",
      });
    } else if (dataEhFutura(inspecao.dataInspecao)) {
      contexto.addIssue({
        code: "custom",
        path: ["inspecao", "dataInspecao"],
        message: "A data de inspeção não pode ser futura",
      });
    }

    if (inspecao.inspetores.length === 0) {
      contexto.addIssue({
        code: "custom",
        path: ["inspecao", "inspetores"],
        message: "Adicione pelo menos um inspetor",
      });
    }

    const inspetoresVistos = new Set<string>();
    for (const inspetor of inspecao.inspetores) {
      const nome = normalizarTexto(inspetor.nome);
      const qualificacao = normalizarTexto(inspetor.qualificacao);
      const identificador = `${nome}\u0000${qualificacao}`;

      if (inspetoresVistos.has(identificador)) {
        contexto.addIssue({
          code: "custom",
          path: ["inspecao", "inspetores"],
          message: "Este inspetor já foi adicionado",
        });
      } else {
        inspetoresVistos.add(identificador);
      }
    }

    const tipo = inspecao.tipoCaldeira;
    const verificarFlamotubulares =
      tipo === "flamotubular" || tipo === "mista";
    const verificarAquatubulares =
      tipo === "aquatubular" || tipo === "mista";

    const nomesRegioes = new Map<string, (string | number)[]>();
    const registrarNomeRegiao = (
      nome: string,
      caminho: (string | number)[]
    ) => {
      const nomeNormalizado = normalizarTexto(nome);
      if (!nomeNormalizado) return;

      if (nomesRegioes.has(nomeNormalizado)) {
        contexto.addIssue({
          code: "custom",
          path: caminho,
          message: "Esta região já existe",
        });
      } else {
        nomesRegioes.set(nomeNormalizado, caminho);
      }
    };

    const validarCaracterizacao = (
      caracterizacao: z.infer<typeof caracterizacaoRegiaoSchema>,
      caminho: (string | number)[],
      tipoCamara?: string
    ) => {
      const preenchida = camposCaracterizacao.some((campo) =>
        caracterizacao[campo].trim()
      );
      if (!preenchida && !tipoCamara) return;

      for (const campo of camposCaracterizacao) {
        const valor = caracterizacao[campo].trim();
        if (!valor) {
          contexto.addIssue({
            code: "custom",
            path: [...caminho, campo],
            message: "Preencha todos os campos desta região",
          });
          continue;
        }

        if (camposNumericosCaracterizacao.has(campo)) {
          const numero = parseNumero(valor);
          if (!Number.isFinite(numero) || numero <= 0) {
            contexto.addIssue({
              code: "custom",
              path: [...caminho, campo],
              message: "Informe um valor numérico maior que zero.",
            });
          }
        } else if (campo === "dataInicioOperacao") {
          if (!validarDataReal(valor)) {
            contexto.addIssue({
              code: "custom",
              path: [...caminho, campo],
              message: "Informe uma data válida",
            });
          } else if (dataEhFutura(valor)) {
            contexto.addIssue({
              code: "custom",
              path: [...caminho, campo],
              message: "A data de início da operação não pode ser futura",
            });
          }
        }
      }

      if (
        tipoCamara &&
        !["liso", "corrugado"].includes(tipoCamara)
      ) {
        contexto.addIssue({
          code: "custom",
          path: [...caminho.slice(0, -1), "tipoCamara"],
          message: "Selecione o tipo da câmara de combustão.",
        });
      }

      const espessuraRecomendada = parseNumero(
        caracterizacao.espessuraMinimaRecomendada
      );
      const espessuraNominal = parseNumero(
        caracterizacao.espessuraNominal
      );
      if (
        Number.isFinite(espessuraRecomendada) &&
        Number.isFinite(espessuraNominal) &&
        espessuraNominal < espessuraRecomendada
      ) {
        contexto.addIssue({
          code: "custom",
          path: [...caminho, "espessuraNominal"],
          message:
            "A espessura nominal não pode ser menor que a mínima recomendada",
        });
      }
    };

    if (verificarFlamotubulares) {
      inspecao.regioesFlamotubulares.forEach((regiao, indice) => {
        const caminho = ["inspecao", "regioesFlamotubulares", indice];
        registrarNomeRegiao(regiao.nome, [...caminho, "nome"]);
        if (
          regiao.id === "camara-combustao" &&
          regiao.caracterizacao &&
          (camposCaracterizacao.some((campo) =>
            regiao.caracterizacao[campo].trim()
          ) ||
            regiao.tipoCamara)
        ) {
          if (!regiao.tipoCamara) {
            contexto.addIssue({
              code: "custom",
              path: [...caminho, "tipoCamara"],
              message: "Selecione o tipo da câmara de combustão.",
            });
          }
        }
        validarCaracterizacao(
          regiao.caracterizacao,
          [...caminho, "caracterizacao"],
          regiao.id === "camara-combustao"
            ? regiao.tipoCamara
            : undefined
        );
      });
    }

    if (verificarAquatubulares) {
      inspecao.regioesAquatubulares.forEach((regiao, indice) => {
        const caminho = ["inspecao", "regioesAquatubulares", indice];
        registrarNomeRegiao(regiao.nome, [...caminho, "nome"]);
        regiao.subRegioes.forEach((subRegiao, subIndice) => {
          validarCaracterizacao(
            subRegiao.caracterizacao,
            [...caminho, "subRegioes", subIndice, "caracterizacao"]
          );
        });
      });
    }

  })
  .transform(({ inspecao }) => ({
    inspecao: {
      ...inspecao,
      regioesAquatubulares: inspecao.regioesAquatubulares.map(
        ({ subRegioes, outrasSecoes, ...regiao }) => {
          const caracterizacaoDaSubRegiao = (nome: string) =>
            subRegioes.find((subRegiao) => subRegiao.nome === nome)
              ?.caracterizacao ?? {
              material: "",
              temperaturaCalculo: "",
              tensaoMaximaAdmissivel: "",
              pressaoCalculo: "",
              diametroExterno: "",
              espessuraMinimaCalculada: "",
              espessuraMinimaRecomendada: "",
              espessuraNominal: "",
              dataInicioOperacao: "",
            };

          return {
            ...regiao,
            subRegioes: {
              tubos: {
                caracterizacao: caracterizacaoDaSubRegiao("tubos"),
              },
              coletoresInferiores: {
                caracterizacao: caracterizacaoDaSubRegiao(
                  "coletores-inferiores"
                ),
              },
              coletoresSuperiores: {
                caracterizacao: caracterizacaoDaSubRegiao(
                  "coletores-superiores"
                ),
              },
            },
            outrasSecoes: outrasSecoes.map(({ nome, texto }) => ({
              nome,
              texto,
            })),
          };
        }
      ),
    },
  }));

export type InspecaoFormInput = z.input<typeof inspecaoSchema>;
export type InspecaoFormData = z.output<typeof inspecaoSchema>;
