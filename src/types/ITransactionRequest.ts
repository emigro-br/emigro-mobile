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
