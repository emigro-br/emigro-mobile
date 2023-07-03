import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationDetails, CognitoUser } from 'amazon-cognito-identity-js';

import userPool from '@api/userPool';

export default async function signIn(username: string, password: string) {
  const user = new CognitoUser({ Username: username, Pool: userPool });
  user.setAuthenticationFlowType('USER_PASSWORD_AUTH');

  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });

  try {
    const accessToken = await new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (result) => resolve(result.getAccessToken().getJwtToken()),
        onFailure: (error) => reject(error),
      });
    });
    await AsyncStorage.setItem('authToken', accessToken as string);

    return accessToken;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
