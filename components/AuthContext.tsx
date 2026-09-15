// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebaseConfig';

type TipoUsuario = 'aluno' | 'instituicao' | null;

type AuthContextType = {
  user: User | null;
  tipo: TipoUsuario;
  carregando: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  tipo: null,
  carregando: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tipo, setTipo] = useState<TipoUsuario>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Busca o tipo salvo no Firestore no momento do cadastro
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        setTipo((snap.data()?.tipo as TipoUsuario) ?? null);
      } else {
        setTipo(null);
      }

      setCarregando(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, tipo, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}