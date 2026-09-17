import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

/**
 * Faz login e confirma que a conta é do tipo esperado
 * ('aluno' ou 'instituicao'). Se for do tipo errado, ou não tiver
 * documento em `users`, desloga na hora e lança um erro com `code`
 * para a tela mostrar a mensagem certa.
 */
export async function login(
  email: string,
  senha: string,
  tipoEsperado: TipoUsuario
) {
  const usuario = await signInWithEmailAndPassword(
    auth,
    email,
    senha
  );

  const snap = await getDoc(doc(db, 'users', usuario.user.uid));

  if (!snap.exists()) {
    await signOut(auth);
    throw { code: 'app/sem-perfil' };
  }

  const tipo = snap.data().tipo as TipoUsuario;

  if (tipo !== tipoEsperado) {
    // Desloga antes de propagar o erro, senão a pessoa fica
    // autenticada mesmo tendo entrado na tela errada.
    await signOut(auth);
    throw { code: 'app/tipo-incorreto', tipoReal: tipo };
  }

  return usuario;
}