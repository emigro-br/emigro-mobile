import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

import userPool from '../userPool';

export function SignUp(email: string, password: string) {
  const userAttributes = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    }),
  ];

  userPool.signUp(email, password, userAttributes, [], (error) => {
    if (error) {
      console.log(error);
    }
  });
}

export default SignUp;
