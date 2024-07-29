import { useRouter } from 'expo-router';

import { FeedbackScreen } from '@/components/screens/FeedbackScreen';

const PaymentWaiting = () => {
  const router = useRouter();
  return (
    <FeedbackScreen
      action="waiting"
      title="Processing Transaction"
      message="We're currently processing your transaction. This might take a few minutes. Please ensure you have sufficient balance and try again if necessary."
      btnLabel="Understood"
      onContinue={() => router.dismissAll()}
    />
  );
};

export default PaymentWaiting;
