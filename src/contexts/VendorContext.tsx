import React, { createContext, useContext, useState } from 'react';

import { IVendor } from '../types/IVendor';

type VendorContextProviderProps = {
  children: React.ReactNode;
};

type VendorContextType = {
  scannedVendor: IVendor;
  setScannedVendor: (vendor: IVendor) => void;
};

const initialVendor: IVendor = {
  name: '',
  address: '',
  publicKey: '',
  amount: undefined,
  assetCode: undefined,
};

const VendorContext = createContext<VendorContextType>({
  scannedVendor: initialVendor,
  setScannedVendor: () => {},
});

export const useVendor = (): VendorContextType => useContext(VendorContext);

export const VendorContextProvider = ({ children }: VendorContextProviderProps) => {
  const [scannedVendor, setScannedVendor] = useState<IVendor>(initialVendor);

  return <VendorContext.Provider value={{ scannedVendor, setScannedVendor }}>{children}</VendorContext.Provider>;
};
