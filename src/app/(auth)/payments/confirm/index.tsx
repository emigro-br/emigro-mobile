import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Sentry from '@sentry/react-native';
import { Stack, usePathname, useRouter } from 'expo-router';

import { InputAmountActionSheet } from '@/components/InputAmountActionSheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { ModalCloseButton } from '@/components/ui/modal';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { TRANSACTION_ERROR_MESSAGE } from '@/constants/errorMessages';
import { LoadingScreen } from '@/screens/Loading';
import { PinScreen } from '@/screens/PinScreen';
import { IQuoteRequest, fetchQuote } from '@/services/emigro/quotes';
import { balanceStore } from '@/stores/BalanceStore';
import { paymentStore } from '@/stores/PaymentStore';
import { securityStore } from '@/stores/SecurityStore';
import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, symbolFor } from '@/utils/assets';
import { maskWallet } from '@/utils/masks';

export const ConfirmPayment = () => {
  console.log('[ConfirmPayment] Component loaded.');

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const path = usePathname();

  const { scannedPayment } = paymentStore;
  console.log('[ConfirmPayment] scannedPayment:', scannedPayment);

  // Try to guess which asset to use. If the scanned payment asset has enough balance, use that; otherwise default to USDC
  const initialAsset =
    scannedPayment?.assetCode && balanceStore.get(scannedPayment.assetCode) > scannedPayment.transactionAmount
      ? scannedPayment.assetCode
      : CryptoAsset.USDC;
  console.log('[ConfirmPayment] initialAsset decided as:', initialAsset);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [showEditAmount, setShowEditAmount] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<number>(scannedPayment?.transactionAmount ?? 0);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(initialAsset);
  const [paymentQuote, setPaymentQuote] = useState<number | null>(scannedPayment?.transactionAmount ?? null);

// Determine if the current scannedPayment is a Pix payment
const isPix = scannedPayment && typeof scannedPayment.pixKey === 'string' && scannedPayment.pixKey.trim() !== '';
console.log('[ConfirmPayment] isPix:', isPix, 'scannedPayment.pixKey:', scannedPayment?.pixKey);

  /**
   * Attempt to fetch a quote if the asset being paid from differs from the merchant's asset.
   */
  const handleFetchQuote = async () => {
    console.log('[ConfirmPayment] handleFetchQuote called.');
    console.log('[ConfirmPayment] selectedAsset:', selectedAsset);
    console.log('[ConfirmPayment] scannedPayment:', scannedPayment);
    console.log('[ConfirmPayment] requestedAmount:', requestedAmount);

    if (!selectedAsset || !scannedPayment || !requestedAmount) {
      console.log('[ConfirmPayment] Aborting fetchQuote: missing data.');
      return;
    }

    // If user is paying the same asset as the merchant expects, there's no conversion needed
    if (scannedPayment.assetCode === selectedAsset) {
      console.log('[ConfirmPayment] No quote needed: same asset as merchant expects. Setting paymentQuote directly.');
      setPaymentQuote(requestedAmount);
      return;
    }

    // Otherwise, fetch the quote to see how many of the "selectedAsset" is needed for the merchant's requested fiat/asset
    console.log('[ConfirmPayment] Fetching quote from the server...');
    setPaymentQuote(null);

    const data: IQuoteRequest = {
      from: selectedAsset,
      to: scannedPayment.assetCode,
      amount: `${requestedAmount}`,
      type: 'strict_receive',
    };
    console.log('[ConfirmPayment] Quote request data:', data);

    try {
      const quote = await fetchQuote(data);
      console.log('[ConfirmPayment] Quote response:', quote);

      if (quote === null) {
        console.warn('[ConfirmPayment] No quotes found.');
        return;
      }

      setPaymentQuote(quote.source_amount);
      console.log('[ConfirmPayment] paymentQuote set to:', quote.source_amount);
    } catch (err) {
      console.error('[ConfirmPayment] Error fetching quote:', err);
    }
  };

  useEffect(() => {
    console.log('[ConfirmPayment] useEffect called for quote retrieval.');
    handleFetchQuote().catch((err) => {
      console.warn('[ConfirmPayment] handleFetchQuote error:', err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, requestedAmount]);

  if (!scannedPayment) {
    console.log('[ConfirmPayment] No scannedPayment found. Returning <LoadingScreen />');
    return <LoadingScreen />;
  }

  /**
   * Handles the user pressing the "Pay" button. Sets up the transaction and triggers the PIN screen.
   */
  const handlePressPay = () => {
    console.log('[ConfirmPayment] handlePressPay called.');
    console.log('[ConfirmPayment] paymentQuote:', paymentQuote);

    if (!paymentQuote) {
      console.warn('[ConfirmPayment] Payment amount is not set. Aborting...');
      return;
    }

    // For Pix, use scannedPayment.pixKey as the destination.
    // For Stellar, use scannedPayment.walletKey as the destination.
    const toWallet = isPix ? (scannedPayment as PixPayment).pixKey : (scannedPayment as Payment).walletKey!;
    console.log('[ConfirmPayment] toWallet chosen as:', toWallet);

    const transaction = {
      from: {
        asset: selectedAsset,
        value: Number(paymentQuote),
      },
      to: {
        wallet: toWallet,
        asset: scannedPayment.assetCode,
        value: requestedAmount,
      },
      rate: paymentQuote / requestedAmount,
      fees: 0,
    };

    console.log('[ConfirmPayment] Setting transaction in paymentStore:', transaction);
    paymentStore.setTransaction(transaction);
    setShowPinScreen(true);
    console.log('[ConfirmPayment] showPinScreen set to true, PIN screen triggered.');
  };

  /**
   * Called after the user successfully enters their PIN; this actually executes the payment.
   */
  const handleConfirmPayment = async () => {
    console.log('[ConfirmPayment] handleConfirmPayment called. isPix:', isPix);
    setIsProcessing(true);

    try {
      let result: any;

      // Pay with Pix logic vs. Stellar
      if (isPix) {
        console.log('[ConfirmPayment] Calling paymentStore.payPix()...');
        result = await paymentStore.payPix();
      } else {
        console.log('[ConfirmPayment] Calling paymentStore.pay()...');
        result = await paymentStore.pay();
      }
      console.log('[ConfirmPayment] Payment result:', result);

      if (result.status === 'paid' || result.transactionHash) {
        console.log('[ConfirmPayment] Payment success. Navigating to success screen...');
        router.replace(`${path}/success`);
      } else if (['created', 'pending'].includes(result.status)) {
        console.log('[ConfirmPayment] Payment pending. Navigating to waiting screen...');
        router.replace(`${path}/waiting`);
      } else {
        console.error('[ConfirmPayment] Payment error, throwing:', TRANSACTION_ERROR_MESSAGE);
        throw new Error(TRANSACTION_ERROR_MESSAGE);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : TRANSACTION_ERROR_MESSAGE;
      console.error('[ConfirmPayment] Caught error in handleConfirmPayment:', message);
      Sentry.captureException(error);
      router.replace({
        pathname: `${path}/error`,
        params: { error: message },
      });
    } finally {
      setIsProcessing(false);
      console.log('[ConfirmPayment] Payment process ended, isProcessing set to false.');
    }
  };

  if (showPinScreen) {
    console.log('[ConfirmPayment] showPinScreen is true; rendering <PinScreen />.');
    return (
      <Box className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <PinScreen
          tagline="Enter your PIN code"
          btnLabel="Confirm"
          autoSubmit
          verifyPin={async (pin) => {
            console.log('[ConfirmPayment] PinScreen verifyPin called with pin:', pin);
            const verifyResult = await securityStore.verifyPin(pin);
            console.log('[ConfirmPayment] Pin verifyResult:', verifyResult);
            return verifyResult;
          }}
          onPinSuccess={() => {
            console.log('[ConfirmPayment] PinScreen onPinSuccess called.');
            setShowPinScreen(false);
            handleConfirmPayment();
          }}
          onPinFail={(err) => {
            console.warn('[ConfirmPayment] PinScreen onPinFail, error:', err);
            setShowPinScreen(false);
          }}
        />
      </Box>
    );
  }

  // Filter allowed assets:
  // For Pix, limit assets to BRZ and USDC
  let allowedAssets = balanceStore.currentAssets();
  console.log('[ConfirmPayment] Current assets from balanceStore:', allowedAssets);

  if (isPix) {
    console.log('[ConfirmPayment] isPix is true, filtering allowed assets to [BRZ, USDC]');
    allowedAssets = allowedAssets.filter((asset) => [CryptoAsset.BRZ, CryptoAsset.USDC].includes(asset));
  }

  console.log('[ConfirmPayment] Final allowedAssets:', allowedAssets);

  const dropdownValues = allowedAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));
  console.log('[ConfirmPayment] dropdownValues:', dropdownValues);

  const balance = balanceStore.get(selectedAsset);
  console.log('[ConfirmPayment] User balance for', selectedAsset, ':', balance);

  // Compare user balance vs. needed tokens
  const hasBalance = paymentQuote ? paymentQuote <= balance : true;
  console.log('[ConfirmPayment] hasBalance:', hasBalance, '(paymentQuote:', paymentQuote, 'balance:', balance, ')');

  const isPayDisabled = !paymentQuote || !hasBalance || isProcessing;
  console.log('[ConfirmPayment] isPayDisabled:', isPayDisabled);

  const isAmountEditable = scannedPayment.transactionAmount === 0;
  console.log('[ConfirmPayment] isAmountEditable:', isAmountEditable);

  return (
    <>
      <Stack.Screen options={{ title: 'Confirm Payment', headerBackTitleVisible: false }} />

      <InputAmountActionSheet
        isOpen={showEditAmount}
        onClose={() => {
          console.log('[ConfirmPayment] Closing InputAmountActionSheet. New showEditAmount:', false);
          setShowEditAmount(false);
        }}
        tagline="Enter the amount you want to pay"
        initialAmount={requestedAmount}
        asset={AssetToCurrency[scannedPayment.assetCode] as FiatCurrency} // fiat code
        onSave={(amount) => {
          console.log('[ConfirmPayment] User entered new amount from ActionSheet:', amount);
          setRequestedAmount(amount);
        }}
      />

      <ScrollView className="flex-1 bg-white">
        <Box className="flex-1" style={{ paddingTop: insets.top }}>
          <VStack space="lg" className="p-4">
            <HStack className="justify-between">
              <Heading size="xl">Review the payment</Heading>
              <ModalCloseButton
                onPress={() => {
                  console.log('[ConfirmPayment] User pressed close button; router.dismiss() called.');
                  router.dismiss();
                }}
                testID="close-button"
                className="mt--4"
              >
                <Icon as={CloseIcon} size="xl" />
              </ModalCloseButton>
            </HStack>

            <HStack className="items-center">
              <Pressable
                onPress={() => {
                  if (isAmountEditable) {
                    console.log('[ConfirmPayment] Pressed amount to edit. Opening InputAmountActionSheet.');
                    setShowEditAmount(true);
                  } else {
                    console.log('[ConfirmPayment] Pressed amount but not editable.');
                  }
                }}
              >
                <Text size="4xl" bold className="text-typography-800" testID="amount">
                  {symbolFor(scannedPayment.assetCode, requestedAmount)}
                </Text>
              </Pressable>
              {isAmountEditable && (
                <Button
                  variant="link"
                  onPress={() => {
                    console.log('[ConfirmPayment] Pressed edit button. Opening InputAmountActionSheet.');
                    setShowEditAmount(true);
                  }}
                  className="ml-2"
                >
                  <ButtonText>Edit</ButtonText>
                </Button>
              )}
            </HStack>

            <VStack space="3xl">
              <Box>
                <Text size="lg" numberOfLines={1} ellipsizeMode="tail">
                  for{' '}
                  <Text bold size="lg">
                    {scannedPayment.merchantName}
                  </Text>
                </Text>
                {scannedPayment.merchantCity && (
                  <Text>
                    in <Text>{scannedPayment.merchantCity}</Text>
                  </Text>
                )}
              </Box>

              {scannedPayment.infoAdicional && (
                <Center>
                  <Card variant="filled" className="bg-background-100">
                    <Text className="text-center">{scannedPayment.infoAdicional}</Text>
                  </Card>
                </Center>
              )}

              {isPix ? (
                <StaticPix pix={scannedPayment as PixPayment} />
              ) : (
                <StellarPay pay={scannedPayment as Payment} />
              )}
            </VStack>

            <Divider />

            <Text>Select the account</Text>
            <Card variant="filled" className="pb-2">
              <HStack>
                <Box className="w-1/4">
                  <Dropdown
                    selectedTextStyle={{ fontWeight: '500' }}
                    data={dropdownValues}
                    value={selectedAsset}
                    labelField="label"
                    valueField="value"
                    onChange={(selectedItem) => {
                      console.log('[ConfirmPayment] Dropdown onChange:', selectedItem);
                      setSelectedAsset(selectedItem.value);
                    }}
                    disable={isProcessing}
                    testID="select-account"
                  />
                </Box>
                <Box className="w-3/4">
                  <Text className="text-right py-1" testID="quote">
                    {paymentQuote && symbolFor(selectedAsset, paymentQuote)}
                  </Text>
                </Box>
              </HStack>
              <HStack className="justify-between">
                <Text
                  size="xs"
                  className={hasBalance ? 'text-typography-500' : 'text-red-500'}
                  testID="balance"
                >
                  Balance: {symbolFor(selectedAsset, balance)}
                </Text>
                {!hasBalance && (
                  <Text size="xs" className="text-red-500">
                    exceeds balance
                  </Text>
                )}
              </HStack>
            </Card>

            <Text size="xs">
              The seller will receive the exact value they set. The quantity that will be sent is computed
              automatically.
            </Text>
            <Button size="lg" onPress={handlePressPay} disabled={isPayDisabled}>
              {isProcessing && <ButtonSpinner className="mr-1" />}
              <ButtonText>{isProcessing ? 'Processing...' : 'Pay'} </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

interface StaticPixProps {
  pix: PixPayment;
}

/**
 * Renders static Pix fields for a PixPayment
 */
const StaticPix = ({ pix }: StaticPixProps) => {
  console.log('[StaticPix] Rendering with pix:', pix);
  return (
    <VStack space="md">
      <HStack className="justify-between">
        <Text bold>CPF/CNPJ: </Text>
        <Text>{pix.taxId}</Text>
      </HStack>
      <HStack className="justify-between">
        <Text bold>Institution: </Text>
        <Text numberOfLines={2} ellipsizeMode="tail" className="w-2/3 text-right">
          {pix.bankName}
        </Text>
      </HStack>
      <HStack className="justify-between">
        <Text bold>Pix Key: </Text>
        <Text>{pix.pixKey}</Text>
      </HStack>
      <HStack className="justify-between">
        <Text bold>Identifier: </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          {pix.txid}
        </Text>
      </HStack>
    </VStack>
  );
};

interface StellarPayProps {
  pay: Payment;
}

/**
 * Renders Stellar payment info for a Payment
 */
const StellarPay = ({ pay }: StellarPayProps) => {
  console.log('[StellarPay] Rendering with pay:', pay);
  return (
    <VStack space="md">
      <HStack className="justify-between">
        <Text bold>Institution:</Text>
        <Text>Stellar Network</Text>
      </HStack>
      <HStack className="justify-between">
        <Text bold>Wallet Key:</Text>
        <Text>{maskWallet(pay.walletKey!)}</Text>
      </HStack>
    </VStack>
  );
};

export default ConfirmPayment;
