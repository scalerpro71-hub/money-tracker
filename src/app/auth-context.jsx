import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();
  return <AuthCtx.Provider value={auth}>{children}</AuthCtx.Provider>;
}

export function useAuthCtx() {
  return useContext(AuthCtx);
}

export function useUserId() {
  const { user } = useAuthCtx();
  return user?.id;
}
