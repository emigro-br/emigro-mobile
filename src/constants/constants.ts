const AUTH_ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_ID_TOKEN_KEY = 'idToken';
const AUTH_EMAIL_KEY = 'email';

const enum QRCodeSize {
  SMALL = 200,
  MEDIUM = 250,
  LARGE = 300,
}

const enum IconSize {
  SMALL = 24,
  MEDIUM = 32,
  LARGE = 48,
}

const enum AssetCode {
  USDC = 'USDC',
  USD = 'USD',
  BRL = 'BRL',
}

const enum PaymentType {
  PATH_PAYMENT_STRICT_RECEIVE = 'path_payment_strict_receive',
  PAYMENT = 'payment',
}

const enum TransactionDirection {
  SENT = 'sent',
  RECEIVED = 'received',
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
