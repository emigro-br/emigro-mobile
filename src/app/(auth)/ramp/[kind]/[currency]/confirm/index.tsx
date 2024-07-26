import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { AssetImage } from '@/components/AssetImage';
import { DetailsTable } from '@/components/DetailsTable';
import { LoadingScreen } from '@/components/screens/Loading';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { ModalCloseButton } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ConfirmWithdrawDto, confirmWithdraw, getTransaction } from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { CryptoAsset, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, symbolFor } from '@/utils/assets';

export const WithdrawlConfirmScreen = () => {
  const router = useRouter();
  const path = usePathname();
  const { asset, id } = useLocalSearchParams<{ asset: CryptoAsset; id: string }>();
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);

  useEffect(() => {
    if (!id || !asset) {
      return;
    }
    const fetchTransaction = async () => {
      const transaction = await getTransaction(id, asset);
      setTransaction(transaction);
    };
    fetchTransaction();
  }, [id, asset]);

  if (!transaction) {
    return <LoadingScreen />;
  }

  const handleConfirmTransaction = async (transactionId: string, assetCode: CryptoAsset) => {
    const data: ConfirmWithdrawDto = {
      transactionId,
      assetCode,
    };
    try {
      await confirmWithdraw(data);

      // sleep to simulate the request
      // await new Promise(resolve => setTimeout(resolve, 2000));
      router.replace(`${path}/success`);
    } catch (error) {
      console.error(error);
      router.replace(`${path}/error`);
    }
  };

  return (
    <WithdrawlConfirm
      asset={asset}
      transaction={transaction}
      onConfirm={() => handleConfirmTransaction(transaction.id, asset)}
      onClose={() => router.dismiss()}
    />
  );
};

type Props = {
  asset: CryptoAsset;
  transaction: Sep24Transaction;
  onConfirm: () => void;
  onClose: () => void;
};

export const WithdrawlConfirm = ({ asset, transaction, onConfirm, onClose }: Props) => {
  const insets = useSafeAreaInsets();
  const [isProcessing, setIsProcessing] = useState(false);
  const amount_in = Number(transaction.amount_in);
  const amount_out = Number(transaction.amount_out);
  const amount_fee = Number(transaction.amount_fee);
  const currency = AssetToCurrency[asset] as FiatCurrency;
  const rows = [
    { label: 'Amount', value: symbolFor(asset, amount_in) },
    { label: 'Fee', value: symbolFor(asset, amount_fee) },
    { label: 'You will receive', value: symbolFor(currency, amount_out) },
  ];

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Confirm Withdraw' }} />
      <Box className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <ModalCloseButton onPress={onClose} testID="close-button" className="mt-6 ml-2">
          <Icon as={CloseIcon} size="xl" />
        </ModalCloseButton>
        <VStack className="p-4">
          <HStack className="justify-between">
            <Heading size="xl">Withdrawing</Heading>
            <AssetImage asset={asset} size="sm" />
          </HStack>
          <Heading size="3xl">{symbolFor(currency, amount_out)}</Heading>
          <Box className="h-12" />
          <Text bold className="text-typography-600 mb-2">
            Transaction details
          </Text>
          <DetailsTable rows={rows} />
          <Text className="text-typography-400 mt-4 mb-2">Transaction ID</Text>
          <Text>{transaction.id}</Text>
        </VStack>
        <Box className="flex-1" />
        <Divider />
        {/* test status to avoid pay twice */}
        {transaction.status === Sep24TransactionStatus.PENDING_USER_TRANSFER_START && (
          <Button
            onPress={() => handleConfirm()}
            size="lg"
            disabled={isProcessing}
            testID="confirm-button"
            className="m-4"
          >
            <ButtonText>{isProcessing ? 'Processing...' : 'Confirm withdraw'}</ButtonText>
          </Button>
        )}
      </Box>
    </>
  );
};

export default WithdrawlConfirmScreen;
