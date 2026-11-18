// services/refeicaoUtils.ts

export type Period = 'semana' | 'mes' | 'ano';

// ---------------------------------------------------------------
// catálogo canônico de refeições
// ---------------------------------------------------------------

export const CATALOGO_REFEICOES = [
  { chave: 'Café',   icone: 'coffee-outline' },
  { chave: 'Lanche', icone: 'food-apple-outline' },
  { chave: 'Almoço', icone: 'food' },
  { chave: 'Jantar', icone: 'food-variant' },
] as const;

export type TipoRefeicao = typeof CATALOGO_REFEICOES[number]['chave'];

// TIPOS é derivado do catálogo (uma única fonte de verdade)
export const TIPOS: TipoRefeicao[] = CATALOGO_REFEICOES.map(
  (r) => r.chave,
);

// ---------------------------------------------------------------
// dias úteis
// ---------------------------------------------------------------

export const DIAS_UTEIS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'] as const;
export type DiaUtil = typeof DIAS_UTEIS[number];

// ---------------------------------------------------------------
// datas
// ---------------------------------------------------------------

export function dataISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

/**
 * Segunda-feira da semana que contém `base`.
 * Domingo → segunda ANTERIOR (mesma semântica usada em calcularIntervalo
 * da tela de Estatísticas).
 */
export function segundaDaSemana(base: Date): Date {
  const d = new Date(base);
  const dow = d.getDay();
  const deslocamento = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + deslocamento);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function intervaloDoPeriodo(
  period: Period,
  base = new Date(),
): [string, string] {
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

/**
 * Data (ISO) do dia útil informado na semana que contém hoje.
 * Se hoje for sábado ou domingo, "esta semana" aponta para a semana
 * seguinte (segunda em diante).
 *
 * @param dia            'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex'
 * @param semanasAFrente deslocamento em semanas (default 0 = semana atual)
 */
export function dataDoDiaDaSemana(
  dia: DiaUtil,
  semanasAFrente = 0,
): string {
  const hoje = new Date();
  const dow = hoje.getDay();                 // 0=Dom ... 6=Sáb
  // seg=0, ter=1, qua=2, qui=3, sex=4, sáb=5, dom=-1 (pula p/ semana seguinte)
  const hojeIdx = dow === 0 ? -1 : dow - 1;
  const idx = Math.max(DIAS_UTEIS.indexOf(dia), 0);

  const d = new Date(hoje);
  d.setDate(hoje.getDate() - hojeIdx + idx + semanasAFrente * 7);
  d.setHours(0, 0, 0, 0);
  return dataISO(d);
}

// ---------------------------------------------------------------
// normalização / ícones
// ---------------------------------------------------------------

const ALIASES: Record<string, TipoRefeicao> = {
  // café
  cafe: 'Café',
  café: 'Café',
  'café da manhã': 'Café',
  'cafe da manha': 'Café',
  'café da manha': 'Café',
  'cafe da manhã': 'Café',
  // lanche
  lanche: 'Lanche',
  'lanche da manhã': 'Lanche',
  'lanche da manha': 'Lanche',
  'lanche da tarde': 'Lanche',
  merenda: 'Lanche',
  // almoço
  almoco: 'Almoço',
  almoço: 'Almoço',
  // jantar
  janta: 'Jantar',
  jantar: 'Jantar',
};

/**
 * Normaliza o nome de uma refeição para uma chave do catálogo.
 * Retorna o próprio texto (trim) se não reconhecer — assim novos tipos
 * aparecem dinamicamente sem quebrar nada.
 */
export function nomeTipoRefeicao(titulo: string): TipoRefeicao | string {
  const t = (titulo ?? '').trim().toLowerCase();
  if (!t) return '';

  // match direto por alias
  const direto = ALIASES[t];
  if (direto) return direto;

  // match por prefixo (ex.: "café da manhã especial")
  for (const [alias, tipo] of Object.entries(ALIASES)) {
    if (t.startsWith(alias)) return tipo;
  }

  return (titulo ?? '').trim();
}

export function iconeRefeicao(titulo: string): string {
  const tipo = nomeTipoRefeicao(titulo);
  return (
    CATALOGO_REFEICOES.find((r) => r.chave === tipo)?.icone ??
    'silverware-fork-knife'
  );
}