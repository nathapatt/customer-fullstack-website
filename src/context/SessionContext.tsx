import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { cookieUtils } from '../utils/cookies';

interface SessionData {
  id: string;
  tableId: number;
  createdAt: string;
  expiresAt?: string;
  metaJson?: any;
}

interface SessionContextType {
  sessionId: string | null;
  sessionData: SessionData | null;
  hasValidSession: boolean;
  clearSession: () => void;
  setSession: (sessionId: string, sessionData: SessionData) => void;
  reloadSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Function to load session from cookies
  const loadSessionFromStorage = () => {
    const storedSessionId = cookieUtils.session.getSessionId();
    const storedSessionData = cookieUtils.getCookie('customer_session_data');

    if (storedSessionId && storedSessionData) {
      try {
        const parsedData = JSON.parse(storedSessionData);

        // Check if session is expired
        const now = new Date();
        const expiresAt = parsedData.expiresAt ? new Date(parsedData.expiresAt) : null;

        if (!expiresAt || now < expiresAt) {
          setSessionId(storedSessionId);
          setSessionData(parsedData);
        } else {
          // Session expired, clear it
          clearSession();
        }
      } catch (error) {
        console.error('Failed to parse session data:', error);
        clearSession();
      }
    } else {
      // No session data, clear state
      setSessionId(null);
      setSessionData(null);
    }
  };

  // Load session from cookies on mount
  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  const setSession = (newSessionId: string, newSessionData: SessionData) => {
    setSessionId(newSessionId);
    setSessionData(newSessionData);
    cookieUtils.session.setSessionId(newSessionId);
    cookieUtils.setCookie('customer_session_data', JSON.stringify(newSessionData), 1);
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionData(null);
    cookieUtils.session.clearSession();
    cookieUtils.deleteCookie('customer_session_data');
  };

  const reloadSession = () => {
    loadSessionFromStorage();
  };

  const hasValidSession = sessionId !== null && sessionData !== null;

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        sessionData,
        hasValidSession,
        clearSession,
        setSession,
        reloadSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};