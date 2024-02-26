export interface IRegisterUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  role: string;
  [key: string]: string;
}
