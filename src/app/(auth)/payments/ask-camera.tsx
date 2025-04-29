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
    <Box className="flex-1 bg-[#0a0a0a]">
      <VStack space="xl" className="p-4 items-center justify-center flex-1">
        <Box testID="camera-icon" className="pt-12 pb-6">
          <CameraIcon size={128} color="#ef4444" /> {/* Red color same as previous buttons */}
        </Box>

        <Heading className="text-white text-center">Enable Camera</Heading>

        <VStack space="md" className="items-center">
          <Text size="xl" className="text-gray-400 text-center">
            Please grant us access to your camera, which is required to:
          </Text>
          <HStack className="justify-center items-center space-x-2">
            <QrCodeIcon size={24} color="#ef4444" />
            <Text size="lg" className="text-white">
              scan QR codes for payments
            </Text>
          </HStack>
        </VStack>

        <Button onPress={handleRequestPermission} size="xl" className="mt-8 rounded-full" style={{ height: 56 }}>
          <ButtonText className="text-lg text-white">Continue</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default AskCamera;
