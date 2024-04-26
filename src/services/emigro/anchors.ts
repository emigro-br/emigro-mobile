import { IAnchorParams } from '@/types/IAnchorParams';
import { IAnchorResponse } from '@/types/IAnchorResponse';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { CryptoAsset } from '@/types/assets';

import { OperationType } from '@constants/constants';

import { api, backendUrl } from './api';

export type ConfirmWithdrawDto = {
  transactionId: string;
  assetCode: string;
  from: string;
};

export enum CallbackType {
  CALLBACK_URL,
  EVENT_POST_MESSAGE,
}

const getInteractiveUrl = async (
  operation: OperationType,
  anchorParams: IAnchorParams,
  callback: CallbackType,
): Promise<IAnchorResponse> => {
  const endpoint = operation === OperationType.WITHDRAW ? 'withdraw' : 'deposit';
  const timeout = 15 * 1000;
  const res = await api({ timeout }).post(`/anchor/${endpoint}`, anchorParams);

  const json = res.data;
  if (callback === CallbackType.CALLBACK_URL) {
    const assetCode = anchorParams.asset_code; // FIXME: I think this is not necessary
    json.url = `${json.url}&callback=${encodeURIComponent(`${backendUrl}/anchor/withdraw-callback?assetCode=${assetCode}`)}`;
  } else if (callback === CallbackType.EVENT_POST_MESSAGE) {
    json.url = `${json.url}&callback=postMessage`;
  }

  return json;
};

export const getInteractiveDepositUrl = async (anchorParams: IAnchorParams, callback: CallbackType) => {
  return getInteractiveUrl(OperationType.DEPOSIT, anchorParams, callback);
};

export const getInteractiveWithdrawUrl = async (anchorParams: IAnchorParams, callback: CallbackType) => {
  return getInteractiveUrl(OperationType.WITHDRAW, anchorParams, callback);
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
