const AUTH_ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_ID_TOKEN_KEY = 'idToken';
const AUTH_EMAIL_KEY = 'email';

const enum QRCodeSize {
  Small = 200,
  Medium = 250,
  Large = 300,
}

const enum IconSize {
  Small = 24,
  Medium = 32,
  Large = 48,
}

const enum AssetCode {
  USDC = 'USDC',
  USD = 'USD',
  BRL = 'BRL',
}

const enum PaymentType {
  PathPaymentStrictReceive = 'path_payment_strict_receive',
  Payment = 'payment',
}

const enum TransactionDirection {
  Sent = 'sent',
  Received = 'received',
}

export {
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_ID_TOKEN_KEY,
  AUTH_EMAIL_KEY,
  IconSize,
  QRCodeSize,
  AssetCode,
  PaymentType,
  TransactionDirection,
};
