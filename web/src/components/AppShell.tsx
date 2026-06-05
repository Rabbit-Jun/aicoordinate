"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { EmailModal } from "./EmailModal";
import type { ModalEntry } from "@/lib/analytics";

type ModalCtx = {
  openModal: (entry: ModalEntry) => void;
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
  const [entry, setEntry] = useState<ModalEntry>("hero");

  const openModal = useCallback((e: ModalEntry) => {
    setEntry(e);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <Ctx.Provider value={{ openModal }}>
      {children}
      <EmailModal isOpen={isOpen} onClose={closeModal} entry={entry} />
    </Ctx.Provider>
  );
}
