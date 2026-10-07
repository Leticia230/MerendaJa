import {
  doc,
  onSnapshot,
  setDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db, auth } from '../../components/firebaseConfig';

export type Refeicao = {
  titulo: string;
  desc: string;
  horario: string;
  icon: string;
  color: string;
  data?: string;
};

// Caminhos agora ficam dentro da instituição:
// instituicoes/{uid}/cardapios/{dia}
// instituicoes/{uid}/historicoCardapios/{data}
function cardapioRef(dia: string, instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return doc(db, 'instituicoes', id, 'cardapios', dia);
}

function historicoRef(data: string, instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return doc(db, 'instituicoes', id, 'historicoCardapios', data);
}

export function assinarCardapioDia(
  dia: string,
  onChange: (refeicoes: Refeicao[]) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string // opcional: o aluno passa o id da instituição dele
) {
  let ref;
  try {
    ref = cardapioRef(dia, instituicaoId);
  } catch (e) {
    onChange([]);
    onErro?.(e);
    return () => {};
  }

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
  await setDoc(
    cardapioRef(dia),
    { refeicoes: arrayUnion(refeicao) },
    { merge: true }
  );
}

export async function salvarRefeicoesDoDia(dia: string, refeicoes: Refeicao[]) {
  await setDoc(cardapioRef(dia), { refeicoes }, { merge: true });
}

export async function salvarCardapioPorData(data: string, refeicoes: Refeicao[]) {
  await setDoc(historicoRef(data), { data, refeicoes }, { merge: true });
}