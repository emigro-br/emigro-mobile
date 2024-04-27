import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Card, FormControlErrorText, Heading, Text, VStack } from '@gluestack-ui/themed';
import { observer } from 'mobx-react-lite';

import { CryptoAsset, stableCoins } from '@/types/assets';

import { AssetList } from '@components/AssetList';
import { LoadingModal } from '@components/modals/LoadingModal';
import { OpenURLModal } from '@components/modals/OpenURLModal';

import { WalletStackParamList } from '@navigation/WalletStack';

import { CallbackType, depositUrl } from '@services/emigro/anchors';

import { sessionStore } from '@stores/SessionStore';

import { LoadingScreen } from './Loading';

const defaultErrorMessage = 'Something went wrong. Please try again';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList, 'Deposit'>;
};

const Deposit = observer(({ navigation }: Props) => {
  // const [transactionId, setTransactionId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const availableAssets = stableCoins();

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    // setTransactionId(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleOpenConfimed = async (asset: CryptoAsset) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
    }

    setIsLoading(true);

    const anchorParams = {
      asset_code: asset,
    };

    try {
      //TODO: webview change navigation thwors error for CallbackType.CALLBACK_URL
      const { url, id } = await depositUrl(anchorParams, CallbackType.EVENT_POST_MESSAGE);

      if (id) {
        console.debug('Transaction id:', id);
        // setTransactionId(id);
      }

      if (url) {
        Linking.openURL(url!);
        navigation.popToTop();
      } else {
        setErrorMessage(defaultErrorMessage);
      }
    } catch (error) {
      setErrorMessage(defaultErrorMessage);
      throw error; // sentry
    } finally {
      setIsLoading(false);
      setSelectedAsset(null);
    }
  };

  // if the session is not ready, show the loading screen
  if (!sessionStore.accessToken || !sessionStore.publicKey) {
    return <LoadingScreen />;
  }

  return (
    <>
      <LoadingModal isOpen={isLoading} text="Connecting to anchor..." />
      <OpenURLModal
        isOpen={!!selectedAsset && !isLoading}
        onClose={() => setSelectedAsset(null)}
        onConfirm={() => handleOpenConfimed(selectedAsset!)}
      />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">Add money</Heading>
          <Text>Choose the currency you want to deposit</Text>
          <Card variant="flat">
            <AssetList data={availableAssets} onPress={(item) => setSelectedAsset(item as CryptoAsset)} />
          </Card>
          {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
        </VStack>
      </Box>
    </>
  );
});
export default Deposit;
