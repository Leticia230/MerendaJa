import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../../components/firebaseConfig';
import { Plano } from '../../components/planos';

export type Assinatura = {
  plano: 'teste' | 'semestral' | 'anual';
  inicio: string;
  fim: string;
  ativa: boolean;
  cancelada: boolean;
  diasRestantes: number;
};

function aguardarUsuario(): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    let cancelar: (() => void) | undefined;

    cancelar = onAuthStateChanged(auth, (user) => {
      cancelar?.();
      resolve(user);
    });
  });
}

export async function obterAssinatura(): Promise<Assinatura | null> {
  const user = await aguardarUsuario();
  if (!user) return null;

  const snap = await getDoc(doc(db, 'users', user.uid));
  const a = snap.data()?.assinatura;
  if (!a?.plano || !a?.fim) return null;

  const msRestantes = new Date(a.fim).getTime() - Date.now();
  return {
    plano: a.plano,
    inicio: a.inicio,
    fim: a.fim,
    ativa: msRestantes > 0,
    cancelada: a.cancelada === true,
    diasRestantes: Math.max(0, Math.ceil(msRestantes / 86400000)),
  };
}

export async function assinaturaAtiva(): Promise<boolean> {
  const a = await obterAssinatura();
  return !!a && a.ativa;
}

export async function ativarPlano(plano: Plano) {
  const user = auth.currentUser;
  if (!user) throw new Error('Você precisa estar logado.');

  const ref = doc(db, 'users', user.uid);
  const atual = (await getDoc(ref)).data()?.assinatura;

  let inicio = new Date();
  if (plano.id !== 'teste' && atual?.plano && atual.plano !== 'teste' && atual.fim) {
    const fimAtual = new Date(atual.fim);
    if (fimAtual.getTime() > Date.now()) inicio = fimAtual;
  }
  const fim = somarMeses(inicio, plano.meses);

  await setDoc(
    ref,
    {
      assinatura: {
        plano: plano.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        cancelada: false,
        canceladaEm: null,
        ...(plano.id === 'teste' ? { testeUsado: true } : {}),
      },
    },
    { merge: true }
  );
}

export async function cancelarAssinatura() {
  const user = auth.currentUser;
  if (!user) throw new Error('Você precisa estar logado.');

  await setDoc(
    doc(db, 'users', user.uid),
    { assinatura: { cancelada: true, canceladaEm: new Date().toISOString() } },
    { merge: true }
  );
}

function somarMeses(data: Date, meses: number) {
  const d = new Date(data);
  d.setMonth(d.getMonth() + meses);
  return d;
}

export async function jaUsouTeste(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.data()?.assinatura?.testeUsado === true;
}