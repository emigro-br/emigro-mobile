import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

import userPool from '../UserPool';

export function SignUp(email: string, password: string) {
  const userAttributes = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
  ];

  userPool.signUp(email, password, userAttributes, [], (error, data) => {
    if (error) {
      console.log(error);
    }
    console.log(data);
  });
}

export default SignUp;
