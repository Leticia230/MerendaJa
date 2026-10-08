import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  getAuth,
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
  const usuario = await createUserWithEmailAndPassword(auth, email, senha);

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
  const usuario = await signInWithEmailAndPassword(auth, email, senha);

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

export async function recuperarSenha(email: string) {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

/**
 * Cadastra um aluno SEM deslogar a instituição: a conta é criada por uma
 * segunda instância do Firebase, e o documento é gravado com a sessão
 * da instituição, já com o vínculo (instituicaoId).
 */
export async function cadastrarAluno(
  email: string,
  senha: string,
  dadosExtras: Record<string, unknown> = {}
) {
  const instituicao = auth.currentUser;
  if (!instituicao) throw { code: 'app/sem-sessao' };

  const secundario =
    getApps().find((a) => a.name === 'cadastro-aluno') ??
    initializeApp(getApp().options, 'cadastro-aluno');
  const authSecundario = getAuth(secundario);

  try {
    const cred = await createUserWithEmailAndPassword(authSecundario, email, senha);

    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      tipo: 'aluno',
      ...dadosExtras,
      instituicaoId: instituicao.uid,
      criadoEm: new Date().toISOString(),
    });

    return cred;
  } finally {
    await signOut(authSecundario);
  }
}

/** Para o lado do aluno: descobre a qual instituição ele pertence. */
export async function obterInstituicaoId(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return (snap.data()?.instituicaoId as string | undefined) ?? null;
}