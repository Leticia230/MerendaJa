import { collection, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';


export type RespostasAluno = Record<number, boolean>; 

const confirmacaoDoAlunoRef = (dia: string, alunoId: string) =>
  doc(db, 'cardapios', dia, 'confirmacoes', alunoId);

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

export async function definirConfirmacao(dia: string, alunoId: string, indice: number, vaiComer: boolean) {
  
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