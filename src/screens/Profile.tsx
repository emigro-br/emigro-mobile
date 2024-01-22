import { styled } from 'nativewind';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, View } from 'react-native';
import * as Application from 'expo-application';
import { clearSession } from '@/storage/helpers';

import { getUserProfile } from '@/services/emigro';

import profileLogo from '@assets/images/profile-icon.png';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const Profile = () => {
  const navigation = useNavigation();
  const [userInformation, setUserInformation] = useState<any>(null);

  const handleLogout = async () => {
    await clearSession();
    navigation.navigate('Welcome' as never);
  };


  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setUserInformation(userProfile);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserInformation();
  }, []);

  if (!userInformation) {
    return (
      <StyledView className="flex items-center justify-center h-full">
        <ActivityIndicator size="large" />
      </StyledView>
    );
  }

  return (
    <StyledScrollView>
      <StyledView className="flex items-center pt-8 px-4 bg-white h-full">
        <StyledView className="mb-8">
          <StyledImage source={profileLogo} className="h-32 w-32" />
        </StyledView>

        <StyledView className="flex gap-2 w-full">
          <StyledText className="text-lightGray">Full name</StyledText>
          <StyledView className="flex flex-row items-center">
            <StyledText className="text-lg">
              {userInformation.given_name} {userInformation.family_name}
            </StyledText>
          </StyledView>

          <StyledView className="border-b-[1px] border-slate-200 w-full pt-4 mb-4" />

          <StyledText className="text-lightGray">Email address</StyledText>
          <StyledView className="flex flex-row items-center">
            <StyledText className="text-lg">{userInformation.email}</StyledText>
          </StyledView>

          <StyledView className="border-b-[1px] border-slate-200 w-full pt-4 mb-4" />

          <StyledText className="text-lightGray">Address</StyledText>
          <StyledView className="flex flex-row items-center">
            <StyledText className="text-lg">{userInformation.address}</StyledText>
          </StyledView>

        </StyledView>

        
        <StyledView className="flex items-center pt-8 mb-2">
          <StyledText className="text-red text-lg py-2" onPress={handleLogout}>
            Log out
          </StyledText>
          <StyledText className="text-lightGray">ver. {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})</StyledText>
        </StyledView>

      </StyledView>
    </StyledScrollView>
  );
};

export default Profile;
