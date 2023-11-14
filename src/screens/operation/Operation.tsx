import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Linking, Text, TouchableOpacity, View } from 'react-native';

import { getInteractiveUrl } from '@/services/anchor';
import { getUserPublicKey } from '@/services/emigro';
import { getAssetCode } from '@/stellar/utils';
import { getAccessToken } from '@/storage/helpers';
import { useOperationStore } from '@/store/operationStore';
import { getAssetIcon } from '@/utils/getAssetIcon';

import { AssetCode } from '@constants/assetCode';

const StyledView = styled(View);
const StyledText = styled(Text);

const Operation: React.FunctionComponent = () => {
  const { type } = useOperationStore().operation;
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetCode | null>(null);
  const assets = Object.values(AssetCode);
  const filteredAssets = assets.filter((asset) => !['USDC', 'EURC'].includes(asset));

  const handleOnPress = async (asset: AssetCode) => {
    setOperationLoading(true);
    setSelectedAsset(asset);
    const assetCodeSelected = getAssetCode(asset);

    const publicKey = await getUserPublicKey();
    const cognitoToken = await getAccessToken();

    const anchorParams = {
      account: publicKey,
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

  return (
    <StyledView className="flex items-center h-full">
      <StyledText className="text-center font-black text-2xl my-6">{type}</StyledText>
      <StyledText className="text-lg p-6 text-center">Select the type of currency you want to {type}</StyledText>
      {filteredAssets.map((asset) => (
        <TouchableOpacity key={`asset_${asset}`} onPress={() => handleOnPress(asset)} disabled={operationLoading}>
          <StyledView className="flex-row w-32 h-20 items-center justify-center m-1 px-6 bg-white rounded shadow-xl">
            {operationLoading && asset === selectedAsset ? (
              <ActivityIndicator size="large" />
            ) : (
              <StyledText className="font-bold text-2xl">
                <Image source={getAssetIcon(asset)} style={{ width: 30, height: 30 }} />
                {asset}
              </StyledText>
            )}
          </StyledView>
        </TouchableOpacity>
      ))}
      {errorMessage && <StyledText className="text-red">Something went wrong. Please try again</StyledText>}
    </StyledView>
  );
};

export default Operation;
