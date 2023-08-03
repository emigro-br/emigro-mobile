import AsyncStorage from '@react-native-async-storage/async-storage';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import profileLogo from '@assets/images/profile-icon.png';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

const Profile = () => {
  const [userInformation, setUserInformation] = useState<any>(null);

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const userInformationString = await AsyncStorage.getItem('userInformation');
        if (userInformationString) {
          const userInformationObject = JSON.parse(userInformationString);
          setUserInformation(userInformationObject);
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
    <StyledView className="flex items-center p-8 bg-white h-full">
      <StyledView className="mb-10">
        <StyledImage source={profileLogo} className="h-32 w-32" />
      </StyledView>
      <StyledView className="flex gap-2 w-full">
        <StyledText className="text-lightGray">Username</StyledText>
        <StyledView className="flex flex-row items-center mb-2">
          <StyledText className="font-black">
            {userInformation.given_name} {userInformation.family_name}
          </StyledText>
        </StyledView>
        <StyledView className="border-b-[2px] border-lightGray w-full" />
        <StyledText className="text-lightGray">Address</StyledText>
        <StyledView className="flex flex-row items-center mb-2">
          <StyledText className="font-black">{userInformation.address}</StyledText>
        </StyledView>
        <StyledView className="border-b-[2px] border-lightGray w-full" />
        <StyledText className="text-lightGray">Email</StyledText>
        <StyledView className="flex flex-row items-center mb-2">
          <StyledText className="font-black">{userInformation.email}</StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

export default Profile;
