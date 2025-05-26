// src/services/emigro/pix.ts

import { api } from './api';
import { BrcodePaymentRequest, BrcodePaymentResponse, PixPaymentPreview } from './types';

// Helper logs
function logRequest(endpoint: string, payload: any) {
  console.log(`[${endpoint}] Request:`, JSON.stringify(payload, null, 2));
}
function logResponse(endpoint: string, response: any) {
  console.log(`[${endpoint}] Response:`, JSON.stringify(response, null, 2));
}

/**
 * BR Code Payment Preview
 * Calls: POST /pix/payment-preview
 */
export const brcodePaymentPreview = async (brcode: string): Promise<PixPaymentPreview> => {
  const endpoint = 'POST /pix/payment-preview';
  const payload = { brcode };
  logRequest(endpoint, payload);

  try {
    const res = await api().post('/pix/payment-preview', payload);
    logResponse(endpoint, res.data);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`[${endpoint}] Error status:`, error.response.status);
      console.error(`[${endpoint}] Error headers:`, error.response.headers);
      console.error(`[${endpoint}] Error data:`, error.response.data);
    } else if (error.request) {
      console.error(`[${endpoint}] No response received:`, error.request);
    } else {
      console.error(`[${endpoint}] Error in setup:`, error.message);
    }
    throw error;
  }
};

/**
 * Create a new Brcode Payment
 * Calls: POST /pix/brcode-payment
 */
export const createBrcodePayment = async (
  data: BrcodePaymentRequest,
): Promise<BrcodePaymentResponse> => {
  const endpoint = 'POST /pix/brcode-payment';
  logRequest(endpoint, data);

  const timeout = 15_000;
  try {
    const res = await api({ timeout }).post('/pix/brcode-payment', data);
    logResponse(endpoint, res.data);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`[${endpoint}] Error status:`, error.response.status);
      console.error(`[${endpoint}] Error headers:`, error.response.headers);
      console.error(`[${endpoint}] Error data:`, error.response.data);
    } else if (error.request) {
      console.error(`[${endpoint}] No response received:`, error.request);
    } else {
      console.error(`[${endpoint}] Error in setup:`, error.message);
    }
    throw error;
  }
};

/**
 * Get Brcode Payment Status
 * Calls: GET /pix/brcode-payment/{transactionId}
 */
export const getBrcodePayment = async (transactionId: string): Promise<BrcodePaymentResponse> => {
  const endpoint = `GET /pix/brcode-payment/${transactionId}`;
  console.log(`[${endpoint}] Request (no body).`);

  try {
    const res = await api().get(`/pix/brcode-payment/${transactionId}`);
    logResponse(endpoint, res.data);
    return res.data;
  } catch (error: any) {
    if (error.response) {
      console.error(`[${endpoint}] Error status:`, error.response.status);
      console.error(`[${endpoint}] Error headers:`, error.response.headers);
      console.error(`[${endpoint}] Error data:`, error.response.data);
    } else if (error.request) {
      console.error(`[${endpoint}] No response received:`, error.request);
    } else {
      console.error(`[${endpoint}] Error in setup:`, error.message);
    }
    throw error;
  }
};
