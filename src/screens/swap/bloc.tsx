import { getUserPublicKey, sendTransaction } from "@/services/emigro";
import { ITransactionRequest } from "@/types/ITransactionRequest";
import { AssetCode } from "@constants/assetCode";

export type SwapTransaction = {
  from: AssetCode;
  fromValue: number;
  to: AssetCode;
  toValue: number;
  // rate: number;
  // fees: number;
}

export class SwapBloc {
  publicKey?: string;

  constructor() {
    this.init();
  }

  private async init() {
    // TODO: add to the user session
    console.debug('Getting user public key...');
    this.publicKey = await getUserPublicKey();
    console.debug('User public key:', this.publicKey);
  }

  public async swap(transaction: SwapTransaction) {
    if (!this.publicKey) {
      throw new Error('User wallet address not found.');
    }

    const transactionRequest: ITransactionRequest = {
      maxAmountToSend: transaction.fromValue.toString(), // cry
      destinationAmount: transaction.toValue.toString(),
      destination: this.publicKey,
      sourceAssetCode: transaction.from,
      destinationAssetCode: transaction.to,
    };
    const res = await sendTransaction(transactionRequest);
    return res;
  }
}

// export default new SwapBloc();
