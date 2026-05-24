"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { EmailModal } from "./EmailModal";

export type PlanChoice = "free" | "subscribe";

type ModalCtx = {
  openModal: (plan?: PlanChoice) => void;
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
  const [initialPlan, setInitialPlan] = useState<PlanChoice | null>(null);

  const openModal = useCallback((p?: PlanChoice) => {
    setInitialPlan(p ?? null);
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
        initialPlan={initialPlan}
      />
    </Ctx.Provider>
  );
}
