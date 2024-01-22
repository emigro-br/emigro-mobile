export type IAuthSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  tokenExpirationDate: Date;
  email?: string | null;
};
