export function formatarCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);

  return digitos
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function validarCnpj(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");

  if (digitos.length !== 14 || /^(\d)\1{13}$/.test(digitos)) {
    return false;
  }

  const calcularDigito = (base: string, pesos: number[]) => {
    const soma = [...base].reduce(
      (total, digito, indice) => total + Number(digito) * pesos[indice],
      0
    );
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(
    digitos.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  const segundoDigito = calcularDigito(
    digitos.slice(0, 12) + primeiroDigito,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );

  return digitos.endsWith(`${primeiroDigito}${segundoDigito}`);
}

export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (!digitos) return "";
  if (digitos.length <= 2) return `(${digitos}`;

  const ddd = digitos.slice(0, 2);
  const assinante = digitos.slice(2);
  const tamanhoPrefixo = digitos.length === 11 ? 5 : 4;
  const prefixo = assinante.slice(0, tamanhoPrefixo);
  const sufixo = assinante.slice(tamanhoPrefixo);

  return `(${ddd}) ${prefixo}${sufixo ? `-${sufixo}` : ""}`;
}

export function validarTelefone(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");

  if (
    (digitos.length !== 10 && digitos.length !== 11) ||
    !/^[1-9]{2}/.test(digitos) ||
    /^(\d)\1+$/.test(digitos)
  ) {
    return false;
  }

  return digitos.length === 10
    ? /^[2-5]/.test(digitos.slice(2))
    : digitos[2] === "9";
}

export function formatarData(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

export function validarDataReal(valor: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  if (!match) return false;

  const dia = Number(match[1]);
  const mes = Number(match[2]);
  const ano = Number(match[3]);

  if (ano < 1 || mes < 1 || mes > 12) return false;

  const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0);
  const diasNoMes = [
    31,
    bissexto ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return dia >= 1 && dia <= diasNoMes[mes - 1];
}

export function dataEhFutura(valor: string, hoje = new Date()): boolean {
  if (!validarDataReal(valor)) return false;

  const [dia, mes, ano] = valor.split("/").map(Number);
  const dataInspecao = [ano, mes, dia];
  const dataAtual = [
    hoje.getFullYear(),
    hoje.getMonth() + 1,
    hoje.getDate(),
  ];

  for (let indice = 0; indice < dataInspecao.length; indice += 1) {
    if (dataInspecao[indice] !== dataAtual[indice]) {
      return dataInspecao[indice] > dataAtual[indice];
    }
  }

  return false;
}

export function criarCaracterizacaoRegiaoVazia() {
  return {
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
}

export function parseNumero(valor: string): number {
  const normalizado = valor.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalizado)) {
    return Number.NaN;
  }
  return Number(normalizado);
}

export function normalizarTexto(valor: string): string {
  return valor.trim().toLocaleLowerCase("pt-BR");
}
