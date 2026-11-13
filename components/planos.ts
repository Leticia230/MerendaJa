export type PlanoId = 'teste' | 'semestral' | 'anual';

export type Plano = {
  id: PlanoId;
  nome: string;
  descricao: string;
  valor: number;
  valorEmCentavos: number;
  meses: number;
  destaque?: string;
};

export const PLANOS: Plano[] = [
  {
    id: 'teste',
    nome: 'Teste grátis',
    descricao: 'Experimente o app por 1 mês, sem cobrança',
    valor: 0,
    valorEmCentavos: 0,
    meses: 1,
  },
  {
    id: 'semestral',
    nome: 'Plano semestral',
    descricao: 'Acesso a todos os serviços por 6 meses',
    valor: 894.0,
    valorEmCentavos: 89400,
    meses: 6,
  },
  {
    id: 'anual',
    nome: 'Plano anual',
    descricao: 'Acesso a todos os serviços por 12 meses',
    valor: 1780.0,
    valorEmCentavos: 178000,
    meses: 12,
    destaque: 'Melhor valor',
  },
];

export const getPlano = (id?: string) => PLANOS.find((p) => p.id === id);

export const getPlanoPago = (id?: string): Plano => {
  const plano = getPlano(id);
  return plano && plano.valorEmCentavos > 0 ? plano : (getPlano('anual') as Plano);
};

export const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });