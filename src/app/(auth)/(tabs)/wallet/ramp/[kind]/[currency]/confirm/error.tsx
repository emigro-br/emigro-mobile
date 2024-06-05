import { useRouter } from 'expo-router';

import { FeedbackScreen } from '@/components/screens/FeedbackScreen';

const WithdrawalSuccess = () => {
  const router = useRouter();
  return (
    <FeedbackScreen
      action="error"
      title="Failed to confirm transaction"
      message="Please try again later. If you're facing this issue repeatedly, contact us at support@emigro.com"
      btnLabel="Got it"
      onContinue={() => router.dismiss()}
    />
  );
};

export default WithdrawalSuccess;
