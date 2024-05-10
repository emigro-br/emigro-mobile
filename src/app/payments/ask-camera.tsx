import { CameraIcon, QrCodeIcon } from 'react-native-heroicons/solid';

import { Box, Button, ButtonText, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { PermissionResponse, useCameraPermissions } from 'expo-camera';

type AskCameraProps = {
  onAnswer: (permission: PermissionResponse) => void;
};

const AskCamera = ({ onAnswer }: AskCameraProps) => {
  const [, requestPermission] = useCameraPermissions();

  const handleRequestPermission = async () => {
    const permission = await requestPermission();
    onAnswer(permission);
  };

  return (
    <Box flex={1}>
      <VStack alignItems="center" space="xl">
        <Box pt="$12" pb="$6" testID="camera-icon">
          <CameraIcon size={128} color="red" />
        </Box>

        <Heading>Enable Camera</Heading>

        <VStack space="md">
          <Text size="xl">Please grant us access to your camera, which is required to:</Text>
          <HStack justifyContent="flex-start" alignItems="center">
            <QrCodeIcon size={24} color="red" />
            <Text size="lg"> scan QR codes for payments</Text>
          </HStack>
        </VStack>

        <Button onPress={handleRequestPermission} size="xl">
          <ButtonText>Continue</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default AskCamera;
