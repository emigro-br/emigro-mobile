import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

import userPool from '../userPool';

export function signUp(email: string, password: string, firstName: string, lastName: string, address: string) {
  const userAttributes = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
    new CognitoUserAttribute({
      Name: 'given_name',
      Value: firstName,
    }),
    new CognitoUserAttribute({
      Name: 'family_name',
      Value: lastName,
    }),
    new CognitoUserAttribute({
      Name: 'address',
      Value: address,
    }),
  ];

  userPool.signUp(email, password, userAttributes, [], (error, result) => {
    if (error) {
      console.error(error);
    } else {
      console.log(result?.user, 'Created user');
    }
  });
}

export default signUp;
