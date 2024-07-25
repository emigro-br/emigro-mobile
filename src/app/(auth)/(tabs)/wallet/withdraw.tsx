import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import * as Sentry from '@sentry/react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { AssetListTile } from '@/components/AssetListTile';
import { ConfirmationModal } from '@/components/modals/ConfirmationModal';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { LoadingModal } from '@/components/modals/LoadingModal';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { SuccessModal } from '@/components/modals/SuccessModal';
import { LoadingScreen } from '@/components/screens/Loading';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ChevronRightIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  CallbackType,
  ConfirmWithdrawDto,
  confirmWithdraw,
  getTransaction,
  withdrawUrl,
} from '@/services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, CurrencyToAsset, symbolFor } from '@/utils/assets';

enum TransactionStep {
  NONE = 'none',
  STARTED = 'started',
  WAITING = 'waiting',
  PENDING_USER = 'pending_user',
  CONFIRM_TRANSFER = 'confirm_transfer',
  SUCCESS = 'success',
  ERROR = 'error',
}

const defaultErrorMessage = 'Something went wrong. Please try again';

type WithdrawAction = {
  transactionId: string;
  assetCode: CryptoAsset;
  anchorUrl: string;
  status?: Sep24TransactionStatus;
};

const Withdraw = observer(() => {
  const router = useRouter();
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [currentAction, setCurrentAction] = useState<WithdrawAction | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CryptoOrFiat | null>(null);
  // TODO: replace by useRef: https://react.dev/reference/react/useRef
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>(); // see: https://code.pieces.app/blog/resolving-react-setinterval-conflicts

  const fiatsWithBank = sessionStore.preferences?.fiatsWithBank ?? [];

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    setSelectedAsset(null);
    // setTransactionId(null);
    setCurrentAction(null);
    setErrorMessage(null);
    setStep(TransactionStep.NONE);

    stopFetchingTransaction();
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        stopFetchingTransaction();
      };
    }, []),
  );

  const handleSelectAsset = (asset: CryptoOrFiat) => {
    // could be a fiat or crypto asset
    const cryptoAsset = CurrencyToAsset[asset as FiatCurrency] ?? (asset as CryptoAsset);
    const balance = balanceStore.get(cryptoAsset);
    if (balance <= 0.01) {
      setErrorMessage('You have no balance to withdraw');
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleOpenUrlPressed = async (asset: CryptoOrFiat) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
    }

    if (currentAction) {
      stopFetchingTransaction();
      setCurrentAction(null);
    }

    // setTransactionId(null);
    setStep(TransactionStep.STARTED);
    try {
      // this will works for both fiat and crypto assets in the list
      const assetCode = CurrencyToAsset[asset as FiatCurrency] ?? (asset as CryptoAsset);
      const anchorParams = {
        asset_code: assetCode,
      };
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await withdrawUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id && url) {
        // setTransactionId(id);
        const action: WithdrawAction = { transactionId: id, assetCode, anchorUrl: url };
        setCurrentAction(action);
        waitWithdrawOnAnchorComplete(action);
        setStep(TransactionStep.WAITING);
        Linking.openURL(url);
      } else {
        throw new Error('Can not fetch the interactive url');
      }
    } catch (error) {
      Sentry.withScope((scope) => {
        scope.setExtra('asset', asset);
        Sentry.captureException(error);
      });
      setErrorMessage(`Could not connect with the ${asset} anchor. Please try again later.`);
      setStep(TransactionStep.ERROR);
    } finally {
      setSelectedAsset(null);
    }
  };

  const handleConfirmTransaction = async (transactionId: string, assetCode: CryptoAsset) => {
    const data: ConfirmWithdrawDto = {
      transactionId,
      assetCode,
    };
    try {
      await confirmWithdraw(data);
      setStep(TransactionStep.SUCCESS);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      setStep(TransactionStep.ERROR);
    }
  };

  // Stopping the interval
  const stopFetchingTransaction = (status?: Sep24TransactionStatus) => {
    console.debug('Stopping the fetch transaction. Status: ', status);
    clearTimeout(timeoutId);
  };

  // used to keep the current step in the setTimeout callback
  const stepRef = React.useRef(step);
  stepRef.current = step;

  const waitWithdrawOnAnchorComplete = async (action: WithdrawAction) => {
    if (stepRef.current !== TransactionStep.WAITING) {
      setStep(TransactionStep.WAITING);
      setCurrentAction(action);
    }

    const endStatuses = [Sep24TransactionStatus.COMPLETED, Sep24TransactionStatus.ERROR];
    const { transactionId, assetCode } = action;

    try {
      const transaction = await getTransaction(transactionId, assetCode);
      const currentStatus = transaction.status;
      console.debug('Current status:', currentStatus);
      action.status = currentStatus;

      if (endStatuses.includes(currentStatus)) {
        stopFetchingTransaction(currentStatus);
        return;
      }

      if (currentStatus === Sep24TransactionStatus.PENDING_USER_TRANSFER_START) {
        stopFetchingTransaction(currentStatus); // stop immediatelly to avoid multiple calls
        setTransaction(transaction);
        setStep(TransactionStep.CONFIRM_TRANSFER);
        return;
      }

      // check again in few seconds only if the user still waiting
      if (stepRef.current === TransactionStep.WAITING) {
        console.log('Sleeping...');
        const timeoutId = setTimeout(() => waitWithdrawOnAnchorComplete(action), 5000);
        setTimeoutId(timeoutId);
      }
    } catch (error) {
      stopFetchingTransaction(Sep24TransactionStatus.ERROR); // clean up
      console.warn('Error getting transaction', error);
    }
  };

  // if the session is not ready, show the loading screen
  if (!sessionStore.accessToken || !sessionStore.publicKey) {
    return <LoadingScreen />;
  }

  return (
    <>
      <OpenURLModal
        isOpen={step === TransactionStep.NONE && !!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onConfirm={() => handleOpenUrlPressed(selectedAsset!)}
      />
      <LoadingModal
        isOpen={step === TransactionStep.STARTED && !currentAction}
        text="Connecting to anchor..."
        testID="loading-url-modal"
      />
      {transaction && currentAction && (
        <ConfirmationModal
          title="Confirm the transaction"
          isOpen={step === TransactionStep.CONFIRM_TRANSFER}
          onPress={() => handleConfirmTransaction(currentAction.transactionId!, currentAction.assetCode!)}
          onClose={() => setStep(TransactionStep.NONE)}
        >
          <Text size="lg" className="mb-4">
            Are you sure you want to withdraw?
          </Text>
          <VStack space="xs">
            <Text>
              Requested: {transaction.amount_in} {currentAction.assetCode}
            </Text>
            <Text>
              Fee: {transaction.amount_fee} {currentAction.assetCode}
            </Text>
            <Text bold>
              You will receive: {transaction.amount_out} {currentAction.assetCode}
            </Text>
          </VStack>
        </ConfirmationModal>
      )}
      <SuccessModal
        isOpen={step === TransactionStep.SUCCESS}
        title="Transaction successful!"
        onClose={() => router.navigate('/wallet')}
      >
        <Text>
          Your withdrawal request has been successfully processed. The funds will be transferred to your account
          shortly.
        </Text>
      </SuccessModal>
      <ErrorModal
        isOpen={step === TransactionStep.ERROR}
        title="Transaction Failed"
        errorMessage={errorMessage || defaultErrorMessage}
        onClose={() => setStep(TransactionStep.NONE)}
      />
      <Box className="flex-1">
        <VStack space="md" className="p-4">
          <Heading size="xl">Choose your currency</Heading>
          {fiatsWithBank.length === 0 && (
            <>
              <Text testID="no-currencies-msg">Please navigate to your profile and select your bank's currency.</Text>
              <HStack>
                <Button variant="link" onPress={() => router.replace('/profile')}>
                  <ButtonText>Go to Profile</ButtonText>
                  <ButtonIcon as={ChevronRightIcon} />
                </Button>
              </HStack>
            </>
          )}
          {fiatsWithBank.length > 0 && (
            <>
              <Card variant="flat">
                {fiatsWithBank.map((currency) => {
                  const asset = CurrencyToAsset[currency];
                  const balance = balanceStore.get(asset);
                  return (
                    <Pressable key={currency} onPress={() => handleSelectAsset(currency)}>
                      <AssetListTile
                        asset={currency}
                        assetType="fiat"
                        subtitle={asset}
                        trailing={<Text>{symbolFor(asset, balance)}</Text>}
                      />
                    </Pressable>
                  );
                })}
              </Card>
            </>
          )}

          {currentAction && (
            <VStack space="lg">
              <Heading size="lg">In progress</Heading>
              <TransactionInprogress
                assetCode={currentAction.assetCode}
                // amount={5}
                status={currentAction?.status ?? Sep24TransactionStatus.INCOMPLETE}
                onUserAction={() => waitWithdrawOnAnchorComplete(currentAction)}
              />
            </VStack>
          )}
          {errorMessage && <Text className="text-error-500">{errorMessage}</Text>}
        </VStack>
      </Box>
    </>
  );
});

type TransactionInprogressProps = {
  assetCode: CryptoAsset;
  amount?: number;
  status: Sep24TransactionStatus;
  onUserAction?: () => void;
};

const TransactionInprogress = ({ assetCode, amount, status, onUserAction }: TransactionInprogressProps) => {
  const currency = AssetToCurrency[assetCode] as FiatCurrency;

  const handlePress = () => {
    if (status === Sep24TransactionStatus.PENDING_USER_TRANSFER_START && onUserAction) {
      onUserAction();
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Card variant="flat" className="bg-amber-50 border-amber-500 border">
        <AssetListTile
          asset={currency}
          assetType="fiat"
          subtitle={assetCode}
          trailing={amount ? <Text bold>{symbolFor(assetCode, -amount)}</Text> : null}
        />
        <HStack className="ml-12 mt-4">
          <Spinner size="small" className="text-amber-500 pl-2" />
          <Text size="sm" className="text-amber-500 ml-3">
            {statusText(status)}
          </Text>
        </HStack>
      </Card>
    </Pressable>
  );
};

const statusText = (status: Sep24TransactionStatus) => {
  switch (status) {
    case Sep24TransactionStatus.COMPLETED:
      return 'Completed';
    case Sep24TransactionStatus.ERROR:
      return 'Error';
    case Sep24TransactionStatus.INCOMPLETE:
      return 'Incomplete or cancelled';
    // case Sep24TransactionStatus.NON_INTERACTIVE_CUSTOMER_INFO_NEEDED:
    // case Sep24TransactionStatus.PENDING_ANCHOR:
    // case Sep24TransactionStatus.PENDING_CUSTOMER_INFO_UPDATE:
    // case Sep24TransactionStatus.PENDING_EXTERNAL:
    // case Sep24TransactionStatus.PENDING_RECEIVER:
    // case Sep24TransactionStatus.PENDING_SENDER:
    // case Sep24TransactionStatus.PENDING_STELLAR:
    // case Sep24TransactionStatus.PENDING_TRANSACTION_INFO_UPDATE:
    // case Sep24TransactionStatus.PENDING_TRUST:
    case Sep24TransactionStatus.PENDING_USER_TRANSFER_START:
      return 'User Action Required';
    // case Sep24TransactionStatus.PENDING_USER:
    //   return 'Waiting';
    default:
      return 'In progress';
  }
};

export default Withdraw;
