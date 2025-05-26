import { useRouter } from 'expo-router';

import { FeedbackScreen } from '@/screens/FeedbackScreen';

const PaymentSuccess = () => {
  const router = useRouter();
  return (
    <FeedbackScreen
      action="success"
      title="Transaction Successful"
      message="Congratulations! Your transaction has been successfully completed."
      btnLabel="Done"
      onContinue={() => router.dismissAll()}
    />
  );
};

export default PaymentSuccess;
