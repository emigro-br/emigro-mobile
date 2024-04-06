import { createDynamicPix, hasError } from 'pix-utils';

/**
 * The Mercado Pago POS is generating their own URL and should be converted to a valid dynamic BR Code.
 * @param url
 * @returns a valid dynamic Pix BR Code for a Mercado Pago
 */
export const brCodeFromMercadoPagoUrl = (url: string, merchantName: string, merchantCity: string): string => {
  // replace https://
  let payloadUrl = url.replace('https://', '');
  if (payloadUrl.startsWith('qr.mercadopago.com')) {
    payloadUrl = `pix-${payloadUrl}`;
  } else {
    throw new Error('Invalid Mercado Pago URL');
  }

  // keep only the information before the merchantCategoryCode
  const merchantCategoryCode = '5204';
  if (payloadUrl.includes(merchantCategoryCode)) {
    payloadUrl = payloadUrl.substring(0, payloadUrl.indexOf(merchantCategoryCode));
  }

  const pix = createDynamicPix({
    url: payloadUrl,
    merchantName,
    merchantCity,
  });

  if (hasError(pix)) {
    throw new Error('Could not create the dynamic Mercado Pago URL');
  }

  return pix.toBRCode();
};
