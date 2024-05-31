import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Box, Button, ButtonText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { Stack, useLocalSearchParams } from 'expo-router';

import { TransactionHistory } from '@/components/TransactionHistory';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { CallbackType, OperationKind, depositUrl, listTransactions, withdrawUrl } from '@/services/emigro/anchors';
import { Sep24Transaction } from '@/services/emigro/types';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset, FiatCurrency } from '@/types/assets';
import { CurrencyToAsset, fiatByCode, symbolFor } from '@/utils/assets';

const OperationRouter = () => {
  const { kind, currency } = useLocalSearchParams();

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
  const [isOpenUrlModal, setIsOpenUrlModal] = useState(false);
  const [isGettingUrl, setIsGettingUrl] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date()); // to force refresh of transaction history
  const fiat = fiatByCode[currency as string];
  const asset = CurrencyToAsset[fiat.code as FiatCurrency];
  const balance = balanceStore.get(asset);

  const handleNewTransaction = (kind: OperationKind) => {
    setIsOpenUrlModal(true);
  };

  const handleOpenConfimed = async () => {
    setIsGettingUrl(true);

    const anchorParams = {
      asset_code: asset,
    };

    try {
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const getUrlFn = kind === OperationKind.DEPOSIT ? depositUrl : withdrawUrl;
      const { url, id } = await getUrlFn(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id) {
        console.debug('Transaction id:', id);
        // setTransactionId(id);
      }

      if (url) {
        Linking.openURL(url!);
      } else {
        console.error('Error opening URL');
      }
    } finally {
      setRefreshedAt(new Date());
      setIsGettingUrl(false);
      setIsOpenUrlModal(false);
    }
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
        isLoading={isGettingUrl}
        onClose={() => setIsOpenUrlModal(false)}
        onConfirm={() => handleOpenConfimed()}
        testID="open-url-modal"
      />

      <Box flex={1} bg="$white">
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
    </>
  );
};

type ContainerProps = {
  asset: CryptoAsset;
  kind: OperationKind;
  refreshedAt?: Date;
};

export const TransactionHistoryContainer = ({ asset, kind, refreshedAt }: ContainerProps) => {
  const [transactions, setTransactions] = useState<Sep24Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      console.debug('Fetching transactions for', asset, kind);
      const transactions = await listTransactions(asset, kind);
      setTransactions(transactions as Sep24Transaction[]);
    };
    fetchTransactions();
  }, [asset, kind, refreshedAt]);

  return <TransactionHistory asset={asset} transactions={transactions} />;
};

export default OperationRouter;
