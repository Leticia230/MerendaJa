import { collection, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';

// Cada refeição é identificada pela posição dela no array do dia (0, 1, 2...).
// Isso é estável enquanto a instituição só adiciona/edita refeições — se um dia
// vocês adicionarem "remover refeição", essa indexação precisa ser revista.

export type RespostasAluno = Record<number, boolean>; // índice -> vai comer (true/false)

const confirmacaoDoAlunoRef = (dia: string, alunoId: string) =>
  doc(db, 'cardapios', dia, 'confirmacoes', alunoId);

/** Escuta em tempo real as respostas do aluno (sim/não por refeição) num dia. */
export function assinarConfirmacaoAluno(
  dia: string,
  alunoId: string,
  onChange: (respostas: RespostasAluno) => void,
  onErro?: (erro: unknown) => void
) {
  return onSnapshot(
    confirmacaoDoAlunoRef(dia, alunoId),
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

/** Define a resposta do aluno (vai comer ou não) pra uma refeição específica. */
export async function definirConfirmacao(dia: string, alunoId: string, indice: number, vaiComer: boolean) {
  // setDoc com merge garante que funciona tanto na primeira resposta do
  // aluno naquele dia (documento ainda não existe) quanto nas seguintes.
  await setDoc(
    confirmacaoDoAlunoRef(dia, alunoId),
    {
      respostas: { [indice]: vaiComer },
      atualizadoEm: new Date().toISOString(),
    },
    { merge: true }
  );
}

export type ContagemRefeicao = { sim: number; nao: number };

/**
 * Escuta em tempo real quantos alunos responderam "vou comer" e quantos
 * responderam "não vou" em cada refeição (por índice) num dia — usado na
 * Home da Instituição. Mostra só os números, sem identificar quem respondeu.
 */
export function assinarContagemConfirmacoes(
  dia: string,
  onChange: (contagemPorIndice: Record<number, ContagemRefeicao>) => void,
  onErro?: (erro: unknown) => void
) {
  return onSnapshot(
    collection(db, 'cardapios', dia, 'confirmacoes'),
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