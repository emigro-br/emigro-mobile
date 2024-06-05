import { useRouter } from 'expo-router';

import { SuccessScreen } from '@/components/screens/SuccessScreen';

const WithdrawalSuccess = () => {
  const router = useRouter();
  return (
    <SuccessScreen
      title="Withdrawal successfully confirmed!"
      message="Please note that the funds may take some time to reflect in your account. Thank you for using our service!"
      btnLabel="Done"
      onContinue={() => router.dismiss()}
    />
  );
};

export default WithdrawalSuccess;
