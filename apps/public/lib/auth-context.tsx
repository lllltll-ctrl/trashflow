'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AuthModal } from '@/components/auth-modal';

type AuthCtx = {
  session: boolean;
  loading: boolean;
  showSignIn: () => void;
  signOut: () => void;
};

const STORAGE_KEY = 'tf_resident_session';

const Ctx = createContext<AuthCtx>({
  session: false,
  loading: true,
  showSignIn: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      setSession(!!localStorage.getItem(STORAGE_KEY));
    } catch { /* private browsing */ }
    setLoading(false);
  }, []);

  const showSignIn = useCallback(() => setModalOpen(true), []);

  const signIn = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* ignore */ }
    setSession(true);
    setModalOpen(false);
  }, []);

  const signOut = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setSession(false);
  }, []);

  const value = useMemo(
    () => ({ session, loading, showSignIn, signOut }),
    [session, loading, showSignIn, signOut],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} onSignIn={signIn} />
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
