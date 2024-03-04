import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Card, FormControlErrorText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { IAnchorParams } from '@/types/IAnchorParams';
import { CryptoAsset } from '@/types/assets';

import { AssetList } from '@components/AssetList';
import { LoadingModal } from '@components/modals/LoadingModal';
import { OpenURLModal } from '@components/modals/OpenURLModal';

import { OperationType } from '@constants/constants';

import { WalletStackParamList } from '@navigation/WalletStack';

import { CallbackType, getInteractiveUrl } from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

const defaultErrorMessage = 'Something went wrong. Please try again';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList, 'Deposit'>;
};

const Deposit = observer(({ navigation }: Props) => {
  // const [transactionId, setTransactionId] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const availableAssets = [CryptoAsset.ARS, CryptoAsset.BRL, CryptoAsset.EURC];

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    // setTransactionId(null);
    setUrl(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleAssetChoosen = async (asset: CryptoAsset) => {
    setIsLoading(true);

    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      setIsLoading(false);
      return;
    }

    const anchorParams: IAnchorParams = {
      account: sessionStore.publicKey,
      operation: OperationType.DEPOSIT,
      asset_code: asset,
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
      setIsLoading(false);
    }
  };

  const handleModalPressed = () => {
    Linking.openURL(url!);
    navigation.popToTop();
  };

  return (
    <>
      <LoadingModal isOpen={!sessionStore.publicKey || isLoading} text="Connecting to anchor..." />
      <OpenURLModal isOpen={!!url} onConfirm={handleModalPressed} />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">Add money</Heading>
          <Text>Choose the currency you want to deposit</Text>
          <Card size="md" py="$1" variant="filled" bg="$white">
            <AssetList data={availableAssets} onPress={(item) => handleAssetChoosen(item as CryptoAsset)} />
          </Card>
          {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
        </VStack>
      </Box>
    </>
  );
});
export default Deposit;
