import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.AWS_COGNITO_CLIENT_ID || '',
  endpoint: process.env.AWS_ENDPOINT || '',
});

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
    console.error(error);
    throw error;
  }
}
