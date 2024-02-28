import React, { useEffect, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { styled } from 'nativewind';

import { getAssetCode } from '@/stellar/utils';

import { AssetCode } from '@constants/assetCode';
import { OperationType } from '@constants/constants';

import { CallbackType, getInteractiveUrl } from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

import { getAssetIcon } from '@utils/getAssetIcon';

import { LoadingModal } from './modals/LoadingModal';
import { OpenURLModal } from './modals/OpenURLModal';

const StyledView = styled(View);
const StyledText = styled(Text);

const defaultErrorMessage = 'Something went wrong. Please try again';

const Deposit: React.FC = () => {
  const navigation = useNavigation();
  // const [transactionId, setTransactionId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const availableAssets = [AssetCode.ARS, AssetCode.BRL, AssetCode.EURC];

  useEffect(() => {
    if (!sessionStore.publicKey) {
      sessionStore.fetchPublicKey();
    }
    return cleanUp;
  }, [sessionStore.publicKey]);

  const cleanUp = () => {
    // setTransactionId(null);
    setUrl(null);
    setOperationLoading(false);
    setErrorMessage(null);
  };

  const handleAssetChoosen = async (asset: AssetCode) => {
    setOperationLoading(true);

    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      setOperationLoading(false);
      return;
    }

    const anchorParams = {
      account: sessionStore.publicKey,
      operation: OperationType.DEPOSIT,
      asset_code: getAssetCode(asset),
      cognito_token: sessionStore.accessToken,
    };

    try {
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await getInteractiveUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id) {
        console.debug('Transaction id:', id);
        // setTransactionId(id);
      }

      if (url) {
        setUrl(url);
      } else {
        setErrorMessage(defaultErrorMessage);
      }
    } catch (error) {
      console.warn(error);
      setErrorMessage(defaultErrorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleModalPressed = () => {
    Linking.openURL(url!);
    navigation.goBack();
  };

  return (
    <StyledView className="flex bg-white h-full">
      <LoadingModal isVisible={operationLoading} />
      <OpenURLModal isVisible={!!url} onConfirm={handleModalPressed} />

      <StyledText className="text-lg p-4">Choose which one you would like to deposit:</StyledText>
      <StyledView className="flex flex-row flex-wrap px-4 gap-4">
        {availableAssets.map((asset) => (
          <TouchableOpacity key={`asset_${asset}`} onPress={() => handleAssetChoosen(asset)}>
            <StyledView className="flex-row w-32 h-20 items-center justify-center bg-white rounded-lg shadow">
              <Image source={getAssetIcon(asset)} style={{ width: 30, height: 30 }} />
              <StyledText className="ml-1 flex-row font-bold text-xl">{asset}</StyledText>
            </StyledView>
          </TouchableOpacity>
        ))}
      </StyledView>
      {errorMessage && <StyledText className="text-red px-4 pt-6">{errorMessage}</StyledText>}
    </StyledView>
  );
};

export default Deposit;
