import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import * as Application from 'expo-application';
import { styled } from 'nativewind';

import profileLogo from '@assets/images/profile-icon.png';

import { getUserProfile } from '@services/emigro';
import { CustomError } from '@services/errors';

import { sessionStore } from '@stores/SessionStore';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const Profile = () => {
  const navigation = useNavigation();
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

  if (!userInformation) {
    return (
      <StyledView className="flex items-center justify-center h-full">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  const Divider = () => <StyledView className="border-b-[1px] border-slate-200 w-full pt-2 mb-2" />;

  return (
    <StyledScrollView className="bg-white h-full">
      <StyledView className="items-center m-6">
        <StyledImage source={profileLogo} className="h-32 w-32" />
      </StyledView>

      <StyledView className="flex gap-1 w-full px-4">
        <StyledText className="text-lightGray">Full name</StyledText>
        <StyledView className="flex flex-row items-center">
          <StyledText className="text-lg">
            {userInformation.given_name} {userInformation.family_name}
          </StyledText>
        </StyledView>

        <Divider />

        <StyledText className="text-lightGray">Email address</StyledText>
        <StyledView className="flex flex-row items-center">
          <StyledText className="text-lg">{userInformation.email}</StyledText>
        </StyledView>

        <Divider />

        <StyledText className="text-lightGray">Address</StyledText>
        <StyledView className="flex flex-row items-center">
          <StyledText className="text-lg">{userInformation.address}</StyledText>
        </StyledView>

        <Divider />

        <StyledText className="text-red text-sm py-2" onPress={() => navigation.navigate('DeleteAccount' as never)}>
          Delete account
        </StyledText>
      </StyledView>

      <StyledView className="flex items-center pt-4 mb-2">
        <StyledText className="text-red text-lg py-2" onPress={handleLogout}>
          Log out
        </StyledText>
        <StyledText className="text-lightGray text-sml">
          ver. {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
        </StyledText>
      </StyledView>
    </StyledScrollView>
  );
};

export default Profile;
