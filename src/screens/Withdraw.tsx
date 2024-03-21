import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Box, Button, ButtonText, Card, FormControlErrorText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { IAnchorParams } from '@/types/IAnchorParams';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';
import { CryptoAsset } from '@/types/assets';

import { AssetList } from '@components/AssetList';
import { ConfirmationModal } from '@components/modals/ConfirmationModal';
import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { OpenURLModal } from '@components/modals/OpenURLModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import {
  CallbackType,
  ConfirmWithdrawDto,
  confirmWithdraw,
  getInteractiveWithdrawUrl,
  getTransaction,
} from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

import { LoadingScreen } from './Loading';

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

const Withdraw: React.FC = observer(() => {
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [currentAction, setCurrentAction] = useState<WithdrawAction | null>(null);
  const [pendingAction, setPendingAction] = useState<WithdrawAction | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const availableAssets = [CryptoAsset.ARS, CryptoAsset.BRL, CryptoAsset.EURC];
  // TODO: replace by useRef: https://react.dev/reference/react/useRef
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>(); // see: https://code.pieces.app/blog/resolving-react-setinterval-conflicts

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

  const handleOpenUrlPressed = async (asset: CryptoAsset) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
    }

    // setTransactionId(null);

    setStep(TransactionStep.STARTED);

    try {
      const anchorParams: IAnchorParams = {
        asset_code: asset,
      };
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await getInteractiveWithdrawUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id && url) {
        // setTransactionId(id);
        const action: WithdrawAction = { transactionId: id, assetCode: asset, anchorUrl: url };
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
  const stopFetchingTransaction = (status?: TransactionStatus) => {
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

    const endStatuses = [TransactionStatus.COMPLETED, TransactionStatus.ERROR];
    const { transactionId, assetCode } = action;

    try {
      const transaction = await getTransaction(transactionId, assetCode);
      const currentStatus = transaction.status;
      console.debug('Current status:', currentStatus);

      if (endStatuses.includes(currentStatus)) {
        stopFetchingTransaction(currentStatus);
        return;
      }

      if (currentStatus === TransactionStatus.PENDING_USER_TRANSFER_START) {
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
      stopFetchingTransaction(TransactionStatus.ERROR); // clean up
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
        publicKey={sessionStore.publicKey!}
      />

      <ErrorModal
        isOpen={step === TransactionStep.ERROR}
        title="Transaction Failed"
        errorMessage={`Failed message: ${errorMessage || defaultErrorMessage}`}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">Withdraw money</Heading>
          <Text>Choose the currency you want to withdraw</Text>
          <Card variant="flat">
            <AssetList data={availableAssets} onPress={(item) => setSelectedAsset(item as CryptoAsset)} />
          </Card>

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
