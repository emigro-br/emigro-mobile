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
  IconSize,
  QRCodeSize,
  AssetCode,
  PaymentType,
  TransactionDirection,
};