import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  INITIAL_MODULE_STATE,
  buildInitialCounters,
  formatTokenNumber,
  makeToken,
  MINUTES_PER_PATIENT,
} from '../data/mockTokens';

const STORAGE_KEY = 'sehatline_tokens_v1';
const TICK_MS = 9000; // simulated queue movement interval

const TokenContext = createContext(null);

export function TokenProvider({ children }) {
  const [moduleState, setModuleState] = useState(INITIAL_MODULE_STATE);
  const [counters, setCounters] = useState(buildInitialCounters());
  const [myTokens, setMyTokens] = useState([]); // tokens generated on this device

  const hydratedRef = useRef(false);
  // Always-fresh mirrors so callbacks/interval ticks never act on stale closures.
  const moduleStateRef = useRef(moduleState);
  const myTokensRef = useRef(myTokens);
  useEffect(() => {
    moduleStateRef.current = moduleState;
  }, [moduleState]);
  useEffect(() => {
    myTokensRef.current = myTokens;
  }, [myTokens]);

  // Restore any previously generated tokens for this device/session
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.moduleState) {
            setModuleState(parsed.moduleState);
            moduleStateRef.current = parsed.moduleState;
          }
          if (parsed?.myTokens) {
            setMyTokens(parsed.myTokens);
            myTokensRef.current = parsed.myTokens;
          }
        }
      } catch (e) {
        // ignore corrupt storage
      } finally {
        hydratedRef.current = true;
      }
    })();
  }, []);

  // Persist whenever state changes (after initial hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ moduleState, myTokens })).catch(() => {});
  }, [moduleState, myTokens]);

  // Simulate the queue slowly moving forward so the demo feels alive.
  useEffect(() => {
    const interval = setInterval(() => {
      // 1) advance "now serving" per module
      const nextModuleState = { ...moduleStateRef.current };
      Object.keys(nextModuleState).forEach((mod) => {
        const m = nextModuleState[mod];
        if (m.nowServing < m.lastIssued) {
          nextModuleState[mod] = { ...m, nowServing: m.nowServing + 1 };
        }
      });
      moduleStateRef.current = nextModuleState;
      setModuleState(nextModuleState);

      // 2) advance staff counters (cosmetic, independent mock movement)
      setCounters((prev) => {
        const next = {};
        Object.keys(prev).forEach((mod) => {
          next[mod] = prev[mod].map((c) => {
            if (!c.active) return c;
            if (Math.random() <= 0.55) return c;
            const match = c.servingToken.match(/-(\d+)$/);
            const num = match ? parseInt(match[1], 10) : 0;
            return {
              ...c,
              servingToken: formatTokenNumber(mod, num + 1),
              waiting: Math.max(0, c.waiting + (Math.random() > 0.6 ? -1 : 1)),
              completed: c.completed + 1,
            };
          });
        });
        return next;
      });

      // 3) sync my own tokens' statuses against the updated "now serving"
      const nextTokens = myTokensRef.current.map((t) => {
        if (t.status === 'cancelled' || t.status === 'completed') return t;
        const serving = nextModuleState[t.module]?.nowServing ?? 0;
        if (t.number === serving) return { ...t, status: 'serving' };
        if (t.number < serving) return { ...t, status: 'completed' };
        return t;
      });
      myTokensRef.current = nextTokens;
      setMyTokens(nextTokens);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const generateToken = useCallback((moduleCode, patientName) => {
    const current = moduleStateRef.current[moduleCode];
    const nextNumber = current.lastIssued + 1;
    const token = makeToken({ moduleCode, number: nextNumber, patientName });

    const nextModuleState = {
      ...moduleStateRef.current,
      [moduleCode]: { ...current, lastIssued: nextNumber },
    };
    moduleStateRef.current = nextModuleState;
    setModuleState(nextModuleState);

    const nextTokens = [token, ...myTokensRef.current];
    myTokensRef.current = nextTokens;
    setMyTokens(nextTokens);

    return token;
  }, []);

  const cancelToken = useCallback((tokenId) => {
    const nextTokens = myTokensRef.current.map((t) =>
      t.id === tokenId && (t.status === 'waiting' || t.status === 'serving')
        ? { ...t, status: 'cancelled' }
        : t
    );
    myTokensRef.current = nextTokens;
    setMyTokens(nextTokens);
  }, []);

  const regenerateToken = useCallback(
    (tokenId) => {
      const old = myTokensRef.current.find((t) => t.id === tokenId);
      if (!old) return null;

      const cancelledTokens = myTokensRef.current.map((t) =>
        t.id === tokenId ? { ...t, status: 'cancelled' } : t
      );
      myTokensRef.current = cancelledTokens;
      setMyTokens(cancelledTokens);

      return generateToken(old.module, old.patientName);
    },
    [generateToken]
  );

  const getQueueInfo = useCallback(
    (token) => {
      if (!token) return null;
      const m = moduleState[token.module] || { nowServing: 0, lastIssued: 0 };
      const isDone = token.status === 'completed' || token.status === 'cancelled';
      const isServingNow = token.status === 'serving';
      const patientsAhead = isDone ? 0 : Math.max(0, token.number - m.nowServing - (isServingNow ? 1 : 0));
      const estWaitMinutes = isDone ? 0 : patientsAhead * MINUTES_PER_PATIENT;
      return {
        nowServingCode: formatTokenNumber(token.module, m.nowServing),
        patientsAhead,
        estWaitMinutes,
      };
    },
    [moduleState]
  );

  const activeToken = useMemo(
    () => myTokens.find((t) => t.status === 'waiting' || t.status === 'serving') || null,
    [myTokens]
  );

  const value = useMemo(
    () => ({
      moduleState,
      counters,
      myTokens,
      activeToken,
      generateToken,
      cancelToken,
      regenerateToken,
      getQueueInfo,
    }),
    [moduleState, counters, myTokens, activeToken, generateToken, cancelToken, regenerateToken, getQueueInfo]
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) {
    throw new Error('useTokens must be used within a TokenProvider');
  }
  return ctx;
}

export default TokenContext;