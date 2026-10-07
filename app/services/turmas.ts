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
import { db, auth } from '../../components/firebaseConfig';

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

// Caminho: instituicoes/{instituicaoId}/turmas
// Se não passar o id, usa o da instituição logada.
function turmasCol(instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return collection(db, 'instituicoes', id, 'turmas');
}

function turmaRef(turmaId: string, instituicaoId?: string) {
  const id = instituicaoId ?? auth.currentUser?.uid;
  if (!id) throw new Error('Usuário não autenticado.');
  return doc(db, 'instituicoes', id, 'turmas', turmaId);
}

/** Cria uma nova turma na instituição logada. */
export async function criarTurma(turma: NovaTurmaInput) {
  await addDoc(turmasCol(), {
    ...turma,
    criadoEm: new Date().toISOString(),
  });
}

/** Lista as turmas de uma instituição (busca única). */
export async function listarTurmas(instituicaoId?: string): Promise<Turma[]> {
  const snap = await getDocs(turmasCol(instituicaoId));
  return snap.docs.map((d) => mapearTurma(d.id, d.data()));
}

/** Escuta em tempo real as turmas da instituição logada. */
export function assinarTurmas(
  onChange: (turmas: Turma[]) => void,
  onErro?: (erro: unknown) => void
) {
  let col;
  try {
    col = turmasCol();
  } catch (e) {
    onChange([]);
    onErro?.(e);
    return () => {};
  }

  return onSnapshot(
    col,
    (snap) => onChange(snap.docs.map((d) => mapearTurma(d.id, d.data()))),
    (erro) => {
      console.error('Erro ao assinar turmas:', erro);
      onErro?.(erro);
    }
  );
}

/** Busca uma turma específica pelo ID. */
export async function buscarTurma(
  id: string,
  instituicaoId?: string
): Promise<Turma | null> {
  const snap = await getDoc(turmaRef(id, instituicaoId));
  if (!snap.exists()) return null;
  return mapearTurma(snap.id, snap.data());
}

/** Atualiza nome, período e/ou alunos de uma turma existente. */
export async function atualizarTurma(id: string, dados: Partial<NovaTurmaInput>) {
  await updateDoc(turmaRef(id), dados);
}

/** Adiciona um aluno à turma (usado no cadastro do aluno). */
export async function adicionarAlunoATurma(
  turmaId: string,
  alunoId: string,
  instituicaoId?: string
) {
  await updateDoc(turmaRef(turmaId, instituicaoId), {
    alunosIds: arrayUnion(alunoId),
  });
}