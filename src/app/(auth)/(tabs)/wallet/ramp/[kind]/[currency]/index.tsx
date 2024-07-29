import React, { useState } from 'react';

import {
  Stack,
  useFocusEffect,
  useGlobalSearchParams,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';

import { Sep24TransactionHistoryContainer } from '@/components/Sep24TransactionHistory';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { OperationKind } from '@/services/emigro/anchors';
import { balanceStore } from '@/stores/BalanceStore';
import { FiatCurrency } from '@/types/assets';
import { CurrencyToAsset, fiatByCode, symbolFor } from '@/utils/assets';

const OperationRouter = () => {
  const { kind } = useGlobalSearchParams();
  const { currency } = useLocalSearchParams<{ currency: FiatCurrency }>();

  if (!currency) {
    throw new Error('Currency is required');
  }

  if (kind === 'deposit') {
    return <Deposit currency={currency} />;
  } else if (kind === 'withdraw') {
    return <Withdraw currency={currency} />;
  } else {
    throw new Error('Invalid kind operation: ' + kind);
  }
};

type KindProps = {
  currency: FiatCurrency;
};

export const Deposit = ({ currency }: KindProps) => {
  return <OperationHome title="Deposit" kind={OperationKind.DEPOSIT} currency={currency} />;
};

export const Withdraw = ({ currency }: KindProps) => {
  return <OperationHome title="Withdraw" kind={OperationKind.WITHDRAW} currency={currency} />;
};

type LayoutProps = {
  title: string;
  kind: OperationKind;
  currency: string;
};

export const OperationHome = ({ title, kind, currency }: LayoutProps) => {
  const router = useRouter();
  const path = usePathname();
  const [isOpenUrlModal, setIsOpenUrlModal] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date()); // to force refresh of transaction history
  const fiat = fiatByCode[currency as string];
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
          title,
        }}
      />
      <OpenURLModal
        isOpen={isOpenUrlModal}
        onClose={() => setIsOpenUrlModal(false)}
        onConfirm={() => handleOpenConfimed()}
        testID="open-url-modal"
      />
      <ScrollView className="flex-1 bg-white">
        <Box className="flex-1">
          <VStack space="md" className="p-4">
            <Heading size="xl">
              {title} in {fiat.name}
            </Heading>
            <Text bold className="mb-2">
              Balance: {symbolFor(asset, balance)}
            </Text>
            <Button variant="outline" onPress={() => handleNewTransaction(kind)}>
              <ButtonText>New transaction</ButtonText>
            </Button>
            <Box className="mb-4" />
            <Sep24TransactionHistoryContainer asset={asset} kind={kind} refreshedAt={refreshedAt} />
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

export default OperationRouter;
