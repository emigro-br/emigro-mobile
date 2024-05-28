import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';

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
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { AssetListTile } from '@/components/AssetListTile';
import { LoadingScreen } from '@/components/Loading';
import { LoadingModal } from '@/components/modals/LoadingModal';
import { OpenURLModal } from '@/components/modals/OpenURLModal';
import { CallbackType, depositUrl } from '@/services/emigro/anchors';
import { sessionStore } from '@/stores/SessionStore';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';
import { CurrencyToAsset } from '@/utils/assets';

const defaultErrorMessage = 'Something went wrong. Please try again';

const Deposit = observer(() => {
  const router = useRouter();
  // const [transactionId, setTransactionId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<CryptoOrFiat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fiatsWithBank = sessionStore.preferences?.fiatsWithBank ?? [];

  useEffect(() => {
    return cleanUp;
  }, []);

  const cleanUp = () => {
    // setTransactionId(null);
    setIsLoading(false);
    setErrorMessage(null);
  };

  const handleOpenConfimed = async (asset: CryptoOrFiat) => {
    if (!sessionStore.accessToken || !sessionStore.publicKey) {
      setErrorMessage('Invalid session');
      return;
    }

    setIsLoading(true);

    // this will works for both fiat and crypto assets in the list
    const assetCode = CurrencyToAsset[asset as FiatCurrency] ?? (asset as CryptoAsset);

    const anchorParams = {
      asset_code: assetCode,
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
        router.back();
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
        testID="open-url-modal"
      />

      <Box flex={1}>
        <VStack p="$4" space="md">
          <Heading size="xl">Add money</Heading>
          {fiatsWithBank.length === 0 && (
            <>
              <Text testID="no-currencies-msg">Please navigate to your profile and select your bank's currency.</Text>
              <HStack>
                <Button variant="link" onPress={() => router.replace('/profile')}>
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
                {fiatsWithBank.map((currency) => {
                  const asset = CurrencyToAsset[currency];
                  return (
                    <Pressable key={currency} onPress={() => setSelectedAsset(currency)}>
                      <AssetListTile asset={currency} subtitle={asset} assetType="fiat" />
                    </Pressable>
                  );
                })}
              </Card>
            </>
          )}

          {errorMessage && <FormControlErrorText>{errorMessage}</FormControlErrorText>}
        </VStack>
      </Box>
    </>
  );
});

export default Deposit;
