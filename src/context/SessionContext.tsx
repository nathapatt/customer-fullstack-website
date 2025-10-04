import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const storedSessionData = localStorage.getItem('sessionData');

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
    }
  }, []);

  const setSession = (newSessionId: string, newSessionData: SessionData) => {
    setSessionId(newSessionId);
    setSessionData(newSessionData);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('sessionData', JSON.stringify(newSessionData));
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionData(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('sessionData');
  };

  const hasValidSession = sessionId !== null && sessionData !== null;

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        sessionData,
        hasValidSession,
        clearSession,
        setSession
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