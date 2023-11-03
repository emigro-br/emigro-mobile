import { AssetCode } from "@constants/assetCode";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAccessToken = async (): Promise<string | null> => {
    const session = await AsyncStorage.getItem('session');
    const { accessToken } = session ? JSON.parse(session) : null;
    return accessToken;
};

export const getCriptoCode = (assetCode: AssetCode): AssetCode => {
    if (assetCode === AssetCode.USD) {
        return AssetCode.USDC;
    }
    if (assetCode === AssetCode.EUR) {
        return AssetCode.EURC;
    }
    return assetCode;
}