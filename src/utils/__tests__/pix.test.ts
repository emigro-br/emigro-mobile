import * as pixUtils from 'pix-utils';

import { brCodeFromMercadoPagoUrl } from '../pix';

describe('brCodeFromMercadoPagoUrl', () => {
  const merchantName = 'Mercado Pago';
  const merchantCity = 'São Paulo';

  it('should return the correct PixDynamicObject for a valid Mercado Pago URL', () => {
    const url =
      'https://qr.mercadopago.com/instore/o/v2/7af53cbc-8023-429d-afd9-90a207286fd15204000053039865802BR5909Merc';

    const result = brCodeFromMercadoPagoUrl(url, merchantName, merchantCity);

    const expectedPix =
      '00020126940014br.gov.bcb.pix2572pix-qr.mercadopago.com/instore/o/v2/7af53cbc-8023-429d-afd9-90a207286fd15204000053039865802BR5912MERCADO PAGO6009SAO PAULO62070503***6304E310';
    expect(result).toEqual(expectedPix);
  });

  it('should throw an error for an invalid Mercado Pago URL', () => {
    const url = 'https://example.com';

    expect(() => {
      brCodeFromMercadoPagoUrl(url, merchantName, merchantCity);
    }).toThrow('Invalid Mercado Pago URL');
  });

  it('should throw an error if creating the dynamic Mercado Pago URL fails', () => {
    const url = 'https://qr.mercadopago.com/abc123';
    jest.spyOn(pixUtils, 'hasError').mockReturnValueOnce(true);

    expect(() => {
      brCodeFromMercadoPagoUrl(url, merchantName, merchantCity);
    }).toThrow('Could not create the dynamic Mercado Pago URL');
  });
});
