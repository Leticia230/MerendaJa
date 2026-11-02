import { db, auth } from '../../components/firebaseConfig';

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  where,
  arrayUnion,
} from 'firebase/firestore';


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

// ===== Cardápio por data (novo) =====
// instituicoes/{uid}/cardapios/{AAAA-MM-DD}

function instId(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return id;
}

const cardapioDataRef = (data: string, instituicaoId?: string) =>
  doc(db, 'instituicoes', instId(instituicaoId), 'cardapios', data);

/** Refeições de UMA data. O aluno passa o id da instituição dele. */
export function assinarCardapioData(
  data: string,
  onChange: (refeicoes: Refeicao[]) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  let ref;
  try {
    ref = cardapioDataRef(data, instituicaoId);
  } catch (e) {
    onChange([]);
    onErro?.(e);
    return () => {};
  }

  return onSnapshot(
    ref,
    (snap) => onChange((snap.data()?.refeicoes as Refeicao[]) ?? []),
    (erro) => {
      console.error('Erro ao assinar cardápio da data:', erro);
      onErro?.(erro);
    }
  );
}

/** Datas com cardápio num intervalo (pontinhos do calendário). */
export function assinarDatasComCardapio(
  inicio: string,
  fim: string,
  onChange: (datas: string[]) => void,
  onErro?: (erro: unknown) => void,
  instituicaoId?: string
) {
  const col = collection(db, 'instituicoes', instId(instituicaoId), 'cardapios');
  const q = query(col, where('data', '>=', inicio), where('data', '<=', fim));

  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs
          .filter((d) => ((d.data().refeicoes as Refeicao[]) ?? []).length > 0)
          .map((d) => d.id)
      ),
    (erro) => {
      console.error('Erro ao assinar datas com cardápio:', erro);
      onErro?.(erro);
    }
  );
}

/** Substitui a lista de refeições da data. Lista vazia apaga o documento. */
export async function salvarCardapioData(data: string, refeicoes: Refeicao[]) {
  const ref = cardapioDataRef(data);
  if (refeicoes.length === 0) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, { data, refeicoes, atualizadoEm: new Date().toISOString() });
}

export async function adicionarRefeicaoNaData(data: string, refeicao: Refeicao) {
  await setDoc(
    cardapioDataRef(data),
    { data, refeicoes: arrayUnion(refeicao), atualizadoEm: new Date().toISOString() },
    { merge: true }
  );
}

export async function excluirRefeicaoDaData(data: string, index: number) {
  const ref = cardapioDataRef(data);
  const snap = await getDoc(ref);
  const atuais = (snap.data()?.refeicoes as Refeicao[]) ?? [];

  if (index < 0 || index >= atuais.length) {
    throw new Error('Refeição não encontrada.');
  }

  await salvarCardapioData(data, atuais.filter((_, i) => i !== index));
}

/** Remove uma refeição do cardápio do dia (e do histórico da data, se informada). */
export async function excluirRefeicao(dia: string, index: number, data?: string) {
  const snap = await getDoc(cardapioRef(dia));
  const atuais = (snap.data()?.refeicoes as Refeicao[]) ?? [];

  if (index < 0 || index >= atuais.length) {
    throw new Error('Refeição não encontrada.');
  }

  const novaLista = atuais.filter((_, i) => i !== index);

  await setDoc(cardapioRef(dia), { refeicoes: novaLista }, { merge: true });

  if (data) {
    await setDoc(historicoRef(data), { data, refeicoes: novaLista }, { merge: true });
  }
}

export async function atualizarRefeicaoDaData(
  data: string,
  index: number,
  refeicao: Refeicao
) {
  const snap = await getDoc(cardapioDataRef(data));
  const atuais = (snap.data()?.refeicoes as Refeicao[]) ?? [];

  if (index < 0 || index >= atuais.length) {
    throw new Error('Refeição não encontrada.');
  }

  const nova = [...atuais];
  nova[index] = refeicao;
  await salvarCardapioData(data, nova);
}