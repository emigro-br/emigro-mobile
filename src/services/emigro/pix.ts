import { api } from './api';
import { BrcodePaymentRequest, BrcodePaymentResponse, PixPaymentPreview } from './types';

// export const dictKey = async (key: string): Promise<DictKey> => {
//   const res = await api().get(`/transaction/dict-key/${key}`);
//   return res.data;
// };

export const brcodePaymentPreview = async (brcode: string): Promise<PixPaymentPreview> => {
  const res = await api().post('/pix/payment-preview', {
    brcode,
  });
  return res.data;
};

export const createBrcodePayment = async (data: BrcodePaymentRequest): Promise<BrcodePaymentResponse> => {
  const timeout = 15 * 1000; // some transactions may take longer
  const res = await api({ timeout }).post('/pix/brcode-payment', data);
  return res.data;
};

export const getBrcodePayment = async (transactionId: string): Promise<BrcodePaymentResponse> => {
  const res = await api().get(`/pix/brcode-payment/${transactionId}`);
  return res.data;
};
