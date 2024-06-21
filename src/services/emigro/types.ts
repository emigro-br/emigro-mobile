//-- Auth
export const enum Role {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export type UserCredential = {
  session: AuthSession;
  user: User;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenExpirationDate: Date;
};

export type ConfirmUserRequest = {
  externalId: string;
  email: string;
  code: string;
};

export type RegisterUserRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  [key: string]: string;
};

//-- Users

export type User = {
  id: string;
  externalId: string;
  publicKey: string;
  secretKey: string;
  role: Role;
  status: string;
  createdAt: string;
  updatedAt: string;
  preferences: Record<string, any>;
};

export type UserProfile = {
  sub: string;
  address: string;
  email_verified: string;
  given_name: string;
  family_name: string;
  custom_role: string;
  email: string;
};

export type StellarAccount = {
  publicKey: string;
  secretKey?: string;
  balances: Balance[];
};

export type Balance = {
  balance: string; // TODO: convert to number
  assetType: string;
  assetCode: string;
};

//-- Anchors

export type InteractiveUrlRequest = {
  asset_code: string;
  // keep this type, we can add more fields in the future
};

export type InteractiveUrlResponse = {
  id: string; // anchor transactionId
  type: string;
  url: string;
};

//-- Transactions

export type TransactionType =
  | 'transfer'
  | 'payment'
  | 'withdrawal'
  | 'deposit'
  | 'swap'
  | 'exchange'
  | 'fee'
  | 'refund'
  | 'other';

export type CreateTransactionRequest = {
  type: TransactionType;
  maxAmountToSend: string | undefined;
  destinationAmount: string;
  destination: string;
  sourceAssetCode: string;
  destinationAssetCode: string;
  idempotencyKey?: string;
};

export type CreateSwapTransaction = {
  fromAsset: string;
  toAsset: string;
  amount: number;
  estimated: number;
  idempotencyKey?: string;
};

export type CreateTransferTransaction = {
  destinationAddress: string;
  assetCode: string;
  amount: number;
  idempotencyKey?: string;
};

export type CreatePaymentTransaction = {
  destinationAddress: string;
  sendAssetCode: string;
  destAssetCode: string;
  destAmount: number;
  sendMax: number;
  idempotencyKey?: string;
};

export type Transaction = {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: number;
  status: string;
  createdAt: Date;
};

// DERECATED: old transaction response
export type PaymentResponse = {
  transactionHash: string;
  sourceAccount: string;
  type: string;
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  from: string;
  to: string;
  amount: string;
  path: string[];
  sourceAmount: string;
  sourceAssetType: string;
  sourceAssetCode: string;
  sourceAssetIssuer: string;
};

// PIX

export type BrcodePaymentRequest = {
  brcode: string;
  exchangeAsset: string;
  amount: number;
  taxId: string;
  description: string;
};

export type BrcodePaymentResponse = {
  id: string;
  brcode: string;
  taxId: string;
  description: string;
  amount: number;
  status: string;
};

export type DictKey = {
  pixKey: string;
  taxId: string;
  bankName: string;
};

export type PixPaymentPreview = {
  brcode: string;
  pixKey: string;
  amount: number;
  currency?: string;
  bankName: string;
  name: string;
  taxId: string;
  txId: string;
};

//-- Stellar Network
export enum Sep24TransactionStatus {
  COMPLETED = 'completed',
  ERROR = 'error',
  INCOMPLETE = 'incomplete',
  NON_INTERACTIVE_CUSTOMER_INFO_NEEDED = 'non_interactive_customer_info_needed',
  PENDING_ANCHOR = 'pending_anchor',
  PENDING_CUSTOMER_INFO_UPDATE = 'pending_customer_info_update',
  PENDING_EXTERNAL = 'pending_external',
  PENDING_RECEIVER = 'pending_receiver',
  PENDING_SENDER = 'pending_sender',
  PENDING_STELLAR = 'pending_stellar',
  PENDING_TRANSACTION_INFO_UPDATE = 'pending_transaction_info_update',
  PENDING_TRUST = 'pending_trust',
  PENDING_USER = 'pending_user',
  PENDING_USER_TRANSFER_START = 'pending_user_transfer_start',
}

export type Sep24Transaction = {
  amount_fee: string;
  amount_in: string;
  amount_out: string;
  completed_at: string | null;
  external_transaction_id: string;
  from: string;
  id: string;
  kind: string;
  message: string;
  more_info_url: string;
  refunded: boolean;
  started_at: string;
  status: Sep24TransactionStatus;
  status_eta: string | null;
  stellar_transaction_id: string | null;
  to: string | null;
  withdraw_anchor_account: string;
  withdraw_memo: string;
  withdraw_memo_type: string;
};
