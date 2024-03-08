import React, { useState } from 'react';
import { View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
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

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { getUserProfile } from '@services/emigro';
import { CustomError } from '@services/errors';

import { sessionStore } from '@stores/SessionStore';

import { maskWallet } from '@utils/masks';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

const Profile = ({ navigation }: Props) => {
  const toast = useToast();
  const [userInformation, setUserInformation] = useState<any>(null);

  const handleLogout = async () => {
    await sessionStore.clear();
  };

  const fetchUserInformation = async () => {
    try {
      console.debug('fetching user information');
      const userProfile = await getUserProfile(sessionStore.session!);
      if (userProfile) {
        setUserInformation(userProfile);
      }
    } catch (error) {
      console.warn('Can not load the profile', error);
      if (error instanceof CustomError) {
        if (['UnauthorizedException', 'BadRequestException'].includes(error.name)) {
          handleLogout();
        }
      }
    }
  };

  useFocusEffect(() => {
    if (!userInformation) {
      fetchUserInformation();
    }
  });

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

  if (!userInformation) {
    return (
      <Center flex={1} bg="$backgroundLight0">
        <Spinner size="large" testID="loading" />
      </Center>
    );
  }

  const fullName = `${userInformation.given_name} ${userInformation.family_name}`;

  return (
    <Box flex={1} bg="$white" justifyContent="space-between">
      <VStack p="$4" space="lg">
        <Center>
          <Avatar bgColor="$amber600" size="xl" borderRadius="$full">
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
            <Text>{userInformation.email}</Text>
          </View>

          <Divider />

          <View>
            <Text size="sm" color="$textLight500">
              Address
            </Text>
            <Text>{userInformation.address}</Text>
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
};

export default Profile;
