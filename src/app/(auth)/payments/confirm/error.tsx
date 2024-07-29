import { useLocalSearchParams, useRouter } from 'expo-router';

import { FeedbackScreen } from '@/components/screens/FeedbackScreen';

const PaymentError = () => {
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error: string }>();
  return (
    <FeedbackScreen
      action="error"
      title="Transaction Failed"
      message={`Unfortunately, we couldn't complete your transaction. Here's what went wrong: ${error}`}
      btnLabel="Understood"
      onContinue={() => router.dismiss()}
    />
  );
};

export default PaymentError;
