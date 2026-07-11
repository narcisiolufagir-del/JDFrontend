import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AuthModal } from "@/components/AuthModal";

type AuthMode = "login" | "signup";

type AuthModalContextType = {
  isOpen: boolean;
  mode: AuthMode;
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
  setMode: (mode: AuthMode) => void;
};

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const openLogin = useCallback(() => {
    setMode("login");
    setIsOpen(true);
  }, []);

  const openSignup = useCallback(() => {
    setMode("signup");
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, openLogin, openSignup, close, setMode }}>
      {children}
      <AuthModal />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}
