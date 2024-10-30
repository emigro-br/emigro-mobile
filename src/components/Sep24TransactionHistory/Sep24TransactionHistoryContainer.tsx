import React, { useEffect, useRef, useState } from 'react';

import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { OperationKind, listTransactions } from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { Watcher } from '@/services/stellar/Watcher';
import { CryptoAsset } from '@/types/assets';

import { Sep24TransactionHistory } from './Sep24TransactionHistory';

type ContainerProps = {
  asset: CryptoAsset;
  kind: OperationKind;
  refreshedAt?: Date;
};

export const watcher = new Watcher(); // FIXME: doesn't creating a new watcher in the container to not clean the registered transactions

export const Sep24TransactionHistoryContainer = ({ asset, kind, refreshedAt }: ContainerProps) => {
  const router = useRouter();
  const path = usePathname();
  const { latest } = useLocalSearchParams<{ latest: string }>();
  const lastFetchTime = useRef<Date | null>(null);
  const watcherRef = useRef<any>();
  const [transactions, setTransactions] = useState<Sep24Transaction[]>([]);
  const [updated, setUpdated] = useState<Sep24Transaction | null>();

  const onMessage = async (transaction: Sep24Transaction) => {
    console.debug('onMessage', transaction);
    if (
      transaction.id === latest &&
      transaction.kind === 'withdrawal' &&
      transaction.status === Sep24TransactionStatus.PENDING_USER_TRANSFER_START
    ) {
      router.push({
        pathname: `${path}/confirm`,
        params: { asset, id: transaction.id },
      });
    }
    setUpdated(transaction);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const now = new Date();
      // Only fetch if more than 5 seconds have passed since the last fetch
      if (lastFetchTime.current && now.getTime() - lastFetchTime.current.getTime() < 5 * 1000) {
        return;
      }

      // Update the last fetch time right away to avoid multiple fetches
      lastFetchTime.current = now;

      console.debug('Fetching transactions', asset, kind, refreshedAt);
      const transactions = await listTransactions(asset, kind);

      setTransactions(transactions as Sep24Transaction[]);

      // if there is a latest transaction, start watching it
      if (transactions.length > 0 && transactions[0].id === latest) {
        watchTransaction(transactions[0]);
      }
    };
    fetchTransactions();
  }, [asset, kind, refreshedAt]);

  useEffect(() => {
    return () => {
      console.debug('Clean up on unmount');
      watcherRef.current?.stop();
    };
  }, []);

  const watchTransaction = (transaction: Sep24Transaction) => {
    const endStatuses = [
      Sep24TransactionStatus.INCOMPLETE, // user closed the popup window
      Sep24TransactionStatus.COMPLETED,
      Sep24TransactionStatus.ERROR,
    ];

    if (!endStatuses.includes(transaction.status)) {
      /// Clearing prev watchers
      watcherRef.current?.stop();

      watcherRef.current = watcher.watchOneTransaction({
        assetCode: asset,
        id: transaction.id,
        onMessage,
        onSuccess: (updated) => {
          console.debug('Transaction completed', updated);
          setUpdated(updated);
        },
        onError: (updated) => {
          console.error('Transaction error', updated);
          setUpdated(updated);
        },
      });
    }
  };

  useEffect(() => {
    if (updated) {
      // refresh transactions
      setTransactions(transactions.map((t) => (t.id === updated.id ? updated : t)));
    }
  }, [updated]);

  return <Sep24TransactionHistory asset={asset} transactions={transactions} />;
};
