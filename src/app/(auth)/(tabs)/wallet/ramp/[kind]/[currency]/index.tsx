import React, { useEffect, useRef, useState } from 'react';

import { Box, Button, ButtonText, Heading, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import {
  Stack,
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';

import { TransactionHistory } from '@/components/TransactionHistory';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { OperationKind, listTransactions } from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { Watcher } from '@/services/stellar/Watcher';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset, FiatCurrency } from '@/types/assets';
import { CurrencyToAsset, fiatByCode, symbolFor } from '@/utils/assets';

const OperationRouter = () => {
  const { kind } = useGlobalSearchParams();
  const { currency } = useLocalSearchParams();
  // console.debug('OperationRouter', kind, currency);

  if (kind === 'deposit') {
    return <Deposit currency={currency as FiatCurrency} />;
  } else if (kind === 'withdraw') {
    return <Withdrawal currency={currency as FiatCurrency} />;
  } else {
    return (
      <Box>
        <Heading>Invalid kind operation</Heading>
      </Box>
    );
  }
};

type KindProps = {
  currency: FiatCurrency;
};

const Deposit = ({ currency }: KindProps) => {
  return <OperationLayout operationTitle="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />;
};

export const Withdrawal = ({ currency }: KindProps) => {
  return <OperationLayout operationTitle="Withdrawl" kind={OperationKind.WITHDRAW} currency={currency} />;
};

type LayoutProps = {
  operationTitle: string;
  kind: OperationKind;
  currency: string;
};

const OperationLayout = ({ operationTitle, kind, currency }: LayoutProps) => {
  const router = useRouter();
  const path = usePathname();
  const [isOpenUrlModal, setIsOpenUrlModal] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date()); // to force refresh of transaction history
  const fiat = fiatByCode[currency as string];
  // console.debug('fiat', currency, fiat);
  const asset = CurrencyToAsset[fiat.code as FiatCurrency];
  const balance = balanceStore.get(asset);

  useFocusEffect(
    React.useCallback(() => {
      setRefreshedAt(new Date());
    }, []),
  );

  const handleNewTransaction = (kind: OperationKind) => {
    setIsOpenUrlModal(true);
  };

  const handleOpenConfimed = async () => {
    router.push({
      pathname: `${path}/webview`,
      params: { asset }, // FIXME: asset vs currency
    });
    setIsOpenUrlModal(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: operationTitle,
        }}
      />

      <OpenURLModal
        isOpen={isOpenUrlModal}
        onClose={() => setIsOpenUrlModal(false)}
        onConfirm={() => handleOpenConfimed()}
        testID="open-url-modal"
      />

      <ScrollView flex={1} bg="$white">
        <Box flex={1}>
          <VStack p="$4" space="md">
            <Heading size="xl">
              {operationTitle} in {fiat.name}
            </Heading>
            <Text bold mb="$2">
              Balance: {symbolFor(asset, balance)}
            </Text>
            <Button variant="outline" onPress={() => handleNewTransaction(kind)}>
              <ButtonText>New transaction</ButtonText>
            </Button>
            <Box mb="$4" />
            <TransactionHistoryContainer asset={asset} kind={kind} refreshedAt={refreshedAt} />
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

type ContainerProps = {
  asset: CryptoAsset;
  kind: OperationKind;
  refreshedAt?: Date;
};

const watcher = new Watcher(); // FIXME: doesn't creating a new watcher in the container to not clean the registered transactions

export const TransactionHistoryContainer = ({ asset, kind, refreshedAt }: ContainerProps) => {
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
      console.debug('Clean up on unmount', watcherRef.current);
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
      if (watcherRef.current) {
        console.debug('Clearing prev watchers', watcherRef.current);
        watcherRef.current.stop();
      }

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

  return <TransactionHistory asset={asset} transactions={transactions} />;
};

export default OperationRouter;
