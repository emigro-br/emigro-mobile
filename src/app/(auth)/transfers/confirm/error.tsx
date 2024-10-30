import { useLocalSearchParams, useRouter } from 'expo-router';

import { FeedbackScreen } from '@/screens/FeedbackScreen';

const PaymentError = () => {
  const router = useRouter();
  const { error } = useLocalSearchParams<{ error: string }>();
  return (
    <FeedbackScreen
      action="error"
      title="Transaction Failed"
      message={`Unfortunately, we couldn't complete your transfer. Here's what went wrong: ${error}`}
      btnLabel="Understood"
      onContinue={() => router.dismissAll()}
    />
  );
};

export default PaymentError;
