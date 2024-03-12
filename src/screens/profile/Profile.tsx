import { View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Avatar,
  AvatarFallbackText,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  CopyIcon,
  Divider,
  Heading,
  Spinner,
  Text,
  Toast,
  ToastDescription,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { observer } from 'mobx-react-lite';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { sessionStore } from '@stores/SessionStore';

import { maskWallet } from '@utils/masks';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

const Profile = observer(({ navigation }: Props) => {
  const toast = useToast();

  const handleLogout = async () => {
    await sessionStore.clear();
  };

  const publicKey = sessionStore.publicKey;

  const copyToClipboard = async () => {
    if (publicKey) {
      await Clipboard.setStringAsync(publicKey);
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast${id}`} action="info" variant="solid">
            <ToastDescription>Copied to clipboard</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  const profileInfo = sessionStore.profile;
  if (!profileInfo) {
    return (
      <Center flex={1} bg="$backgroundLight0">
        <Spinner size="large" testID="loading" />
      </Center>
    );
  }

  const fullName = `${profileInfo.given_name} ${profileInfo.family_name}`;

  return (
    <Box flex={1} bg="$white" justifyContent="space-between">
      <VStack p="$4" space="lg">
        <Center>
          <Avatar bgColor="$primary300" size="xl" borderRadius="$full">
            <AvatarFallbackText>{fullName}</AvatarFallbackText>
          </Avatar>
          <Heading py="$2">{fullName}</Heading>
          {publicKey && (
            <Button size="md" variant="link" action="primary" onPress={copyToClipboard}>
              <ButtonText>{maskWallet(publicKey)}</ButtonText>
              <ButtonIcon as={CopyIcon} ml="$2" />
            </Button>
          )}
        </Center>

        <VStack space="xl">
          <View>
            <Text size="sm" color="$textLight500">
              Full Name
            </Text>
            <Text>{fullName}</Text>
          </View>

          <Divider />

          <View>
            <Text size="sm" color="$textLight500">
              Email address
            </Text>
            <Text>{profileInfo.email}</Text>
          </View>

          <Divider />

          <View>
            <Text size="sm" color="$textLight500">
              Address
            </Text>
            <Text>{profileInfo.address}</Text>
          </View>

          <Divider />

          <Button onPress={() => navigation.push('DeleteAccount')} variant="link" size="sm" alignSelf="flex-start">
            <ButtonText>Delete account</ButtonText>
          </Button>
        </VStack>
      </VStack>
      <Box alignItems="center" py="$4">
        <Button onPress={handleLogout} variant="link" size="lg">
          <ButtonText>Logout</ButtonText>
        </Button>
        <Text size="sm">
          version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
        </Text>
      </Box>
    </Box>
  );
});

export default Profile;
