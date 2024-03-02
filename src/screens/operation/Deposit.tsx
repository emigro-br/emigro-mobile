import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { Box, Card, FormControlErrorText, HStack, Image, Pressable, Text, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { IAnchorParams } from '@/types/IAnchorParams';
import { CryptoAsset } from '@/types/assets';

import { OperationType } from '@constants/constants';

import { CallbackType, getInteractiveUrl } from '@services/anchor';

import { sessionStore } from '@stores/SessionStore';

import { iconFor } from '@utils/assets';

import { LoadingModal } from './modals/LoadingModal';
import { OpenURLModal } from './modals/OpenURLModal';

const defaultErrorMessage = 'Something went wrong. Please try again';

const Deposit: React.FC = observer(() => {
  const navigation = useNavigation();
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
    navigation.goBack();
  };

  return (
    <Box flex={1}>
      <LoadingModal isOpen={!sessionStore.publicKey || isLoading} text="Connecting to anchor..." />
      <OpenURLModal isOpen={!!url} onConfirm={handleModalPressed} />
      <VStack p="$4" space="lg">
        <Text size="xl">Choose which one you would like to deposit:</Text>
        <HStack space="lg">
          {availableAssets.map((asset) => (
            <Card key={`asset-${asset}`}>
              <Pressable onPress={() => handleAssetChoosen(asset)}>
                <HStack alignItems="center" flexWrap="wrap">
                  <Image source={iconFor(asset)} size="xs" alt={asset} />
                  <Text size="xl" bold ml="$2">
                    {asset}
                  </Text>
                </HStack>
              </Pressable>
            </Card>
          ))}
        </HStack>
        {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
      </VStack>
    </Box>
  );
});

export default Deposit;
