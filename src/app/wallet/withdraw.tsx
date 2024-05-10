import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Card,
  ChevronRightIcon,
  FormControlErrorText,
  HStack,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';

import { AssetList } from '@components/AssetList';
import { ConfirmationModal } from '@components/modals/ConfirmationModal';
import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { OpenURLModal } from '@components/modals/OpenURLModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import { RootStackParamList } from '@navigation/RootStack';
import { WalletStackParamList } from '@navigation/WalletStack';

import {
  CallbackType,
  ConfirmWithdrawDto,
  confirmWithdraw,
  getTransaction,
  withdrawUrl,
} from '@services/emigro/anchors';
import { Sep24Transaction, Sep24TransactionStatus } from '@services/emigro/types';

import { sessionStore } from '@stores/SessionStore';

import { CurrencyToAsset } from '@utils/assets';

import { LoadingScreen } from '../../components/Loading';

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
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList & WalletStackParamList, 'Withdraw'>;
};

const Withdraw = observer(({ navigation }: Props) => {
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [currentAction, setCurrentAction] = useState<WithdrawAction | null>(null);
  const [pendingAction, setPendingAction] = useState<WithdrawAction | null>(null);
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
    setPendingAction(null);
    setErrorMessage(null);
    setStep(TransactionStep.NONE);
  };

  const handleOpenUrlPressed = async (asset: CryptoOrFiat) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
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
      console.warn(error);
      setErrorMessage(defaultErrorMessage);
      setStep(TransactionStep.ERROR);
    } finally {
      setSelectedAsset(null);
    }
  };

  const handleCloseWait = () => {
    setPendingAction(currentAction);
    setCurrentAction(null);
    stopFetchingTransaction();
    setStep(TransactionStep.NONE);
  };

  const handleConfirmTransaction = async (transactionId: string, assetCode: CryptoAsset) => {
    const data: ConfirmWithdrawDto = {
      transactionId,
      assetCode,
      from: sessionStore.publicKey!,
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
      console.error('Error getting transaction', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
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

      <LoadingModal
        isOpen={step === TransactionStep.WAITING && !!currentAction}
        text="Awaiting transaction completion..."
        onClose={handleCloseWait}
        testID="waiting-transaction-modal"
      />

      {transaction && currentAction && (
        <ConfirmationModal
          title="Confirm the transaction"
          isOpen={step === TransactionStep.CONFIRM_TRANSFER}
          onPress={() => handleConfirmTransaction(currentAction.transactionId!, currentAction.assetCode!)}
          onClose={() => setStep(TransactionStep.NONE)}
        >
          <Text size="lg" mb="$4">
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
        onClose={() => setStep(TransactionStep.NONE)}
      >
        <Text>
          Your withdrawal request has been successfully processed. The funds will be transferred to your account
          shortly.
        </Text>
      </SuccessModal>

      <ErrorModal
        isOpen={step === TransactionStep.ERROR}
        title="Transaction Failed"
        errorMessage={`Failed message: ${errorMessage || defaultErrorMessage}`}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">Withdraw money</Heading>
          {fiatsWithBank.length === 0 && (
            <>
              <Text testID="no-currencies-msg">Please navigate to your profile and select your bank's currency.</Text>
              <HStack>
                <Button variant="link" onPress={() => navigation.replace('Root', { screen: 'ProfileTab' })}>
                  <ButtonText>Go to Profile</ButtonText>
                  <ButtonIcon as={ChevronRightIcon} />
                </Button>
              </HStack>
            </>
          )}
          {fiatsWithBank.length > 0 && (
            <>
              <Text>Choose the currency you want to withdraw</Text>
              <Card variant="flat">
                <AssetList data={fiatsWithBank} onPress={(item) => setSelectedAsset(item)} />
              </Card>
            </>
          )}

          {pendingAction && step === TransactionStep.NONE && (
            <Button variant="link" onPress={() => waitWithdrawOnAnchorComplete(pendingAction)} alignSelf="flex-start">
              <ButtonText>Check pending transaction: {pendingAction.transactionId}</ButtonText>
            </Button>
          )}
          {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
        </VStack>
      </Box>
    </>
  );
});

export default Withdraw;
