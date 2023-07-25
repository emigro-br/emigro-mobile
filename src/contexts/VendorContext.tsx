import React, { createContext, useContext, useState } from 'react';

import { Vendor } from '../types/vendor.type';

type VendorContextProviderProps = {
  children: React.ReactNode;
};

type VendorContextType = {
  scannedVendor: Vendor | null;
  setScannedVendor: (vendor: Vendor | null) => void;
};

const VendorContext = createContext<VendorContextType>({
  scannedVendor: null,
  setScannedVendor: () => {},
});

export const useVendor = (): VendorContextType => useContext(VendorContext);

export const VendorContextProvider = ({ children }: VendorContextProviderProps) => {
  const [scannedVendor, setScannedVendor] = useState<Vendor | null>(null);

  return <VendorContext.Provider value={{ scannedVendor, setScannedVendor }}>{children}</VendorContext.Provider>;
};
