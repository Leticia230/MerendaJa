import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import { db, auth } from '../../components/firebaseConfig';

export type Aluno = {
  id: string;
  nome: string;
  email: string;
  rm?: string;
  turmaId?: string;
  turmaNome?: string;
  periodo?: string;
  restricoesAlimentares?: string;
  instituicaoId?: string;
};

function mapearAluno(id: string, dados: any): Aluno {
  return {
    id,
    nome: (dados.nome as string) ?? dados.email,
    email: dados.email as string,
    rm: dados.rm as string | undefined,
    turmaId: dados.turmaId as string | undefined,
    turmaNome: dados.turmaNome as string | undefined,
    periodo: dados.periodo as string | undefined,
    restricoesAlimentares: dados.restricoesAlimentares as string | undefined,
    instituicaoId: dados.instituicaoId as string | undefined,
  };
}

/** Lista só os alunos da instituição logada (ou da informada). */
export async function listarAlunos(instituicaoId?: string): Promise<Aluno[]> {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');

  const q = query(
    collection(db, 'users'),
    where('tipo', '==', 'aluno'),
    where('instituicaoId', '==', id)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => mapearAluno(d.id, d.data()));
}

export async function buscarPerfilAluno(alunoId: string): Promise<Aluno | null> {
  const snap = await getDoc(doc(db, 'users', alunoId));
  if (!snap.exists()) return null;
  return mapearAluno(snap.id, snap.data());
}

export async function salvarRestricoesAlimentares(
  alunoId: string,
  restricoesAlimentares: string
) {
  await updateDoc(doc(db, 'users', alunoId), {
    restricoesAlimentares: restricoesAlimentares.trim(),
  });
}