// Mapa entre o índice do dia da semana do JS (0 = domingo) e as abreviações
// usadas no resto do app (Cardápio, NovaTurma etc.). Sábado e domingo não
// têm cardápio, então retornam null.
const DIAS_ABREVIADOS: Record<number, string | null> = {
  0: null, // domingo
  1: 'Seg',
  2: 'Ter',
  3: 'Qua',
  4: 'Qui',
  5: 'Sex',
  6: null, // sábado
};

/** Abreviação do dia de hoje ('Seg'..'Sex'), ou null se for fim de semana. */
export function diaAbreviadoDeHoje(): string | null {
  return DIAS_ABREVIADOS[new Date().getDay()];
}

/** Nome do dia da semana por extenso, com a primeira letra maiúscula. Ex: "Segunda-feira". */
export function nomeDiaSemanaPtBR(data: Date = new Date()): string {
  const nome = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(data);
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

/** Data por extenso em pt-BR. Ex: "12 de setembro de 2026". */
export function dataPorExtensoPtBR(data: Date = new Date()): string {
  const formatado = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(data);
  return formatado;
}