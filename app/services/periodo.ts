import { Periodo } from './cardapio';

export const NOME_PERIODO: Record<Periodo, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  todos: 'Todos os períodos',
};

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Converte o período salvo na turma (ex.: "Manhã", "Integral")
// nos períodos de refeição que essa turma consome.
export function periodosDaTurma(periodoTurma?: string): Periodo[] {
  switch (normalizar(periodoTurma ?? '')) {
    case 'manha':
      return ['manha'];
    case 'tarde':
      return ['tarde'];
    case 'noite':
      return ['noite'];
    case 'integral':
      return ['manha', 'tarde'];
    default:
      return [];
  }
}

// periodosAluno === null significa "sem período definido": vê tudo.
export function refeicaoVisivel(
  periodoRefeicao: Periodo | undefined,
  periodosAluno: Periodo[] | null
): boolean {
  if (!periodoRefeicao || periodoRefeicao === 'todos') return true;
  if (!periodosAluno || periodosAluno.length === 0) return true;

  return periodosAluno.includes(periodoRefeicao);
}