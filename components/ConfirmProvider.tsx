"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return ctx.confirm;
}

export default function ConfirmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  function handleChoice(result: boolean) {
    setOptions(null);
    if (resolver) resolver(result);
    setResolver(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-bg-surface border border-border rounded-xl p-6 max-w-sm w-full animate-modal-in">
            <h2 className="font-display text-lg font-semibold text-text-primary mb-2">
              {options.title}
            </h2>
            <p className="text-text-muted text-sm mb-6">{options.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleChoice(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-bg-base transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleChoice(true)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  options.danger
                    ? "bg-red-400 hover:brightness-110 text-bg-base"
                    : "bg-accent hover:brightness-110 text-bg-base"
                }`}
              >
                {options.confirmLabel || "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}