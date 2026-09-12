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
  icon: string; // nome de um ícone do MaterialCommunityIcons
  color: string; // cor de fundo do ícone, ex: '#FFD79A'
};

/**
 * Escuta em tempo real as refeições cadastradas para um dia.
 * Retorna a função de "unsubscribe" — chame no cleanup do useEffect.
 */
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

/** Adiciona uma nova refeição ao dia (não afeta as demais já cadastradas). */
export async function adicionarRefeicao(dia: string, refeicao: Refeicao) {
  const ref = doc(db, 'cardapios', dia);
  await setDoc(ref, { refeicoes: arrayUnion(refeicao) }, { merge: true });
}

/** Substitui a lista inteira de refeições do dia — usado para editar/remover. */
export async function salvarRefeicoesDoDia(dia: string, refeicoes: Refeicao[]) {
  const ref = doc(db, 'cardapios', dia);
  await setDoc(ref, { refeicoes }, { merge: true });
}
