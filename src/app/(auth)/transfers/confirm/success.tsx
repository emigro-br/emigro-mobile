import { useRouter } from 'expo-router';

import { FeedbackScreen } from '@/screens/FeedbackScreen';

const TransferSuccess = () => {
  const router = useRouter();
  return (
    <FeedbackScreen
      action="success"
      title="Transaction Successful"
      message="Congratulations! Your transfer has been successfully completed."
      btnLabel="Done"
      onContinue={() => router.dismissAll()}
    />
  );
};

export default TransferSuccess;
