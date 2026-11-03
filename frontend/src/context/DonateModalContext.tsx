import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';
import DonateModal from '@/components/donate/DonateModal';

interface DonateModalContextValue {
  openDonate: () => void;
  closeDonate: () => void;
}

export const DonateModalContext = createContext<DonateModalContextValue | null>(null);

export function DonateModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDonate = useCallback(() => setOpen(true), []);
  const closeDonate = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ openDonate, closeDonate }), [openDonate, closeDonate]);

  return (
    <DonateModalContext.Provider value={value}>
      {children}
      <DonateModal open={open} onClose={closeDonate} />
    </DonateModalContext.Provider>
  );
}
