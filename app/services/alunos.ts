import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../../components/firebaseConfig';

export type Aluno = {
  id: string;
  nome: string;
  email: string;
  rm?: string;
  turmaId?: string;
  turmaNome?: string;
  periodo?: string;
  restricoesAlimentares?: string;
};

export async function listarAlunos(): Promise<Aluno[]> {
  const q = query(
    collection(db, 'users'),
    where('tipo', '==', 'aluno')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const dados = d.data();

    return {
      id: d.id,
      nome: (dados.nome as string) ?? dados.email,
      email: dados.email as string,
      rm: dados.rm as string | undefined,
      turmaId: dados.turmaId as string | undefined,
      turmaNome: dados.turmaNome as string | undefined,
      periodo: dados.periodo as string | undefined,
      restricoesAlimentares:
        dados.restricoesAlimentares as string | undefined,
    };
  });
}

export async function buscarPerfilAluno(
  alunoId: string
): Promise<Aluno | null> {
  const alunoRef = doc(db, 'users', alunoId);
  const snap = await getDoc(alunoRef);

  if (!snap.exists()) {
    return null;
  }

  const dados = snap.data();

  return {
    id: snap.id,
    nome: (dados.nome as string) ?? dados.email,
    email: dados.email as string,
    rm: dados.rm as string | undefined,
    turmaId: dados.turmaId as string | undefined,
    turmaNome: dados.turmaNome as string | undefined,
    periodo: dados.periodo as string | undefined,
    restricoesAlimentares:
      dados.restricoesAlimentares as string | undefined,
  };
}

export async function salvarRestricoesAlimentares(
  alunoId: string,
  restricoesAlimentares: string
) {
  const alunoRef = doc(db, 'users', alunoId);

  await updateDoc(alunoRef, {
    restricoesAlimentares: restricoesAlimentares.trim(),
  });
}