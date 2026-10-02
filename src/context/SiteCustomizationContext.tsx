'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteCustomization } from '@/types';
import { api } from '@/lib/store';

interface SiteCustomizationContextValue {
  customization: SiteCustomization | null;
  reload: () => Promise<void>;
}

const SiteCustomizationContext = createContext<SiteCustomizationContextValue>({
  customization: null,
  reload: async () => {},
});

export function SiteCustomizationProvider({ children }: { children: React.ReactNode }) {
  const [customization, setCustomization] = useState<SiteCustomization | null>(null);

  const load = useCallback(async () => {
    const data = await api.getSiteCustomization();
    setCustomization(data);
  }, []);

  useEffect(() => {
    load();
    const handler = (e: StorageEvent) => {
      if (e.key === 'luxe_site_customization' || e.key === null) {
        load();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [load]);

  return (
    <SiteCustomizationContext.Provider value={{ customization, reload: load }}>
      {children}
    </SiteCustomizationContext.Provider>
  );
}

export function useSiteCustomization() {
  return useContext(SiteCustomizationContext);
}
