import { IAnchorParams } from '@/types/IAnchorParams';

export const getInteractiveUrl = async (anchorParams: IAnchorParams) => {
  const anchorUrl = `${process.env.BACKEND_URL}/anchor/${anchorParams.operation}`;

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
  }
};