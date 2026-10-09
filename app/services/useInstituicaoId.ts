import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../components/firebaseConfig';

export function useInstituicaoId() {
  const [instituicaoId, setInstituicaoId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setInstituicaoId(null);
        setCarregando(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setInstituicaoId((snap.data()?.instituicaoId as string | undefined) ?? null);
      } catch (e) {
        console.error('Erro ao obter a instituição do aluno:', e);
        setInstituicaoId(null);
      } finally {
        setCarregando(false);
      }
    });

    return cancelar;
  }, []);

  return { instituicaoId, carregando };
}