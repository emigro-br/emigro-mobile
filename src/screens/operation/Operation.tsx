import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';

import { getInteractiveUrl, confirmWithdraw, ConfirmWithdrawDto, CallbackType, getTransaction } from '@/services/anchor';
import { getUserPublicKey } from '@/services/emigro';
import { getAssetCode } from '@/stellar/utils';
import { getAccessToken } from '@/storage/helpers';
import { useOperationStore } from '@/store/operationStore';
import { getAssetIcon } from '@/utils/getAssetIcon';
import { AssetCode } from '@constants/assetCode';
import { ErrorModal } from './modals/ErrorModal';
import { SuccessModal } from './modals/SuccessModal';
import { ConfirmationModal } from './modals/ConfirmationModal';
import { Sep24Transaction } from '../../types/Sep24Transaction';
import { TransactionStatus } from '../../types/TransactionStatus';
import { LoadingModal } from './modals/LoadingModal';

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
}

const defaultErrorMessage = 'Something went wrong. Please try again';

const Operation: React.FunctionComponent = () => {
  let timer: NodeJS.Timeout;
  const { type } = useOperationStore().operation;
  const [publicKey, setPublicKey] = useState<string | null>(null);
  // const [url, setUrl] = useState<string | null>(null);
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<Sep24Transaction | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetCode | null>(null);
  const assets = Object.values(AssetCode);
  const filteredAssets = assets.filter((asset) => !['USDC', 'EURC'].includes(asset));

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
    
    const cognitoToken = await getAccessToken();
    
    let acccountId = publicKey;
    if (!publicKey) {
      acccountId = await getUserPublicKey();
    }
    
    const anchorParams = {
      account: acccountId!,
      operation: type as string,
      asset_code: assetCodeSelected,
      cognito_token: cognitoToken,
    };
    
    try {
      //TODO: naviigation changing with error for invalid callback url
      const { url, id } = await getInteractiveUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (url) {
        setTransactionId(id);

        // with Modal
        // setUrl(url);
        // setStep(TransactionStep.STARTED);

        // without Modal
        Linking.openURL(url);
        setStep(TransactionStep.WAITING);
        waitWithdrawOnAnchorComplete(id, assetCodeSelected);
      }
      if (!url) {
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
      const response = await confirmWithdraw(data);
      setStep(TransactionStep.SUCCESS);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
      setStep(TransactionStep.ERROR);
    }
  }

  const waitWithdrawOnAnchorComplete = async (transactionId: string, assetCode: AssetCode) => {
    const endStatuses = [
      TransactionStatus.COMPLETED,
      TransactionStatus.ERROR,
    ];

    try {
      const transaction = await getTransaction(transactionId, assetCode);
      const currentStatus = transaction.status;

      if (endStatuses.includes(currentStatus)) {
        console.debug('Finished with current status:', currentStatus);
        clearInterval(timer);
        return;
      }

      if (currentStatus == TransactionStatus.PENDING_USER_TRANSFER_START) {
        setTransaction(transaction);
        setStep(TransactionStep.CONFIRM_TRANSFER);
        clearInterval(timer);
        return;
      }

      // check again in few seconds
      console.log('Sleeping...');
      timer = setInterval(() => waitWithdrawOnAnchorComplete(transactionId, assetCode), 5000);

      // only for debugging
      switch (currentStatus) {
        case TransactionStatus.PENDING_ANCHOR: {
          console.log({
            title: "The anchor is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_STELLAR: {
          console.log({
            title: "The Stellar network is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_EXTERNAL: {
          console.log({
            title: "The transaction is being processed by an external system",
          });
          break;
        }
        case TransactionStatus.PENDING_USER: {
          console.log({
            title:
              "The anchor is waiting for you to take the action described in the popup",
          });
          break;
        }
        case TransactionStatus.ERROR: {
          console.log({
            title: "There was a problem processing your transaction",
          });
          break;
        }
        default:
        // do nothing
      }

    } catch (error) {
      console.error('Error getting transaction', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
    }
  }


  return (
    <StyledView className="flex items-center bg-white h-full">
      {/* {step == TransactionStep.STARTED &&
        <WebModal url={url!} visible={true} onClose={handleWebClose} />} */}

      <LoadingModal isVisible={step == TransactionStep.WAITING} label='Waiting...' />

      {transaction &&
        <ConfirmationModal
          isVisible={step === TransactionStep.CONFIRM_TRANSFER}
          transaction={transaction!}
          assetCode={getAssetCode(selectedAsset!)}
          onPress={() => handleConfirmTransaction(transactionId!, getAssetCode(selectedAsset!))}
          onClose={() => setStep(TransactionStep.NONE)}
        />
      }

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
      {publicKey &&
        <TouchableOpacity onPress={copyToClipboard}>
          <StyledView className="flex flex-row mb-2">
            <StyledText className="text-center text-sm mr-2">{maskWallet(publicKey)}</StyledText>
            <Ionicons name="clipboard-outline" size={16} />
          </StyledView>
        </TouchableOpacity>
      }
      <StyledText className="text-lg text-center mb-4">Select the currency you want to {type}</StyledText>
      <StyledView className='flex flex-row flex-wrap px-4 gap-4'>
        {filteredAssets.map((asset) => (
          <TouchableOpacity key={`asset_${asset}`} onPress={() => handleOnPress(asset)} disabled={operationLoading}>
            <StyledView className="flex-row w-32 h-20 items-center justify-center bg-white rounded-lg shadow">
              {operationLoading && asset === selectedAsset ? (
                <ActivityIndicator size="large" />
              ) : (
                <>
                  <Image source={getAssetIcon(asset)} style={{ width: 30, height: 30 }} />
                  <StyledText className="ml-1 flex-row font-bold text-xl">
                    {asset}
                  </StyledText>
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
