import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticationDetails, CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

import userPool from '@api/userPool';

type UserInformation = {
  [key: string]: any;
};

export default async function signIn(email: string, password: string) {
  const user = new CognitoUser({ Username: email, Pool: userPool });

  const authenticationDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  try {
    const session: CognitoUserSession = await new Promise((resolve, reject) => {
      user.authenticateUser(authenticationDetails, {
        onSuccess: (result) => resolve(result),
        onFailure: (error) => reject(error),
      });
    });

    const accessToken = session.getAccessToken().getJwtToken();
    await AsyncStorage.setItem('authToken', accessToken);

    user.getUserAttributes(async (error, attributes) => {
      if (error) {
        console.error(error);
      } else {
        const userInformation: UserInformation = {};
        attributes?.forEach((attribute) => {
          const attributeName = attribute.getName();
          const attributeValue = attribute.getValue();
          userInformation[attributeName] = attributeValue;
        });
        await AsyncStorage.setItem('userInformation', JSON.stringify(userInformation));
      }
    });

    return accessToken;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
