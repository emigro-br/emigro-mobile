//-- Auth
export const enum Role {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER',
}

export type IAuthSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenExpirationDate: Date;
  email: string; // required by Cognito signin/refresh
  publicKey?: string | null;
};

export interface IConfirmUser {
  email: string;
  username: string;
  code: string;
}

export interface IRegisterUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  [key: string]: string;
}

export interface IRegisterResponse {
  id: number;
  username: string;
  publicKey: string;
  secretKey: string;
  role: Role;
  status: string;
  createdAt: string;
  updatedAt: string;
}

//-- Anchors

export interface IAnchorParams {
  asset_code: string;
  // keep this type, we can add more fields in the future
}

export interface IAnchorResponse {
  url: string;
  type: string;
  id: string;
}

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

export interface ITransactionRequest {
  type: TransactionType;
  maxAmountToSend: string | undefined;
  destinationAmount: string;
  destination: string;
  sourceAssetCode: string;
  destinationAssetCode: string;
  idempotencyKey?: string;
}

export interface ITransaction {
  createdAt: Date;
  amount: string;
  assetCode: string;
  direction: string;
  sourceAssetCode: string;
  sourceAmount: string;
  type: string;
}

export interface IPaymentResponse {
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
}

//-- Users

export interface IUserProfile {
  sub: string;
  address: string;
  email_verified: string;
  given_name: string;
  family_name: string;
  custom_role: string;
  email: string;
}

export interface IFilteredBalance {
  label: string;
  value: string;
  balance: string;
}

export interface IBalance extends IFilteredBalance {
  assetType: string;
  assetCode: string;
}
