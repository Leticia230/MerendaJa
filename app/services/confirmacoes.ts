import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  query,
  where,
} from 'firebase/firestore';

import { db, auth } from '../../components/firebaseConfig';
import { buscarPrazosConfirmacao } from './prazosConfirmacao';

export type RespostasAluno = Record<string, boolean>;

export type ConfirmacaoDatada = {
  data: string;
  alunoId: string;
  respostas: RespostasAluno;
};

function idInstituicao(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;

  if (!id) {
    throw new Error('Usuário não autenticado.');
  }

  return id;
}

const confirmacoesCol = (instituicaoId?: string) =>
  collection(
    db,
    'instituicoes',
    idInstituicao(instituicaoId),
    'confirmacoes'
  );

const confirmacaoRef = (
  data: string,
  alunoId: string,
  instituicaoId?: string
) =>
  doc(
    db,
    'instituicoes',
    idInstituicao(instituicaoId),
    'confirmacoes',
    `${data}_${alunoId}`
  );

function obterDiaSemana(data: string) {
  const partes = data.split('-').map(Number);

  if (partes.length !== 3) {
    throw new Error('A data da refeição é inválida.');
  }

  const [ano, mes, dia] = partes;
  const dataLocal = new Date(ano, mes - 1, dia);

  if (
    dataLocal.getFullYear() !== ano ||
    dataLocal.getMonth() !== mes - 1 ||
    dataLocal.getDate() !== dia
  ) {
    throw new Error('A data da refeição é inválida.');
  }

  const dias = [
    'domingo',
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
  ] as const;

  return dias[dataLocal.getDay()];
}

function obterTipoRefeicao(tipo: string) {
  const texto = tipo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    texto.includes('cafe') ||
    texto.includes('manha')
  ) {
    return 'cafe';
  }

  if (texto.includes('almoco')) {
    return 'almoco';
  }

  if (
    texto.includes('jantar') ||
    texto.includes('janta')
  ) {
    return 'jantar';
  }

  throw new Error('Não foi possível identificar essa refeição.');
}

async function verificarPrazoConfirmacao(
  data: string,
  tipo: string,
  instituicaoId: string
) {
  const diaSemana = obterDiaSemana(data);
  const tipoRefeicao = obterTipoRefeicao(tipo);

  const prazos = await buscarPrazosConfirmacao(instituicaoId);
  const prazo = prazos[diaSemana][tipoRefeicao];

  if (!prazo.ativo) {
    throw new Error(
      'Esta refeição não está disponível para confirmação neste dia.'
    );
  }

  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const hoje = `${ano}-${mes}-${dia}`;

  if (data < hoje) {
    throw new Error(
      'O prazo para confirmar esta refeição já terminou.'
    );
  }

  if (data === hoje) {
    const [horaLimite, minutoLimite] = prazo.horario
      .split(':')
      .map(Number);

    const minutosAtuais =
      agora.getHours() * 60 + agora.getMinutes();

    const minutosLimite =
      horaLimite * 60 + minutoLimite;

    if (
      !Number.isInteger(horaLimite) ||
      !Number.isInteger(minutoLimite) ||
      horaLimite < 0 ||
      horaLimite > 23 ||
      minutoLimite < 0 ||
      minutoLimite > 59
    ) {
      throw new Error(
        'O horário limite configurado para esta refeição é inválido.'
      );
    }

    if (minutosAtuais >= minutosLimite) {
      throw new Error(
        `O prazo para confirmar esta refeição terminou às ${prazo.horario}.`
      );
    }
  }
}

export function assinarConfirmacaoAlunoData(
  data: string,
  alunoId: string,
  onChange: (respostas: RespostasAluno) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  let ref;

  try {
    ref = confirmacaoRef(data, alunoId, instituicaoId);
  } catch (e) {
    onChange({});
    onErro?.(e);
    return () => {};
  }

  return onSnapshot(
    ref,
    (snap) =>
      onChange(
        (snap.data()?.respostas as RespostasAluno) ?? {}
      ),
    (erro) => {
      console.error(
        'Erro ao assinar confirmação do aluno:',
        erro
      );
      onErro?.(erro);
    }
  );
}

export async function definirConfirmacao(
  data: string,
  alunoId: string,
  tipo: string,
  vaiComer: boolean,
  instituicaoId?: string
) {
  const idInst = idInstituicao(instituicaoId);

  await verificarPrazoConfirmacao(
    data,
    tipo,
    idInst
  );

  await setDoc(
    confirmacaoRef(data, alunoId, idInst),
    {
      data,
      alunoId,
      respostas: {
        [tipo]: vaiComer,
      },
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function assinarConfirmacoesPeriodo(
  inicio: string,
  fim: string,
  onData: (lista: ConfirmacaoDatada[]) => void,
  onError?: (e: Error) => void,
  instituicaoId?: string
) {
  let col;

  try {
    col = confirmacoesCol(instituicaoId);
  } catch (e) {
    onData([]);
    onError?.(e as Error);
    return () => {};
  }

  const q = query(
    col,
    where('data', '>=', inicio),
    where('data', '<=', fim)
  );

  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const dados = d.data();

          return {
            data: dados.data,
            alunoId: dados.alunoId,
            respostas: (dados.respostas ?? {}) as RespostasAluno,
          } as ConfirmacaoDatada;
        })
      ),
    (erro) => {
      console.error(
        'Erro ao assinar confirmações do período:',
        erro
      );
      onError?.(erro as Error);
    }
  );
}
