"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { EmailModal } from "./EmailModal";

type Platform = "ios" | "android" | null;

type ModalCtx = {
  openModal: (platform: Platform) => void;
};

const Ctx = createContext<ModalCtx | null>(null);

export function useEmailModal(): ModalCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useEmailModal must be used within <AppShell>");
  }
  return ctx;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  const openModal = useCallback((p: Platform) => {
    setPlatform(p);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Ctx.Provider value={{ openModal }}>
      {children}
      <EmailModal
        isOpen={isOpen}
        onClose={closeModal}
        platform={platform}
      />
    </Ctx.Provider>
  );
}
