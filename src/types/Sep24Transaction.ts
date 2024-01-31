import { TransactionStatus } from '@/types/TransactionStatus';


export type Sep24Transaction = {
  amount_fee: string;
  amount_in: string;
  amount_out: string;
  completed_at: string | null;
  external_transaction_id: string;
  from: string;
  id: string;
  kind: string;
  message: string;
  more_info_url: string;
  refunded: boolean;
  started_at: string;
  status: TransactionStatus;
  status_eta: string | null;
  stellar_transaction_id: string | null;
  to: string | null;
  withdraw_anchor_account: string;
  withdraw_memo: string;
  withdraw_memo_type: string;
};
