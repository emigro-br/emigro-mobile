import { api } from './api';
import { BrcodePaymentRequest, BrcodePaymentResponse, PixPaymentPreview } from './types';

// export const dictKey = async (key: string): Promise<DictKey> => {
//   const res = await api().get(`/transaction/dict-key/${key}`);
//   return res.data;
// };

// COMENTINTD TO DEBUG ERROR
//export const brcodePaymentPreview = async (brcode: string): Promise<PixPaymentPreview> => {
//  const res = await api().post('/pix/payment-preview', {
//    brcode,
//  });
//  return res.data;
//};

export const brcodePaymentPreview = async (brcode: string): Promise<PixPaymentPreview> => {
  try {
    const res = await api().post('/pix/payment-preview', { brcode });
    console.log('Payment Preview Response:', res.data);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error status:', error.response.status); // HTTP status
      console.error('Error headers:', error.response.headers); // Response headers
      console.error('Error data:', error.response.data); // Response body
    } else if (error.request) {
      console.error('No response received:', error.request); // Network request made but no response
    } else {
      console.error('Error setting up request:', error.message); // Error in request setup
    }
    throw error; // Re-throw to propagate error handling
  }
};



//export const createBrcodePayment = async (data: BrcodePaymentRequest): Promise<BrcodePaymentResponse> => {
//  const timeout = 15 * 1000; // some transactions may take longer
//  const res = await api({ timeout }).post('/pix/brcode-payment', data);
//  return res.data;
//};


export const createBrcodePayment = async (
  data: BrcodePaymentRequest,
): Promise<BrcodePaymentResponse> => {
  console.log('Raw Payment Request Data:', data); // Debugging

  // Convert your frontend data into exactly what the NestJS backend expects
  const formattedData = {
    // If you have a brcode, optionally send it
    brcode: data.brcode,
    // Or if you rely on pixKey
    pixKey: data.pixKey,
    amount: data.amount,
    exchangeAsset: data.exchangeAsset, // Must match a valid enum in the backend
    name: data.name,
    taxId: data.taxId,
    description: data.description,
    // idempotencyKey: data.idempotencyKey, // optional if you want
  };

  console.log('Formatted Payment Request:', JSON.stringify(formattedData, null, 2)); // Debugging

  const timeout = 15_000; // Allow for longer transactions
  // Send the single object (NOT an array) to the correct backend route
  const res = await api({ timeout }).post('/pix/brcode-payment', formattedData);
  return res.data;
};




export const getBrcodePayment = async (transactionId: string): Promise<BrcodePaymentResponse> => {
  const res = await api().get(`/pix/brcode-payment/${transactionId}`);
  return res.data;
};
