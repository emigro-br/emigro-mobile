import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Ionicons from '@expo/vector-icons/Ionicons';

import { getInteractiveUrl } from '@/services/anchor';
import { getUserPublicKey } from '@/services/emigro';
import { getAssetCode } from '@/stellar/utils';
import { getAccessToken } from '@/storage/helpers';
import { useOperationStore } from '@/store/operationStore';
import { getAssetIcon } from '@/utils/getAssetIcon';

import { AssetCode } from '@constants/assetCode';

const StyledView = styled(View);
const StyledText = styled(Text);

const maskWallet = (address: string): string => {
  const firstFive = address.slice(0, 5);
  const lastFive = address.slice(-5);
  return `${firstFive}...${lastFive}`;
}

const Operation: React.FunctionComponent = () => {
  const { type } = useOperationStore().operation;
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
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
      const { url } = await getInteractiveUrl(anchorParams);
      if (url) {
        Linking.openURL(url);
      }
      if (!url) {
        setErrorMessage(true);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(true);
    } finally {
      setOperationLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(publicKey!);
  };

  return (
    <StyledView className="flex items-center bg-white h-full">
      <StyledText className="text-center font-black text-2xl my-4">{type}</StyledText>
      {publicKey && 
        <TouchableOpacity onPress={copyToClipboard}>
            <StyledView className="flex flex-row mb-2">
              <StyledText className="text-center text-sm mr-2">{maskWallet(publicKey)}</StyledText>
              <Ionicons name="clipboard-outline" size={16} />
            </StyledView>
        </TouchableOpacity>
      } 
      <StyledText className="text-lg text-center mb-2">Select the currency you want to {type}</StyledText>
      {filteredAssets.map((asset) => (
        <TouchableOpacity key={`asset_${asset}`} onPress={() => handleOnPress(asset)} disabled={operationLoading}>
          <StyledView className="flex flex-row w-32 h-20 items-center justify-center m-1 px-6 bg-white rounded shadow-xl">
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
      {errorMessage && <StyledText className="text-red">Something went wrong. Please try again</StyledText>}
    </StyledView>
  );
};

export default Operation;
