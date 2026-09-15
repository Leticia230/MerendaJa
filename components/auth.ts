import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '../components/firebaseConfig';

export type TipoUsuario = 'aluno' | 'instituicao';

export async function cadastrar(
  email: string,
  senha: string,
  tipo: TipoUsuario,
  dadosExtras: Record<string, unknown> = {}
) {
  const usuario = await createUserWithEmailAndPassword(
    auth,
    email,
    senha
  );

  // Grava o tipo do usuário (e quaisquer dados extras, como nome e RM)
  // no Firestore, usado depois pelo AuthContext e por telas como
  // NovaTurma para listar os alunos cadastrados.
  await setDoc(doc(db, 'users', usuario.user.uid), {
    email,
    tipo,
    ...dadosExtras,
    criadoEm: new Date().toISOString(),
  });

  return usuario;
}

export async function login(email: string, senha: string) {
  const usuario = await signInWithEmailAndPassword(
    auth,
    email,
    senha
  );

  return usuario;
}