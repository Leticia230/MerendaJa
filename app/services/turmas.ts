import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
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

function mapearTurma(id: string, dados: any): Turma {
  return {
    id,
    nome: dados.nome as string,
    periodo: dados.periodo as string,
    alunosIds: (dados.alunosIds as string[]) ?? [],
  };
}

/** Cria uma nova turma no Firestore, vinculando os IDs dos alunos selecionados. */
export async function criarTurma(turma: NovaTurmaInput) {
  await addDoc(collection(db, 'turmas'), {
    ...turma,
    criadoEm: new Date().toISOString(),
  });
}

/** Lista todas as turmas cadastradas (busca única), usado no seletor do cadastro de aluno. */
export async function listarTurmas(): Promise<Turma[]> {
  const snap = await getDocs(collection(db, 'turmas'));
  return snap.docs.map((d) => mapearTurma(d.id, d.data()));
}

/**
 * Escuta em tempo real a lista de turmas — usado na tela Turmas, pra
 * refletir na hora qualquer turma criada, editada ou removida.
 */
export function assinarTurmas(
  onChange: (turmas: Turma[]) => void,
  onErro?: (erro: unknown) => void
) {
  return onSnapshot(
    collection(db, 'turmas'),
    (snap) => onChange(snap.docs.map((d) => mapearTurma(d.id, d.data()))),
    (erro) => {
      console.error('Erro ao assinar turmas:', erro);
      onErro?.(erro);
    }
  );
}

/** Busca uma turma específica pelo ID — usado ao abrir a tela em modo edição. */
export async function buscarTurma(id: string): Promise<Turma | null> {
  const snap = await getDoc(doc(db, 'turmas', id));
  if (!snap.exists()) return null;
  return mapearTurma(snap.id, snap.data());
}

/** Atualiza nome, período e/ou lista de alunos de uma turma existente. */
export async function atualizarTurma(id: string, dados: Partial<NovaTurmaInput>) {
  await updateDoc(doc(db, 'turmas', id), dados);
}

/** Adiciona um aluno à lista de alunos de uma turma (usado no cadastro do aluno). */
export async function adicionarAlunoATurma(turmaId: string, alunoId: string) {
  await updateDoc(doc(db, 'turmas', turmaId), {
    alunosIds: arrayUnion(alunoId),
  });
}