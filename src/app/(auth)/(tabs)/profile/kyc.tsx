import React, { useState, useEffect } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
// import { Inquiry, Environment } from 'react-native-persona';
import { Box } from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { LoadingScreen } from '@/screens/Loading';
import { sessionStore } from '@/stores/SessionStore';
import { checkKycStatus } from '@/services/emigro/users';

const KYC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [kycVerified, setKycVerified] = useState(false);

  const userId = sessionStore.user?.id;
  const profileInfo = sessionStore.profile;
  // const templateId = 'itmpl_W95pFhY98pXXZsRPH8vjrHz7kN2d';

  // Check KYC status on component mount
  useEffect(() => {
    const verifyKYCStatus = async () => {
      if (userId) {
        try {
          const { kycVerified } = await checkKycStatus(userId);
          setKycVerified(kycVerified);
          if (kycVerified) {
            sessionStore.setProfile({ ...profileInfo, kycStatus: 1 });
          }
        } catch (error) {
          console.error('Error checking KYC status:', error);
          Alert.alert('Error', 'Failed to verify KYC status. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };
    verifyKYCStatus();
  }, [userId]);

  // const handleStartKYC = () => {
  //   Inquiry.fromTemplate(templateId)
  //     .environment(Environment.SANDBOX)
  //     .referenceId(userId)
  //     .onComplete((inquiryId, status, fields) => {
  //       console.log('KYC Completed:', inquiryId, status, fields);
  //       if (status === 'complete') {
  //         Alert.alert('Success', 'KYC process completed successfully.');
  //         setKycVerified(true);
  //         sessionStore.setProfile({ ...profileInfo, kycStatus: 1 });
  //         router.replace('/');
  //       } else {
  //         console.log('KYC Status:', status);
  //       }
  //     })
  //     .onCanceled(() => {
  //       console.log('KYC process canceled by the user.');
  //     })
  //     .onError((error) => {
  //       console.error('KYC Error:', error);
  //       Alert.alert('Error', 'An error occurred during the KYC process.');
  //     })
  //     .build()
  //     .start();
  // };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box style={styles.container}>
        <VStack space="lg" className="p-4">
          <View>
            <Text style={styles.title}>KYC Verification</Text>
            <Text style={styles.description}>
              {kycVerified
                ? 'Your KYC verification is complete.'
                : 'Please click the button below to start the KYC process. Your verification will be securely handled by Persona.'}
            </Text>
          </View>

          <Divider />

          <View style={styles.buttonContainer}>
            {!kycVerified ? (
              // <Button onPress={handleStartKYC} style={styles.startButton}>
              //   <Text style={styles.buttonText}>Start KYC</Text>
              // </Button>
              <Button disabled style={styles.startButton}>
                <Text style={styles.buttonText}>Start KYC (Disabled)</Text>
              </Button>
            ) : (
              <Button disabled style={styles.completedButton}>
                <Text style={styles.buttonText}>KYC Completed</Text>
              </Button>
            )}
          </View>
        </VStack>
      </Box>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
  },
  buttonContainer: {
    paddingTop: 16,
  },
  startButton: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  completedButton: {
    backgroundColor: 'gray',
    borderColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default KYC;
