// services/ofertas.ts
import {
  collection, query, where, onSnapshot, getDocs,
} from 'firebase/firestore';
import { db } from '../../components/firebaseConfig';
import { nomeTipoRefeicao } from './refeicaoUtils';

export type OfertaRefeicao = {
  id: string;
  data: string;            // YYYY-MM-DD
  tipo: string;            // será normalizado via nomeTipoRefeicao
  turmaId?: string;        // se ausente => vale para todas as turmas
  alunosIds?: string[];    // opcional: público-alvo específico
};

const COL = 'ofertasRefeicoes';

export function assinarOfertasPeriodo(
  inicio: string,
  fim: string,
  onData: (lista: OfertaRefeicao[]) => void,
  onError?: (e: unknown) => void,
) {
  const q = query(
    collection(db, COL),
    where('data', '>=', inicio),
    where('data', '<=', fim),
  );

  return onSnapshot(
    q,
    (snap) => {
      const lista = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<OfertaRefeicao, 'id'>),
      }));
      onData(
        lista.map((o) => ({ ...o, tipo: nomeTipoRefeicao(o.tipo) })),
      );
    },
    (e) => onError?.(e),
  );
}

// Fallback: se a coleção não existir, retorna lista vazia sem quebrar
export async function listarOfertasPeriodo(
  inicio: string,
  fim: string,
): Promise<OfertaRefeicao[]> {
  try {
    const q = query(
      collection(db, COL),
      where('data', '>=', inicio),
      where('data', '<=', fim),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<OfertaRefeicao, 'id'>),
      tipo: nomeTipoRefeicao((d.data() as any).tipo),
    }));
  } catch {
    return [];
  }
}