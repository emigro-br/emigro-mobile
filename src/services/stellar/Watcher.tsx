import { getTransaction } from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';

type WatchTransactionParams = {
  assetCode: CryptoAsset;
  id: string;
  onMessage: (transaction: Sep24Transaction) => void;
  onSuccess: (transaction: Sep24Transaction) => void;
  onError: (transaction: Sep24Transaction) => void;
  timeout?: number;
  isRetry?: boolean;
};

// https://github.com/stellar/typescript-wallet-sdk/blob/main/%40stellar/typescript-wallet-sdk/src/walletSdk/Watcher/index.ts
export class Watcher {
  private _oneTransactionWatcher = {} as Record<string, NodeJS.Timeout>;
  private _transactionsRegistry = {} as Record<string, Sep24Transaction>;
  private _watchOneTransactionRegistry = {} as Record<string, boolean>;

  updateTransactionsRegistry = (transactions: Sep24Transaction[]) => {
    transactions.forEach((transaction) => {
      this._transactionsRegistry[transaction.id] = transaction;
    });
  };

  watchOneTransaction = ({
    assetCode,
    id,
    onMessage,
    onSuccess,
    onError,
    timeout = 5000,
    isRetry = false,
  }: WatchTransactionParams) => {
    console.debug('Watching transaction', id);

    // if it's a first run, drop it in the registry for the given asset code
    if (!isRetry) {
      this._watchOneTransactionRegistry[id] = true;
    }

    getTransaction(id, assetCode)
      .then((transaction) => {
        // make sure we're still watching
        if (!this._watchOneTransactionRegistry[id]) {
          return;
        }

        const registeredTransaction = this._transactionsRegistry[id];
        console.debug('Registered transaction', registeredTransaction?.id, registeredTransaction?.status);

        // if we've had the transaction before, only report if there is a status change
        let isChanged = true;
        if (registeredTransaction && registeredTransaction.status === transaction.status) {
          isChanged = false;
        }

        this._transactionsRegistry[id] = transaction;

        if (transaction.status.indexOf('pending') === 0 || transaction.status === Sep24TransactionStatus.INCOMPLETE) {
          if (this._oneTransactionWatcher[id]) {
            clearTimeout(this._oneTransactionWatcher[id]);
          }

          this._oneTransactionWatcher[id] = setTimeout(() => {
            this.watchOneTransaction({
              assetCode,
              id,
              onMessage,
              onSuccess,
              onError,
              timeout,
              isRetry: true,
            });
          }, timeout);

          if (isChanged) {
            onMessage(transaction);
          }
        } else if (
          [
            Sep24TransactionStatus.COMPLETED,
            // Sep24TransactionStatus.REFUNDED,
            // Sep24TransactionStatus.EXPIRED,
          ].includes(transaction.status)
        ) {
          onSuccess(transaction);
        } else {
          onError(transaction);
        }
      })
      .catch((error) => {
        onError(error);
      });

    return {
      id,
      refresh: () => {
        // don't do that if we stopped watching
        if (!this._watchOneTransactionRegistry[id]) {
          return;
        }

        if (this._oneTransactionWatcher[id]) {
          clearTimeout(this._oneTransactionWatcher[id]);
        }
        this.watchOneTransaction({ assetCode, id, onMessage, onSuccess, onError, timeout, isRetry: true });
      },
      stop: () => {
        console.debug('Stopping watcher', id);
        if (this._oneTransactionWatcher[id]) {
          this._watchOneTransactionRegistry[id] = false;
          clearTimeout(this._oneTransactionWatcher[id]);
        }
      },
    };
  };
}
