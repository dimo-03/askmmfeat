import { useContext } from 'react';
import { DonateModalContext } from '@/context/DonateModalContext';

export function useDonateModal() {
  const context = useContext(DonateModalContext);
  if (!context) throw new Error('useDonateModal must be used inside DonateModalProvider');
  return context;
}
