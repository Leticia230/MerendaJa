// services/semana.ts
// Datas da SEMANA ATUAL (segunda a domingo), sempre em data local.
// No fim de semana, continua valendo a semana que acabou de terminar.

const DIAS_UTEIS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

function formatar(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Segunda-feira da semana atual (00:00, horário local). */
export function segundaDaSemanaAtual(base: Date = new Date()): Date {
  const deslocamento = (base.getDay() + 6) % 7; // Seg=0 ... Dom=6
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() - deslocamento);
}

/** Data (YYYY-MM-DD) de 'Seg'...'Sex' na semana atual. */
export function dataDoDiaDaSemana(codigo: string): string {
  const segunda = segundaDaSemanaAtual();
  const indice = Math.max(DIAS_UTEIS.indexOf(codigo), 0);

  return formatar(
    new Date(segunda.getFullYear(), segunda.getMonth(), segunda.getDate() + indice)
  );
}

/** [segunda, domingo] da semana atual, em YYYY-MM-DD. */
export function intervaloSemanaAtual(): [string, string] {
  const segunda = segundaDaSemanaAtual();

  const domingo = new Date(
    segunda.getFullYear(),
    segunda.getMonth(),
    segunda.getDate() + 6
  );

  return [formatar(segunda), formatar(domingo)];
}