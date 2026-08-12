'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicSettings, StoreBranding, StoreGeneral, StoreSEO, StoreShipping, StoreTax } from '../types/storefront';
import { storefrontApi } from '../services/storefrontApi';

interface SettingsContextType {
  settings: PublicSettings | null;
  branding: StoreBranding | null;
  seo: StoreSEO | null;
  shipping: StoreShipping | null;
  tax: StoreTax | null;
  general: StoreGeneral | null;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await storefrontApi.getPublicSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        branding: settings?.branding || null,
        seo: settings?.seo || null,
        shipping: settings?.shipping || null,
        tax: settings?.tax || null,
        general: settings?.general || null,
        isLoading, 
        refreshSettings: fetchSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
