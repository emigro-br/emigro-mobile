export type IAuthSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenExpirationDate: Date;
  email: string; // required by Cognito signin/refresh
  publicKey?: string | null;
};
