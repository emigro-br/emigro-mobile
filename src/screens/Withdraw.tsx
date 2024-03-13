import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Box, Button, ButtonText, Card, FormControlErrorText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';
import { CryptoAsset } from '@/types/assets';

import { AssetList } from '@components/AssetList';
import { ConfirmationModal } from '@components/modals/ConfirmationModal';
import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { OpenURLModal } from '@components/modals/OpenURLModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import { OperationType } from '@constants/constants';

import { CallbackType, ConfirmWithdrawDto, confirmWithdraw, getInteractiveUrl, getTransaction } from '@services/anchor';

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

const Withdraw: React.FC = observer(() => {
  const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [transactionId, setTransactionId] = useState<string | null>(null);
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
    setTransactionId(null);
    setUrl(null);
    setErrorMessage(null);
    setStep(TransactionStep.NONE);
  };

  const handleOnPress = async (asset: CryptoAsset) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
    }

    setSelectedAsset(asset);
    setTransactionId(null);

    setStep(TransactionStep.STARTED);

    try {
      const anchorParams = {
        account: sessionStore.publicKey,
        operation: OperationType.WITHDRAW,
        asset_code: asset,
        cognito_token: sessionStore.accessToken,
      };
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await getInteractiveUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id && url) {
        setTransactionId(id);
        setUrl(url);
      } else {
        throw new Error('Can not fetch the interactive url');
      }
    } catch (error) {
      console.warn(error);
      setErrorMessage(defaultErrorMessage);
      setStep(TransactionStep.ERROR);
    }
  };

  const handleOpenUrlPressed = () => {
    if (url && transactionId && selectedAsset) {
      setStep(TransactionStep.WAITING);
      waitWithdrawOnAnchorComplete(transactionId, selectedAsset);
      Linking.openURL(url);
    }
  };

  const handleCloseWait = () => {
    stopFetchingTransaction();
    setStep(TransactionStep.PENDING_USER);
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

  const waitWithdrawOnAnchorComplete = async (transactionId: string, assetCode: CryptoAsset) => {
    if (stepRef.current !== TransactionStep.WAITING) {
      setStep(TransactionStep.WAITING);
    }

    const endStatuses = [TransactionStatus.COMPLETED, TransactionStatus.ERROR];

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
        const timeoutId = setTimeout(() => waitWithdrawOnAnchorComplete(transactionId, assetCode), 5000);
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
      <LoadingModal
        isOpen={step === TransactionStep.STARTED && !url}
        text="Connecting to anchor..."
        testID="loading-url-modal"
      />
      <OpenURLModal
        isOpen={step === TransactionStep.STARTED && !!url}
        onClose={cleanUp}
        onConfirm={handleOpenUrlPressed}
      />

      <LoadingModal
        isOpen={step === TransactionStep.WAITING}
        text="Awaiting transaction completion..."
        onClose={handleCloseWait}
        testID="waiting-transaction-modal"
      />

      {transaction && (
        <ConfirmationModal
          title="Confirm the transaction"
          isOpen={step === TransactionStep.CONFIRM_TRANSFER}
          onPress={() => handleConfirmTransaction(transactionId!, selectedAsset!)}
          onClose={() => setStep(TransactionStep.NONE)}
        >
          <Text size="lg" mb="$4">
            Are you sure you want to withdraw?
          </Text>
          <VStack space="xs">
            <Text>
              Requested: {transaction.amount_in} {selectedAsset}
            </Text>
            <Text>
              Fee: {transaction.amount_fee} {selectedAsset}
            </Text>
            <Text bold>
              You will receive: {transaction.amount_out} {selectedAsset}
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
          <Card size="md" py="$1" variant="filled" bg="$white">
            <AssetList data={availableAssets} onPress={(item) => handleOnPress(item as CryptoAsset)} />
          </Card>

          {transactionId && step === TransactionStep.PENDING_USER && (
            <Button
              variant="link"
              onPress={() => waitWithdrawOnAnchorComplete(transactionId, selectedAsset!)}
              alignSelf="flex-start"
            >
              <ButtonText>Check pending transaction: {transactionId}</ButtonText>
            </Button>
          )}
          {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
        </VStack>
      </Box>
    </>
  );
});

export default Withdraw;
