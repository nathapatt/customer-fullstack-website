import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { cookieUtils } from "../utils/cookies";
import { useSocket } from "../contexts/SocketContext";

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
  loading: boolean;
  clearSession: () => void;
  setSession: (sessionId: string, sessionData: SessionData) => void;
  reloadSession: () => void;
  validateWithBackend: () => Promise<boolean>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // Function to validate session with backend
  const validateWithBackend = async (): Promise<boolean> => {
    if (!sessionId) return false;

    try {
      const response = await fetch(
        `http://localhost:3000/sessions/${sessionId}/validate`
      );
      const result = await response.json();

      if (result.isValid) {
        // Update session data with latest info from backend
        if (result.session && result.session.expiresAt) {
          const updatedSessionData: SessionData = {
            id: sessionData?.id ?? result.session.id,
            tableId: sessionData?.tableId ?? result.session.tableId,
            createdAt: sessionData?.createdAt ?? result.session.createdAt,
            expiresAt: result.session.expiresAt,
            metaJson: sessionData?.metaJson ?? result.session.metaJson,
          };
          setSessionData(updatedSessionData);
          cookieUtils.setCookie(
            "customer_session_data",
            JSON.stringify(updatedSessionData),
            1
          );
        }
        return true;
      } else {
        // Session is invalid on backend - clear local session
        clearSession();
        return false;
      }
    } catch (error) {
      console.error("Failed to validate session with backend:", error);
      // On network error, don't clear session - allow offline usage
      return sessionId !== null;
    }
  };

  // Function to load session from cookies (synchronous loading first)
  const loadSessionFromStorage = () => {
    setLoading(true);
    try {
      const storedSessionId = cookieUtils.session.getSessionId();
      const storedSessionData = cookieUtils.getCookie("customer_session_data");

      if (storedSessionId && storedSessionData) {
        try {
          const parsedData = JSON.parse(storedSessionData);
          const now = new Date();
          const expiresAt = parsedData.expiresAt
            ? new Date(parsedData.expiresAt)
            : null;

          // Check local expiration first
          if (expiresAt && now >= expiresAt) {
            clearSession();
            setLoading(false);
            return;
          }

          // Set session data (locally valid)
          setSessionId(storedSessionId);
          setSessionData(parsedData);
          setLoading(false);

          // Validate with backend in the background (don't block UI)
          validateSessionInBackground(storedSessionId, parsedData);
        } catch (error) {
          console.error("Failed to parse session data:", error);
          clearSession();
          setLoading(false);
        }
      } else {
        setSessionId(null);
        setSessionData(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      setLoading(false);
    }
  };

  // Background validation function (doesn't block UI)
  const validateSessionInBackground = async (
    sessionId: string,
    sessionData: SessionData
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3000/sessions/${sessionId}/validate`
      );
      const result = await response.json();

      if (!result.isValid) {
        clearSession();
      } else if (result.session && result.session.expiresAt) {
        const updatedSessionData = {
          ...sessionData,
          expiresAt: result.session.expiresAt,
        };
        setSessionData(updatedSessionData);
        cookieUtils.setCookie(
          "customer_session_data",
          JSON.stringify(updatedSessionData),
          1
        );
      }
    } catch (error) {
      console.error("Background session validation failed:", error);
      // Don't clear session on network error
    }
  };

  // Auto-join table when session is available and socket is connected
  useEffect(() => {
    if (socket && sessionData?.tableId && sessionId) {
      // Join the table to receive table-specific socket events
      socket.emit("join_table", { tableId: sessionData.tableId, sessionId });
      console.log(
        `Joined table ${sessionData.tableId} for session ${sessionId}`
      );
    }
  }, [socket, sessionData?.tableId, sessionId]);

  // Load session from cookies on mount
  useEffect(() => {
    loadSessionFromStorage();
  }, []);

  // Listen to socket events for session invalidation
  useEffect(() => {
    if (!socket) return;

    const handleSessionEnded = (data: any) => {
      console.log("Received session_ended event:", data);
      // If the ended session matches our current session, clear it
      if (
        data.sessionId === sessionId ||
        (sessionData && data.tableId === sessionData.tableId)
      ) {
        console.log("Clearing session due to session_ended event");
        clearSession();
        // Show notification to user
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Session Ended", {
            body: data.reason || "Your session has been closed",
            icon: "/favicon.ico",
          });
        }
      }
    };

    const handleBillPaid = (data: any) => {
      // When bill is paid, session gets closed - validate our session
      if (sessionData && data.tableId === sessionData.tableId) {
        // Just clear the session immediately since bill payment closes sessions
        clearSession();
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Session Completed", {
            body: "Thank you for your payment! Your session has been completed.",
            icon: "/favicon.ico",
          });
        }
      }
    };

    // Add event listeners
    socket.on("session_ended", handleSessionEnded);
    socket.on("bill_paid", handleBillPaid);

    // Cleanup event listeners
    return () => {
      socket.off("session_ended", handleSessionEnded);
      socket.off("bill_paid", handleBillPaid);
    };
  }, [socket]); // Remove sessionId and sessionData from dependencies

  const setSession = (newSessionId: string, newSessionData: SessionData) => {
    setSessionId(newSessionId);
    setSessionData(newSessionData);
    cookieUtils.session.setSessionId(newSessionId);
    cookieUtils.setCookie(
      "customer_session_data",
      JSON.stringify(newSessionData),
      1
    );
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionData(null);
    cookieUtils.session.clearSession();
    cookieUtils.deleteCookie("customer_session_data");
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
        loading,
        clearSession,
        setSession,
        reloadSession,
        validateWithBackend,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
