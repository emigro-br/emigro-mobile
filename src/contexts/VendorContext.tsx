import React, { createContext, useContext, useState } from 'react';

import { IVendor } from '../types/IVendor';

type VendorContextProviderProps = {
  children: React.ReactNode;
};

type VendorContextType = {
  scannedVendor: IVendor | null;
  setScannedVendor: (vendor: IVendor | null) => void;
};

const VendorContext = createContext<VendorContextType>({
  scannedVendor: null,
  setScannedVendor: () => {},
});

export const useVendor = (): VendorContextType => useContext(VendorContext);

export const VendorContextProvider = ({ children }: VendorContextProviderProps) => {
  const [scannedVendor, setScannedVendor] = useState<IVendor | null>(null);

  return <VendorContext.Provider value={{ scannedVendor, setScannedVendor }}>{children}</VendorContext.Provider>;
};
