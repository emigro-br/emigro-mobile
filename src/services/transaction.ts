import { api } from './api';

type BrcodePaymentRequest = {
  brcode: string;
  sourceAsset: string;
  amount: number;
  taxId: string;
  description: string;
};

export type DictKey = {
  pixKey: string;
  taxId: string;
  bankName: string;
};

export const dictKey = async (key: string): Promise<DictKey> => {
  const res = await api().get(`/transaction/dict-key/${key}`);
  return res.data;
};

export const brcodePayment = async (data: BrcodePaymentRequest) => {
  const res = await api({ timeout: 30000 }).post('/transaction/brcode-payment', data);
  return res.data;
};
