
const DIAS_ABREVIADOS: Record<number, string | null> = {
  0: null, // domingo
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: null, // sábado
};

export function diaAbreviadoDeHoje(): string | null {
  return DIAS_ABREVIADOS[new Date().getDay()];
}

export const NOME_COMPLETO_DIA: Record<string, string> = {
  Seg: 'Segunda-feira',
  Ter: 'Terça-feira',
  Qua: 'Quarta-feira',
  Qui: 'Quinta-feira',
  Sex: 'Sexta-feira',
};

export function nomeDiaSemanaPtBR(data: Date = new Date()): string {
  const nome = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(data);
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export function dataPorExtensoPtBR(data: Date = new Date()): string {
  const formatado = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(data);
  return formatado;
}