import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  const showNotice = useCallback((text) => {
    setNotice(text);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <NoticeContext.Provider value={showNotice}>
      {notice && (
        <div
          role="status"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "#323232",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 8,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {notice}
        </div>
      )}
      {children}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) {
    throw new Error("useNotice phải dùng bên trong NoticeProvider");
  }
  return context;
}
