//-- Auth
export const enum Role {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenExpirationDate: Date;
  email: string; // required by Cognito signin/refresh
  publicKey?: string | null;
};

export type ConfirmUserRequest = {
  email: string;
  username: string;
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

// TODO: maybe this is the User
export type RegisterUserResponse = {
  id: number;
  username: string;
  publicKey: string;
  secretKey: string;
  role: Role;
  status: string;
  createdAt: string;
  updatedAt: string;
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

export type TransactionRequest = {
  type: TransactionType;
  maxAmountToSend: string | undefined;
  destinationAmount: string;
  destination: string;
  sourceAssetCode: string;
  destinationAssetCode: string;
  idempotencyKey?: string;
};

export type Transaction = {
  createdAt: Date;
  amount: string;
  assetCode: string;
  direction: string;
  sourceAssetCode: string;
  sourceAmount: string;
  type: string;
};

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

//-- Users

export type UserProfile = {
  sub: string;
  address: string;
  email_verified: string;
  given_name: string;
  family_name: string;
  custom_role: string;
  email: string;
};

export type Balance = {
  balance: string; // TODO: convert to number
  assetType: string;
  assetCode: string;
};
