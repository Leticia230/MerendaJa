import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from './firebaseConfig';

export type TipoUsuario = 'aluno' | 'instituicao';

export async function cadastrar(
  email: string,
  senha: string,
  tipo: TipoUsuario
) {
  const usuario = await createUserWithEmailAndPassword(
    auth,
    email,
    senha
  );

  // Salva os dados do usuário no Firestore
  await setDoc(doc(db, 'users', usuario.user.uid), {
    email: email,
    tipo: tipo,
    criadoEm: serverTimestamp(),
  });

  return usuario;
}

export async function login(
  email: string,
  senha: string
) {
  const usuario = await signInWithEmailAndPassword(
    auth,
    email,
    senha
  );

  return usuario;
}
