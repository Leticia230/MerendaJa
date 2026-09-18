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

 
  await setDoc(doc(db, 'users', usuario.user.uid), {
    email,
    tipo,
    ...dadosExtras,
    criadoEm: new Date().toISOString(),
  });

  return usuario;
}


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
   
    await signOut(auth);
    throw { code: 'app/tipo-incorreto', tipoReal: tipo };
  }

  return usuario;
}