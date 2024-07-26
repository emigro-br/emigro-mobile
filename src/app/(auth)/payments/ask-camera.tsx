import { CameraIcon, QrCodeIcon } from 'react-native-heroicons/solid';

import { PermissionResponse, useCameraPermissions } from 'expo-camera';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

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
    <Box className="flex-1">
      <VStack space="xl" className="items-center">
        <Box testID="camera-icon" className="pt-12 pb-6">
          <CameraIcon size={128} color="red" />
        </Box>

        <Heading>Enable Camera</Heading>

        <VStack space="md">
          <Text size="xl">Please grant us access to your camera, which is required to:</Text>
          <HStack className="justify-start items-center">
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
