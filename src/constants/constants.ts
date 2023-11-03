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

const enum PaymentType {
  PATH_PAYMENT_STRICT_RECEIVE = 'path_payment_strict_receive',
  PAYMENT = 'payment',
}

const enum TransactionDirection {
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

const enum OperationType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

const enum Role {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export {
  IconSize,
  QRCodeSize,
  PaymentType,
  TransactionDirection,
  OperationType,
  Role,
};