import { useEffect, useState } from 'react';

import { Box, Button, ButtonText, Card, Center, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { PixElementType, StaticPixEmvElements, hasError, parsePix } from 'pix-utils';

import { SuccessModal } from '@components/modals/SuccessModal';

import { PixKey, dictKey, pay } from '@services/pix';

enum TransactionStep {
  NONE = 'none',
  // CONFIRM_PAYMENT = 'confirm_payment',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

type Props = {
  navigation: any;
  route: any;
};

export const ReviewPixPayment = ({ navigation, route }: Props) => {
  const brCode = route.params.brCode;
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [pixKey, setPixKey] = useState<PixKey>();
  const pix = parsePix(brCode);

  useEffect(() => {
    const fetchPixKeyAsync = async (pix: StaticPixEmvElements) => {
      const result = await dictKey(pix.pixKey);
      // console.debug('Pix Key:', result);
      setPixKey(result);
    };

    // console.debug('Parsed Pix:', pix);
    if (!hasError(pix) && pix.type === PixElementType.STATIC) {
      fetchPixKeyAsync(pix);
    }
  }, [brCode]);

  // check pix is PixError
  if (hasError(pix) || pix.type === PixElementType.INVALID) {
    // Handle PixError
    // For example, display an error message
    return <Text>Error:</Text>;
  }

  // FIXME:
  const taxId = '012.345.678-90';
  const description = 'Emigro Payment';

  const handleConfirmPayment = async () => {
    setStep(TransactionStep.PROCESSING);
    try {
      const result = await pay({
        br_code: brCode,
        tax_id: taxId,
        description,
      });
      console.debug('Pix payment result:', result);

      if (result.payment_id) {
        setStep(TransactionStep.SUCCESS);
      } else {
        console.error('Error paying Pix');
        setStep(TransactionStep.ERROR);
      }
    } catch (error) {
      console.debug('Error paying Pix:', error);
      setStep(TransactionStep.ERROR);
    }
  };

  const handleCloseFinishedModal = () => {
    setStep(TransactionStep.NONE);
    navigation.navigate('WalletTab');
  };

  return (
    <Box flex={1} bg="$white">
      <SuccessModal
        isOpen={step === TransactionStep.SUCCESS}
        title="Transaction completed"
        onClose={() => handleCloseFinishedModal()}
      />
      <VStack p="$4" space="lg">
        <Heading>Review your Pix payment</Heading>
        {pix.type === PixElementType.STATIC && <StaticPix pix={pix} pixKey={pixKey} />}
        <Button onPress={() => handleConfirmPayment()} isDisabled={step === TransactionStep.PROCESSING}>
          <ButtonText>Confirm Payment</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

// const PixMandatoryElements = ({ pix }) => (
//   <Box>
//     <Text bold>Mandatory</Text>
//     <Text>Category Code: {pix.merchantCategoryCode}</Text>
//     <Text>Currency: {pix.transactionCurrency}</Text>
//     <Text>Country Code: {pix.countryCode}</Text>
//     <Text>Merchant Name: {pix.merchantName}</Text>
//     <Text>Merchant City: {pix.merchantCity}</Text>
//   </Box>
// );

interface StaticPixProps {
  pix: StaticPixEmvElements;
  pixKey?: PixKey;
}

const StaticPix = ({ pix, pixKey }: StaticPixProps) => (
  <VStack space="3xl">
    <Box>
      <Text size="4xl" bold>
        R$ {Number(pix.transactionAmount).toFixed(2)}
      </Text>
      <Text>
        for <Text bold>{pix.merchantName}</Text>
      </Text>
      <Text>in {pix.merchantCity}</Text>
    </Box>
    {pix.infoAdicional && (
      <Center>
        <Card variant="filled" bg="$backgroundLight100">
          <Text textAlign="center">{pix.infoAdicional}</Text>
        </Card>
      </Center>
    )}
    <VStack space="md">
      <HStack justifyContent="space-between">
        <Text bold>CPF/CNPJ:</Text>
        <Text>{pixKey?.tax_id}</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Institution:</Text>
        <Text maxWidth="$2/3">{pixKey?.bank_name}</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Pix Key:</Text>
        <Text>{pix.pixKey}</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Indentifier:</Text>
        <Text>{pix.txid}</Text>
      </HStack>
    </VStack>
    {/* <Text>FSS: {pix.fss}</Text> */}
  </VStack>
);
