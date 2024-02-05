import { sendTransaction } from "@/services/emigro";
import { getSession } from "@/storage/helpers";
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
  _publicKey?: string;

  private async publicKey() {
    if (this._publicKey) {
      return this._publicKey;
    }

    const session = await getSession();
    if (session && session.publicKey) {
      this._publicKey = session.publicKey;
      return this._publicKey;
    }
    throw new Error('User wallet address not found.');
  }

  public async swap(transaction: SwapTransaction) {
    const transactionRequest: ITransactionRequest = {
      maxAmountToSend: transaction.fromValue.toString(), // cry
      destinationAmount: transaction.toValue.toString(),
      destination: await this.publicKey(),
      sourceAssetCode: transaction.from,
      destinationAssetCode: transaction.to,
    };
    const res = await sendTransaction(transactionRequest);
    return res;
  }
}

// export default new SwapBloc();
