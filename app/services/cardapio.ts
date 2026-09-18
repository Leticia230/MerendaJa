import {
  doc,
  onSnapshot,
  setDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';

export type Refeicao = {
  titulo: string;
  desc: string;
  horario: string; 
  icon: string; 
  color: string; 
  data?: string; 
};


export function assinarCardapioDia(
  dia: string,
  onChange: (refeicoes: Refeicao[]) => void,
  onErro?: (erro: unknown) => void
) {
  const ref = doc(db, 'cardapios', dia);

  return onSnapshot(
    ref,
    (snap) => {
      const refeicoes = (snap.data()?.refeicoes as Refeicao[]) ?? [];
      onChange(refeicoes);
    },
    (erro) => {
      console.error('Erro ao assinar cardápio do dia:', erro);
      onErro?.(erro);
    }
  );
}

export async function adicionarRefeicao(dia: string, refeicao: Refeicao) {
  const ref = doc(db, 'cardapios', dia);
  await setDoc(ref, { refeicoes: arrayUnion(refeicao) }, { merge: true });
}

export async function salvarRefeicoesDoDia(dia: string, refeicoes: Refeicao[]) {
  const ref = doc(db, 'cardapios', dia);
  await setDoc(ref, { refeicoes }, { merge: true });
}

export async function salvarCardapioPorData(
  data: string,
  refeicoes: Refeicao[]
) {
  const ref = doc(db, 'historicoCardapios', data);

  await setDoc(ref, {
    data,
    refeicoes,
  }, { merge: true });
}