import { addDoc, arrayUnion, collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';

export type NovaTurmaInput = {
  nome: string;
  periodo: string;
  alunosIds: string[];
};

export type Turma = {
  id: string;
  nome: string;
  periodo: string;
  alunosIds: string[];
};

/** Cria uma nova turma no Firestore, vinculando os IDs dos alunos selecionados. */
export async function criarTurma(turma: NovaTurmaInput) {
  await addDoc(collection(db, 'turmas'), {
    ...turma,
    criadoEm: new Date().toISOString(),
  });
}

/** Lista todas as turmas cadastradas, usado no seletor do cadastro de aluno. */
export async function listarTurmas(): Promise<Turma[]> {
  const snap = await getDocs(collection(db, 'turmas'));

  return snap.docs.map((d) => {
    const dados = d.data();
    return {
      id: d.id,
      nome: dados.nome as string,
      periodo: dados.periodo as string,
      alunosIds: (dados.alunosIds as string[]) ?? [],
    };
  });
}

/** Adiciona um aluno à lista de alunos de uma turma (usado no cadastro do aluno). */
export async function adicionarAlunoATurma(turmaId: string, alunoId: string) {
  await updateDoc(doc(db, 'turmas', turmaId), {
    alunosIds: arrayUnion(alunoId),
  });
}