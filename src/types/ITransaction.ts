export interface ITransaction {
    createdAt: Date;
    amount: string;
    assetCode: string;
    direction: string;
    sourceAssetCode: string;
    sourceAmount: string;
    type: string;
  } 