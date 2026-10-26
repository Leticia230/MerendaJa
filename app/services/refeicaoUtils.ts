export type Period = 'semana' | 'mes' | 'ano';

export const TIPOS = ['Café', 'Almoço', 'Jantar'] as const;

const DIAS_UTEIS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

/** Data (YYYY-MM-DD) do dia da semana na semana ATUAL, contando hoje. */
export function dataDoDiaDaSemana(dia: string, semanasAFrente = 0): string {
  const hoje = new Date();
  const hojeIdx = (hoje.getDay() + 6) % 7; // Seg=0 ... Dom=6
  const idx = Math.max(DIAS_UTEIS.indexOf(dia), 0);
  const d = new Date(hoje);
  d.setDate(hoje.getDate() - hojeIdx + idx + semanasAFrente * 7);
  return dataISO(d);
}

export function nomeTipoRefeicao(titulo: string) {
  const texto = titulo.toLowerCase();

  if (
    texto.includes('café') || texto.includes('cafe') ||
    texto.includes('manhã') || texto.includes('manha')
  ) return 'Café';

  if (texto.includes('almoço') || texto.includes('almoco')) return 'Almoço';

  if (texto.includes('jantar') || texto.includes('janta')) return 'Jantar';

  return titulo;
}

// "YYYY-MM-DD" no fuso local (toISOString converteria para UTC e erraria o dia à noite)
export function dataISO(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

function segundaDaSemana(base: Date) {
  const d = new Date(base);
  const dow = d.getDay(); // 0 = domingo
  // Sábado/domingo: mostra a próxima semana, que é quando os alunos planejam
  const deslocamento = dow === 0 ? 1 : dow === 6 ? 2 : -(dow - 1);
  d.setDate(d.getDate() + deslocamento);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function intervaloDoPeriodo(period: Period, base = new Date()): [string, string] {
  if (period === 'semana') {
    const seg = segundaDaSemana(base);
    const sex = new Date(seg);
    sex.setDate(seg.getDate() + 4);
    return [dataISO(seg), dataISO(sex)];
  }

  if (period === 'mes') {
    return [
      dataISO(new Date(base.getFullYear(), base.getMonth(), 1)),
      dataISO(new Date(base.getFullYear(), base.getMonth() + 1, 0)),
    ];
  }

  return [`${base.getFullYear()}-01-01`, `${base.getFullYear()}-12-31`];
}