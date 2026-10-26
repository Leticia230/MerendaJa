import {
  collection, doc, onSnapshot, setDoc, query, where,
} from 'firebase/firestore';
import { db, auth } from '../../components/firebaseConfig';

export type RespostasAluno = Record<string, boolean>; // chave = tipo da refeição

export type ConfirmacaoDatada = {
  data: string;
  alunoId: string;
  respostas: RespostasAluno;
};

function idInstituicao(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return id;
}

const confirmacoesCol = (instituicaoId?: string) =>
  collection(db, 'instituicoes', idInstituicao(instituicaoId), 'confirmacoes');

const confirmacaoRef = (data: string, alunoId: string, instituicaoId?: string) =>
  doc(db, 'instituicoes', idInstituicao(instituicaoId), 'confirmacoes', `${data}_${alunoId}`);

/** Respostas de um aluno em uma data específica. */
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
    (snap) => onChange((snap.data()?.respostas as RespostasAluno) ?? {}),
    (erro) => {
      console.error('Erro ao assinar confirmação do aluno:', erro);
      onErro?.(erro);
    }
  );
}

/** Grava "vou comer / não vou" de um tipo de refeição em uma data. */
export async function definirConfirmacao(
  data: string,
  alunoId: string,
  tipo: string,
  vaiComer: boolean,
  instituicaoId?: string
) {
  await setDoc(
    confirmacaoRef(data, alunoId, instituicaoId),
    {
      data,
      alunoId,
      respostas: { [tipo]: vaiComer },
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}

/** Todas as confirmações da instituição entre duas datas (inclusive). */
/** Todas as confirmações da instituição entre duas datas (inclusive). */
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

  const q = query(col, where('data', '>=', inicio), where('data', '<=', fim));

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
      console.error('Erro ao assinar confirmações do período:', erro);
      onError?.(erro as Error);
    }
  );
}