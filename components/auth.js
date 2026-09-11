import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from '../components/firebaseConfig';

export async function cadastrar(email, senha) {
  const usuario = await createUserWithEmailAndPassword(
    auth,
    email,
    senha
  );

  return usuario;
}

export async function login(email, senha) {
  const usuario = await signInWithEmailAndPassword(
    auth,
    email,
    senha
  );

  return usuario;
}