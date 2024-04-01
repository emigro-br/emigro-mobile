import { api } from './api';

type PixPayment = {
  br_code: string;
  tax_id: string;
  description: string;
};

export type PixKey = {
  tax_id: string;
  bank_name: string;
};

export const dictKey = async (key: string): Promise<PixKey> => {
  const res = await api({ baseURL: 'http://127.0.0.1:8000/api' }).get(`/dict-key/${key}`);
  return res.data;
};

export const pay = async (data: PixPayment) => {
  const res = await api({ baseURL: 'http://127.0.0.1:8000/api', timeout: 30000 }).post('/payments', data);
  return res.data;
};
