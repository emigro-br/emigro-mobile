import { IAnchorParams } from '@/types/IAnchorParams';
import { IAnchorResponse } from '@/types/IAnchorResponse';

export const getInteractiveUrl = async (anchorParams: IAnchorParams): Promise<IAnchorResponse> => {
  const anchorUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/anchor/${anchorParams.operation}`;
  try {
    const response = await fetch(anchorUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(anchorParams),
    });
    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error();
  }
};
