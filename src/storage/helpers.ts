import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAccessToken = async (): Promise<string | null> => {
  const session = await AsyncStorage.getItem('session');
  const { accessToken } = session ? JSON.parse(session) : null;
  return accessToken;
};
