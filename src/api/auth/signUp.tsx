import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

import userPool from '../userPool';

export function signUp(email: string, password: string) {
  const userAttributes = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
  ];

  userPool.signUp(email, password, userAttributes, [], (error, data) => {
    if (error) {
      console.error(error);
    }
    console.log(data);
  });
}

export default signUp;
