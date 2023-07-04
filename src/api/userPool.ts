import { CognitoUserPool } from 'amazon-cognito-identity-js';

const userPool = new CognitoUserPool({
  UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.AWS_COGNITO_CLIENT_ID || '',
  endpoint: process.env.AWS_ENDPOINT || '',
});

export default userPool;
