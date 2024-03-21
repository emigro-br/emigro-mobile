export interface IRegisterUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  [key: string]: string;
}
