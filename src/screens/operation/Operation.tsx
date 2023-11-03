import React, { useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { styled } from 'nativewind';
import { useOperationStore } from '@/store/operation.store';
import Button from '@components/Button';
import { AssetCode } from '@constants/assetCode';
import { getUserPublicKey } from '@/services/emigro';
import { getAccessToken, getCriptoCode } from '@/services/helpers';
import { getInteractiveUrl } from '@/services/anchor';

const StyledView = styled(View);    
const StyledText = styled(Text);

const Operation: React.FunctionComponent = () => {
    const { operation } = useOperationStore();
    const [ operationLoading, setOperationLoading] = useState<boolean>(false);
    const [ selectedAsset, setSelectedAsset ] = useState<AssetCode | null>(null);
    const assets = Object.values(AssetCode);
    const filteredAssets = assets.filter(asset => asset !== "USDC" && asset !== "EURC");

    const handleOnPress = async (assetCode: AssetCode) => {
        setOperationLoading(true);
        setSelectedAsset(assetCode);
        const criptoCode = getCriptoCode(assetCode);

        const publicKey = await getUserPublicKey();
        const cognitoToken = await getAccessToken();

        const anchorParams = {
            account: publicKey,
            operation: operation.type as string,
            asset_code: criptoCode,
            cognito_token: cognitoToken,
        };

        try {
            const { url } = await getInteractiveUrl(anchorParams);
            if (url) {
                Linking.openURL(url);
              }
        } catch (error) {
            console.error(error);
        } finally {
            setOperationLoading(false);
        }
    }

    return (
        <StyledView className="flex items-center h-full">
            <StyledText className="text-center font-black text-2xl my-6">{operation.type}</StyledText>
            {filteredAssets.map(asset => (
                <StyledView 
                    className="flex-row h-20 items-center justify-between m-1 px-6 w-full bg-white rounded"
                    key={asset}
                >
                    <Button 
                    onPress={() => handleOnPress(asset as AssetCode)}
                    disabled={operationLoading}
                    >
                        <StyledView className="flex-row gap-2">
                            <StyledText className="text-center font-black text-2xl my-6">
                                {operationLoading && asset === selectedAsset ? <ActivityIndicator size="large" /> : asset}
                            </StyledText>
                        </StyledView>
                    </Button>
                </StyledView>
            ))}
        </StyledView>
    )
}

export default Operation