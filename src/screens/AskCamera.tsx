import { Text, View } from 'react-native';
import { CameraIcon, QrCodeIcon } from 'react-native-heroicons/solid';

import { PermissionResponse, useCameraPermissions } from 'expo-camera/next';
import { styled } from 'nativewind';

import Button from '@components/Button';

const StyledView = styled(View);
const StyledText = styled(Text);

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
    <StyledView className="flex items-center bg-white h-full">
      <StyledView className="pt-12 pb-6" testID="camera-icon">
        <CameraIcon size={128} color="red" />
      </StyledView>

      <StyledText className="text-xl font-bold mb-4">Enable Camera</StyledText>

      <StyledView className="px-8 mb-8">
        <StyledText className="text-lg text-gray mb-6">
          Please grant us access to your camera, which is required to:
        </StyledText>
        <StyledView className="flex-row justify-start items-center w-full">
          <QrCodeIcon size={24} color="red" />
          <StyledText className="text-gray text-lg"> scan QR codes for payments</StyledText>
        </StyledView>
      </StyledView>
      <StyledView className="w-full px-8">
        <Button backgroundColor="red" textColor="white" onPress={handleRequestPermission}>
          Continue
        </Button>
      </StyledView>
    </StyledView>
  );
};

export default AskCamera;
