import { db, auth } from '../../components/firebaseConfig';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';

export type DiaSemana =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';

export type TipoRefeicao = 'cafe' | 'almoco' | 'jantar';

export type PrazoRefeicao = {
  ativo: boolean;
  horario: string;
};

export type PrazosPorDia = Record<
  DiaSemana,
  Record<TipoRefeicao, PrazoRefeicao>
>;

const prazosPadrao: PrazosPorDia = {
  segunda: {
    cafe: { ativo: true, horario: '09:00' },
    almoco: { ativo: true, horario: '10:00' },
    jantar: { ativo: true, horario: '17:00' },
  },
  terca: {
    cafe: { ativo: true, horario: '09:00' },
    almoco: { ativo: true, horario: '10:00' },
    jantar: { ativo: true, horario: '17:00' },
  },
  quarta: {
    cafe: { ativo: true, horario: '09:00' },
    almoco: { ativo: true, horario: '10:00' },
    jantar: { ativo: true, horario: '17:00' },
  },
  quinta: {
    cafe: { ativo: true, horario: '09:00' },
    almoco: { ativo: true, horario: '10:00' },
    jantar: { ativo: true, horario: '17:00' },
  },
  sexta: {
    cafe: { ativo: true, horario: '09:00' },
    almoco: { ativo: true, horario: '10:00' },
    jantar: { ativo: true, horario: '17:00' },
  },
  sabado: {
    cafe: { ativo: false, horario: '08:00' },
    almoco: { ativo: false, horario: '09:00' },
    jantar: { ativo: false, horario: '16:00' },
  },
  domingo: {
    cafe: { ativo: false, horario: '08:00' },
    almoco: { ativo: false, horario: '09:00' },
    jantar: { ativo: false, horario: '16:00' },
  },
};

const DIAS: DiaSemana[] = [
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'domingo',
];

const REFEICOES: TipoRefeicao[] = ['cafe', 'almoco', 'jantar'];

function obterInstituicaoId(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;

  if (!id) {
    throw new Error('Usuário não autenticado.');
  }

  return id;
}

function prazosRef(instituicaoId?: string) {
  return doc(
    db,
    'instituicoes',
    obterInstituicaoId(instituicaoId),
    'configuracoes',
    'prazosConfirmacao'
  );
}

function mesclarComPadrao(dados?: Partial<PrazosPorDia>): PrazosPorDia {
  const resultado = { ...prazosPadrao };

  for (const dia of DIAS) {
    const dadosDia = dados?.[dia];

    if (!dadosDia) continue;

    resultado[dia] = { ...prazosPadrao[dia] };

    for (const refeicao of REFEICOES) {
      const prazoSalvo = dadosDia[refeicao];

      if (
        prazoSalvo &&
        typeof prazoSalvo.ativo === 'boolean' &&
        typeof prazoSalvo.horario === 'string'
      ) {
        resultado[dia][refeicao] = {
          ativo: prazoSalvo.ativo,
          horario: prazoSalvo.horario,
        };
      }
    }
  }

  return resultado;
}

export async function buscarPrazosConfirmacao(
  instituicaoId?: string
): Promise<PrazosPorDia> {
  const referencia = prazosRef(instituicaoId);
  const snapshot = await getDoc(referencia);

  if (!snapshot.exists()) {
    return mesclarComPadrao();
  }

  const dados = snapshot.data().prazos as
    | Partial<PrazosPorDia>
    | undefined;

  return mesclarComPadrao(dados);
}

export async function salvarPrazosConfirmacao(
  prazos: PrazosPorDia,
  instituicaoId?: string
) {
  await setDoc(
    prazosRef(instituicaoId),
    {
      prazos: mesclarComPadrao(prazos),
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function assinarPrazosConfirmacao(
  onChange: (prazos: PrazosPorDia) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  let referencia;

  try {
    referencia = prazosRef(instituicaoId);
  } catch (erro) {
    onErro?.(erro);
    return () => {};
  }

  return onSnapshot(
    referencia,
    (snapshot) => {
      const dados = snapshot.data()?.prazos as
        | Partial<PrazosPorDia>
        | undefined;

      onChange(mesclarComPadrao(dados));
    },
    (erro) => {
      console.error('Erro ao acompanhar prazos de confirmação:', erro);
      onErro?.(erro);
    }
  );
}
