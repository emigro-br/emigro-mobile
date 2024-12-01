import { Inquiry, Environment } from 'react-native-persona';
import { Button, Text, View } from 'react-native';

const KYC = ({ navigation }) => {
  const handleVerifyIdentity = () => {
    Inquiry.fromTemplate('itmpl_W95pFhY98pXXZsRPH8vjrHz7kN2d')
      .environment(Environment.SANDBOX)
      .onComplete((inquiryId, status) => {
        console.log(`KYC Completed with status: ${status}`);
        navigation.goBack(); // Return to Profile after completion
      })
      .onCanceled(() => {
        console.log('KYC process cancelled');
      })
      .onError((error) => {
        console.error('KYC Error:', error);
      })
      .build()
      .start();
  };

  return (
    <View>
      <Text>Verify your identity</Text>
      <Button title="Start Verification" onPress={handleVerifyIdentity} />
    </View>
  );
};

export default KYC;
