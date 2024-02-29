import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import { observer } from 'mobx-react-lite';
import { styled } from 'nativewind';

import { getAssetCode } from '@/stellar/utils';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';

import Button from '@components/Button';

import { AssetCode } from '@constants/assetCode';
import { OperationType } from '@constants/constants';

import { CallbackType, ConfirmWithdrawDto, confirmWithdraw, getInteractiveUrl, getTransaction } from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

import { getAssetIcon } from '@utils/getAssetIcon';

import { ConfirmationModal } from './modals/ConfirmationModal';
import { ErrorModal } from './modals/ErrorModal';
import { LoadingModal } from './modals/LoadingModal';
import { SuccessModal } from './modals/SuccessModal';

const StyledView = styled(View);
const StyledText = styled(Text);

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
  // const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetCode | null>(null);
  const availableAssets = [AssetCode.ARS, AssetCode.BRL, AssetCode.EURC];
  // TODO: replace by useRef: https://react.dev/reference/react/useRef
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>(); // see: https://code.pieces.app/blog/resolving-react-setinterval-conflicts

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    // setTransactionId(null);
    // setUrl(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleOnPress = async (asset: AssetCode) => {
    setIsLoading(true);
    setSelectedAsset(asset);
    setTransactionId(null);

    const assetCodeSelected = getAssetCode(asset);

    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      setIsLoading(false);
      return;
    }

    const anchorParams = {
      account: sessionStore.publicKey,
      operation: OperationType.WITHDRAW,
      asset_code: assetCodeSelected,
      cognito_token: sessionStore.accessToken,
    };

    try {
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await getInteractiveUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id) {
        setTransactionId(id);
        waitWithdrawOnAnchorComplete(id, assetCodeSelected);
      }

      if (url) {
        // with Modal
        // setUrl(url);
        // setStep(TransactionStep.STARTED);

        // without Modal
        Linking.openURL(url);
      } else if (!url && !id) {
        setErrorMessage(defaultErrorMessage);
      }
    } catch (error) {
      console.warn(error);
      setErrorMessage(defaultErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async (transactionId: string, assetCode: AssetCode) => {
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

  const waitWithdrawOnAnchorComplete = async (transactionId: string, assetCode: AssetCode) => {
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

  const handleCloseWait = () => {
    stopFetchingTransaction();
    setStep(TransactionStep.PENDING_USER);
  };

  return (
    <StyledView className="flex bg-white h-full">
      <LoadingModal isVisible={!sessionStore.publicKey || isLoading} />
      <LoadingModal isVisible={step === TransactionStep.STARTED} label="Loading..." />
      <LoadingModal isVisible={step === TransactionStep.WAITING} label="Waiting..." onClose={handleCloseWait} />

      {transaction && (
        <ConfirmationModal
          isVisible={step === TransactionStep.CONFIRM_TRANSFER}
          transaction={transaction!}
          assetCode={getAssetCode(selectedAsset!)}
          onPress={() => handleConfirmTransaction(transactionId!, getAssetCode(selectedAsset!))}
          onClose={() => setStep(TransactionStep.NONE)}
        />
      )}

      <SuccessModal
        isVisible={step === TransactionStep.SUCCESS}
        onClose={() => setStep(TransactionStep.NONE)}
        publicKey={sessionStore.publicKey!}
      />

      <ErrorModal
        isVisible={step === TransactionStep.ERROR}
        errorMessage={errorMessage || defaultErrorMessage}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <StyledText className="text-lg p-4">Select the currency you want to withdraw:</StyledText>
      <StyledView className="flex flex-row flex-wrap px-4 gap-4">
        {availableAssets.map((asset) => (
          <TouchableOpacity key={`asset_${asset}`} onPress={() => handleOnPress(asset)}>
            <StyledView className="flex-row w-32 h-20 items-center justify-center bg-white rounded-lg shadow">
              <Image source={getAssetIcon(asset)} style={{ width: 30, height: 30 }} />
              <StyledText className="ml-1 flex-row font-bold text-xl">{asset}</StyledText>
            </StyledView>
          </TouchableOpacity>
        ))}
      </StyledView>
      {transactionId && step === TransactionStep.PENDING_USER && (
        <StyledView className="items-start mt-6">
          <Button
            textColor="red"
            onPress={() => waitWithdrawOnAnchorComplete(transactionId, getAssetCode(selectedAsset!))}
          >
            Check pending transaction: {transactionId}
          </Button>
        </StyledView>
      )}
      {errorMessage && <StyledText className="text-red pt-6">{errorMessage}</StyledText>}
    </StyledView>
  );
});

export default Withdraw;
