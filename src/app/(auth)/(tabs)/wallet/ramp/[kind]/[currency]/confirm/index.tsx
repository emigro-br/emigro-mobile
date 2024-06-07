import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Box,
  Button,
  ButtonText,
  CloseIcon,
  Divider,
  HStack,
  Heading,
  ModalCloseButton,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { AssetImage } from '@/components/AssetImage';
import { DetailsTable } from '@/components/DetailsTable';
import { LoadingScreen } from '@/components/Loading';
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
    <Box flex={1} pb={insets.bottom}>
      <HStack justifyContent="space-between">
        <ModalCloseButton onPress={onClose} testID="close-button" mt="$4">
          <CloseIcon size="xl" />
        </ModalCloseButton>
      </HStack>
      <VStack p="$4">
        <HStack justifyContent="space-between">
          <Heading size="xl">Withdrawing</Heading>
          <AssetImage asset={asset} size="md" />
        </HStack>
        <Heading size="3xl">{symbolFor(currency, amount_out)}</Heading>
        <Box h="$12" />
        <Text color="$textLight600" bold mb="$2">
          Transaction details
        </Text>
        <DetailsTable rows={rows} />
        <Text color="$textLight400" mt="$4" mb="$2">
          Transaction ID
        </Text>
        <Text>{transaction.id}</Text>
      </VStack>
      <Box flex={1} />
      <Divider />
      {/* test status to avoid pay twice */}
      {transaction.status === Sep24TransactionStatus.PENDING_USER_TRANSFER_START && (
        <Button m="$4" onPress={() => handleConfirm()} size="lg" isDisabled={isProcessing} testID="confirm-button">
          <ButtonText>{isProcessing ? 'Processing...' : 'Confirm withdraw'}</ButtonText>
        </Button>
      )}
    </Box>
  );
};

export default WithdrawlConfirmScreen;
