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
