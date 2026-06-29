import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveRoleFromEmail, ROLE_META } from '../data/roles';

const STORAGE_KEY = 'sehatline_auth_user';

const AuthContext = createContext(null);

const emptyUser = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  address: '',
  profileImage: null,
  role: 'patient',
  joinDate: '',
};

function titleCaseFromEmail(email) {
  const namePart = String(email).split('@')[0] || 'User';
  return namePart
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = signed out
  const [isGuest, setIsGuest] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.isGuest) {
            setIsGuest(true);
            setUser(parsed.user || null);
          } else if (parsed?.user) {
            setUser(parsed.user);
          }
        }
      } catch (e) {
        // ignore corrupt storage
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persist = useCallback(async (nextUser, nextIsGuest) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user: nextUser, isGuest: nextIsGuest })
      );
      // Mirror into the legacy 'userData' key for any older/untouched
      // screens that may still read it directly.
      if (nextUser) {
        await AsyncStorage.setItem('userData', JSON.stringify(nextUser));
      }
    } catch (e) {
      // best-effort local persistence only
    }
  }, []);

  /**
   * Mock login — no backend call. Role is resolved purely from the
   * hardcoded email map; any other (registered) email becomes a Patient.
   */
  const login = useCallback(
    async (email, _password) => {
      const role = resolveRoleFromEmail(email);
      const nextUser = {
        ...emptyUser,
        name: titleCaseFromEmail(email),
        email: String(email).trim(),
        role,
        joinDate: new Date().toLocaleDateString(),
      };
      setUser(nextUser);
      setIsGuest(false);
      await persist(nextUser, false);
      return nextUser;
    },
    [persist]
  );

  const signup = useCallback(
    async ({ name, email, phone }) => {
      const role = resolveRoleFromEmail(email);
      const nextUser = {
        ...emptyUser,
        name: name || titleCaseFromEmail(email),
        email: String(email).trim(),
        phone: phone || '',
        role,
        joinDate: new Date().toLocaleDateString(),
      };
      setUser(nextUser);
      setIsGuest(false);
      await persist(nextUser, false);
      return nextUser;
    },
    [persist]
  );

  const loginAsGuest = useCallback(async () => {
    const guestUser = {
      ...emptyUser,
      name: 'Guest',
      email: '',
      role: 'patient',
      joinDate: new Date().toLocaleDateString(),
    };
    setUser(guestUser);
    setIsGuest(true);
    await persist(guestUser, true);
  }, [persist]);

  const updateProfile = useCallback(
    async (partial) => {
      setUser((prev) => {
        const next = { ...(prev || emptyUser), ...partial };
        persist(next, isGuest);
        return next;
      });
    },
    [persist, isGuest]
  );

  const logout = useCallback(async () => {
    setUser(null);
    setIsGuest(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('userData');
    } catch (e) {
      // ignore
    }
  }, []);

  const roleMeta = ROLE_META[user?.role || 'patient'];

  const value = useMemo(
    () => ({
      user,
      role: user?.role || 'patient',
      roleMeta,
      isGuest,
      isAuthenticated: !!user && !isGuest,
      hydrated,
      login,
      signup,
      loginAsGuest,
      updateProfile,
      logout,
    }),
    [user, isGuest, hydrated, roleMeta, login, signup, loginAsGuest, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;