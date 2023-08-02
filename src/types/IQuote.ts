export interface IQuote {
  from: string;
  to: string;
  amount: string;
}

export interface ITransactionRequest {
  maxAmountToSend: string | undefined;
  destinationAmount: string;
  destination: string;
}
