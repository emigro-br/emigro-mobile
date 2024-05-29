import { CryptoAsset } from '@/types/assets';

import { api, backendUrl } from './api';
import { InteractiveUrlRequest, InteractiveUrlResponse, Sep24Transaction } from './types';

const enum OperationType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum CallbackType {
  CALLBACK_URL,
  EVENT_POST_MESSAGE,
}

export type ConfirmWithdrawDto = {
  transactionId: string;
  assetCode: string;
};

const getInteractiveUrl = async (
  operation: OperationType,
  params: InteractiveUrlRequest,
  callback: CallbackType,
): Promise<InteractiveUrlResponse> => {
  const endpoint = operation === OperationType.WITHDRAW ? 'withdraw' : 'deposit';
  const timeout = 15 * 1000;
  const res = await api({ timeout }).post(`/anchor/${endpoint}`, params);

  const json = res.data;
  if (callback === CallbackType.CALLBACK_URL) {
    const assetCode = params.asset_code; // FIXME: I think this is not necessary
    json.url = `${json.url}&callback=${encodeURIComponent(`${backendUrl}/anchor/withdraw-callback?assetCode=${assetCode}`)}`;
  } else if (callback === CallbackType.EVENT_POST_MESSAGE) {
    json.url = `${json.url}&callback=postMessage`;
  }

  return json;
};

export const depositUrl = async (params: InteractiveUrlRequest, callback: CallbackType) => {
  return getInteractiveUrl(OperationType.DEPOSIT, params, callback);
};

export const withdrawUrl = async (params: InteractiveUrlRequest, callback: CallbackType) => {
  return getInteractiveUrl(OperationType.WITHDRAW, params, callback);
};

export const getTransaction = async (id: string, assetCode: CryptoAsset): Promise<Sep24Transaction> => {
  const timeout = 20 * 1000;
  const res = await api({ timeout }).get('/anchor/transaction', {
    params: {
      id,
      assetCode,
    },
  });
  return res.data;
};

export const confirmWithdraw = async (data: ConfirmWithdrawDto) => {
  const timeout = 30 * 1000;
  const res = await api({ timeout }).post('/anchor/withdraw-confirm', data);
  return res.data;
};
