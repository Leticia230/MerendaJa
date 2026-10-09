import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from '../../components/firebaseConfig';

export type RespostasAluno = Record<number, boolean>;

// Se não passar o id, usa o da instituição logada.
// O aluno deve sempre passar o instituicaoId dele.
function idInstituicao(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return id;
}

const confirmacoesCol = (dia: string, instituicaoId?: string) =>
  collection(
    db,
    'instituicoes',
    idInstituicao(instituicaoId),
    'cardapios',
    dia,
    'confirmacoes'
  );

const confirmacaoDoAlunoRef = (dia: string, alunoId: string, instituicaoId?: string) =>
  doc(
    db,
    'instituicoes',
    idInstituicao(instituicaoId),
    'cardapios',
    dia,
    'confirmacoes',
    alunoId
  );

export function assinarConfirmacaoAluno(
  dia: string,
  alunoId: string,
  onChange: (respostas: RespostasAluno) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  let ref;
  try {
    ref = confirmacaoDoAlunoRef(dia, alunoId, instituicaoId);
  } catch (e) {
    onChange({});
    onErro?.(e);
    return () => {};
  }

  return onSnapshot(
    ref,
    (snap) => {
      const respostas = (snap.data()?.respostas as RespostasAluno) ?? {};
      onChange(respostas);
    },
    (erro) => {
      console.error('Erro ao assinar confirmação do aluno:', erro);
      onErro?.(erro);
    }
  );
}

export async function definirConfirmacao(
  dia: string,
  alunoId: string,
  indice: number,
  vaiComer: boolean,
  instituicaoId?: string
) {
  const ref = confirmacaoDoAlunoRef(dia, alunoId, instituicaoId);
  console.log('[confirmacoes] gravando em:', ref.path);

  await setDoc(
    ref,
    {
      respostas: { [indice]: vaiComer },
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}
export type ContagemRefeicao = { sim: number; nao: number };

/** Contagem das confirmações da instituição logada (ou da informada). */
export function assinarContagemConfirmacoes(
  dia: string,
  onChange: (contagemPorIndice: Record<number, ContagemRefeicao>) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  let col;
  try {
    col = confirmacoesCol(dia, instituicaoId);
  } catch (e) {
    onChange({});
    onErro?.(e);
    return () => {};
  }

  return onSnapshot(
    col,
    (snap) => {
      const contagem: Record<number, ContagemRefeicao> = {};
      snap.docs.forEach((d) => {
        const respostas = (d.data().respostas as RespostasAluno) ?? {};
        Object.entries(respostas).forEach(([indice, vaiComer]) => {
          const i = Number(indice);
          if (!contagem[i]) contagem[i] = { sim: 0, nao: 0 };
          if (vaiComer) contagem[i].sim += 1;
          else contagem[i].nao += 1;
        });
      });
      onChange(contagem);
    },
    (erro) => {
      console.error('Erro ao assinar contagem de confirmações:', erro);
      onErro?.(erro);
    }
  );
}