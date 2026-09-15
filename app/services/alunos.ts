import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';

export type Aluno = {
  id: string;
  nome: string;
  email: string;
  rm?: string;
};

/** Busca todos os usuários do tipo "aluno" cadastrados no Firestore. */
export async function listarAlunos(): Promise<Aluno[]> {
  const q = query(collection(db, 'users'), where('tipo', '==', 'aluno'));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const dados = d.data();
    return {
      id: d.id,
      nome: (dados.nome as string) ?? dados.email,
      email: dados.email as string,
      rm: dados.rm as string | undefined,
    };
  });
}