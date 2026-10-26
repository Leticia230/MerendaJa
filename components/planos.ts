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
    valor: 74.0, // AJUSTE para o valor que você quiser cobrar
    valorEmCentavos: 7400,
    meses: 6,
  },
  {
    id: 'anual',
    nome: 'Plano anual',
    descricao: 'Acesso a todos os serviços por 12 meses',
    valor: 124.0,
    valorEmCentavos: 12400,
    meses: 12,
    destaque: 'Melhor valor',
  },
];

export const getPlano = (id?: string) => PLANOS.find((p) => p.id === id);

// Para a tela de pagamento: só planos pagos (se vier algo estranho, usa o anual)
export const getPlanoPago = (id?: string): Plano => {
  const plano = getPlano(id);
  return plano && plano.valorEmCentavos > 0 ? plano : (getPlano('anual') as Plano);
};

export const formatarValor = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });