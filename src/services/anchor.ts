import { IAnchorParams } from '@/types/IAnchorParams';
import { IAnchorResponse } from '@/types/IAnchorResponse';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { CryptoAsset } from '@/types/assets';

import { fetchWithTokenCheck } from './utils';

const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export type ConfirmWithdrawDto = {
  transactionId: string;
  assetCode: string;
  from: string;
};

export enum CallbackType {
  CALLBACK_URL,
  EVENT_POST_MESSAGE,
}

export const getInteractiveUrl = async (
  anchorParams: IAnchorParams,
  callback: CallbackType,
): Promise<IAnchorResponse> => {
  const anchorUrl = `${backendUrl}/anchor/${anchorParams.operation}`;
  try {
    const res = await fetch(anchorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anchorParams),
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json?.error?.message || res.statusText);
    }

    if (callback === CallbackType.CALLBACK_URL) {
      const assetCode = anchorParams.asset_code; // FIXME: I think this is not necessary
      json.url = `${json.url}&callback=${encodeURIComponent(`${backendUrl}/anchor/withdraw-callback?assetCode=${assetCode}`)}`;
    } else if (callback === CallbackType.EVENT_POST_MESSAGE) {
      json.url = `${json.url}&callback=postMessage`;
    }

    return json;
  } catch (error) {
    console.error(error);
    throw new Error('Could not get interactive url');
  }
};

export const getTransaction = async (id: string, assetCode: CryptoAsset): Promise<Sep24Transaction> => {
  const anchorUrl = `${backendUrl}/anchor/transaction?id=${id}&assetCode=${assetCode}`;
  try {
    const res = await fetchWithTokenCheck(anchorUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message);
    }

    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const confirmWithdraw = async (data: ConfirmWithdrawDto) => {
  const anchorUrl = `${backendUrl}/anchor/withdraw-confirm`;
  try {
    const response = await fetch(anchorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message);
    }

    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
