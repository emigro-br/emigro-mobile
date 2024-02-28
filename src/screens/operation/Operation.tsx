import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { styled } from 'nativewind';

import { getAssetCode } from '@/stellar/utils';
import { Sep24Transaction } from '@/types/Sep24Transaction';
import { TransactionStatus } from '@/types/TransactionStatus';

import { AssetCode } from '@constants/assetCode';
import { OperationType } from '@constants/constants';

import { CallbackType, ConfirmWithdrawDto, confirmWithdraw, getInteractiveUrl, getTransaction } from '@services/anchor';
import { getUserPublicKey } from '@services/emigro';

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
  CONFIRM_TRANSFER = 'confirm_transfer',
  SUCCESS = 'success',
  ERROR = 'error',
}

const maskWallet = (address: string): string => {
  const firstFive = address.slice(0, 5);
  const lastFive = address.slice(-5);
  return `${firstFive}...${lastFive}`;
};

const defaultErrorMessage = 'Something went wrong. Please try again';

const Operation: React.FunctionComponent = () => {
  const type = OperationType.WITHDRAW; // FIXME: we don't need this
  const [publicKey, setPublicKey] = useState<string | null>(null);
  // const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetCode | null>(null);
  const availableAssets = [AssetCode.ARS, AssetCode.BRL, AssetCode.EURC];
  // TODO: replace by useRef: https://react.dev/reference/react/useRef
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>(); // see: https://code.pieces.app/blog/resolving-react-setinterval-conflicts

  useEffect(() => {
    const getUserPublicKeyAsync = async () => {
      try {
        const publicKey = await getUserPublicKey();
        setPublicKey(publicKey);
      } catch (error) {
        console.error(error);
      }
    };
    getUserPublicKeyAsync();
  });

  const handleOnPress = async (asset: AssetCode) => {
    setOperationLoading(true);
    setSelectedAsset(asset);
    setTransactionId(null);

    const assetCodeSelected = getAssetCode(asset);

    const cognitoToken = sessionStore.accessToken;

    let acccountId = publicKey;
    if (!publicKey) {
      acccountId = await getUserPublicKey(); // TODO: use sessionStore.publicKey;
    }

    const anchorParams = {
      account: acccountId!,
      operation: type as string,
      asset_code: assetCodeSelected,
      cognito_token: cognitoToken!,
    };

    try {
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await getInteractiveUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id) {
        setTransactionId(id);
        setStep(TransactionStep.WAITING);
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
      console.error(error);
      setErrorMessage(defaultErrorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(publicKey!);
  };

  // const handleWebClose = async () => {
  //   if (type == OperationType.WITHDRAW) {
  //     setStep(TransactionStep.WAITING);
  //     // pollWithdrawUntilComplete(transactionId!, getAssetCode(selectedAsset!));
  //     waitWithdrawOnAnchorComplete(transactionId!, getAssetCode(selectedAsset!));
  //   } else {
  //     setStep(TransactionStep.NONE);
  //   }
  // }

  const handleConfirmTransaction = async (transactionId: string, assetCode: AssetCode) => {
    const data: ConfirmWithdrawDto = {
      transactionId,
      assetCode,
      from: publicKey!,
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
  const stopFetchingTransaction = (status: TransactionStatus) => {
    console.debug('Stopping the fetch transaction. Status: ', status);
    clearTimeout(timeoutId);
  };

  const waitWithdrawOnAnchorComplete = async (transactionId: string, assetCode: AssetCode) => {
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

      // check again in few seconds
      console.log('Sleeping...');
      const timeoutId = setTimeout(() => waitWithdrawOnAnchorComplete(transactionId, assetCode), 5000);
      setTimeoutId(timeoutId);
    } catch (error) {
      stopFetchingTransaction(TransactionStatus.ERROR); // clean up
      console.error('Error getting transaction', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <StyledView className="flex items-center bg-white h-full">
      {/* {step == TransactionStep.STARTED &&
        <WebModal url={url!} visible={true} onClose={handleWebClose} />} */}

      <LoadingModal isVisible={step === TransactionStep.WAITING} label="Waiting..." />

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
        publicKey={publicKey!}
      />

      <ErrorModal
        isVisible={step === TransactionStep.ERROR}
        errorMessage={errorMessage || defaultErrorMessage}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <StyledText className="text-center font-black text-2xl my-4">{type}</StyledText>
      {publicKey && (
        <TouchableOpacity onPress={copyToClipboard}>
          <StyledView className="flex flex-row mb-2">
            <StyledText className="text-center text-sm mr-2">{maskWallet(publicKey)}</StyledText>
            <Ionicons name="clipboard-outline" size={16} />
          </StyledView>
        </TouchableOpacity>
      )}
      <StyledText className="text-lg text-center mb-4">Select the currency you want to {type}</StyledText>
      <StyledView className="flex flex-row flex-wrap px-4 gap-4">
        {availableAssets.map((asset) => (
          <TouchableOpacity key={`asset_${asset}`} onPress={() => handleOnPress(asset)} disabled={operationLoading}>
            <StyledView className="flex-row w-32 h-20 items-center justify-center bg-white rounded-lg shadow">
              {operationLoading && asset === selectedAsset ? (
                <ActivityIndicator size="large" />
              ) : (
                <>
                  <Image source={getAssetIcon(asset)} style={{ width: 30, height: 30 }} />
                  <StyledText className="ml-1 flex-row font-bold text-xl">{asset}</StyledText>
                </>
              )}
            </StyledView>
          </TouchableOpacity>
        ))}
      </StyledView>
      {errorMessage && <StyledText className="text-red pt-6">{errorMessage}</StyledText>}
    </StyledView>
  );
};

export default Operation;
