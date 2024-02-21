import React from 'react';
import { Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';

import Button from '@components/Button';

const StyledView = styled(View);
const StyledText = styled(Text);

const DeleteAccount = () => {
  // const { user } = useAuth();
  // const { deleteAccount } = useAuthActions();
  const navigation = useNavigation();

  const handleDeleteAccount = async () => {
    // await deleteAccount(user!.uid);
    navigation.navigate('Welcome' as never);
  };

  return (
    <StyledView className="bg-white h-full p-4">
      <StyledText className="text-xl font-bold mb-4">Delete Account</StyledText>
      <StyledView className="gap-4 mb-8">
        <StyledText>Please be aware that this action is final and cannot be reversed.</StyledText>
        <StyledText>
          By proceeding with the deletion of your Emigro account, you will permanently remove all your data from Emigro
          systems. This includes your personal profile, app settings, user history, and any associated data.
        </StyledText>
        <StyledText>
          Once your account is deleted, you will not be able to access any Emigro services, retrieve your data, or
          restore your account. If you have any subscriptions or ongoing services, they will be immediately canceled.
        </StyledText>
        <StyledText>
          If you have any remaining balance or credits within Emigro, please ensure to redeem or transfer them before
          account deletion as they will not be recoverable afterward.
        </StyledText>
        <StyledText>
          We strongly advise you to backup any important data or transfer any assets before you finalize the deletion of
          your account.
        </StyledText>
      </StyledView>
      <Button backgroundColor="red" textColor="white" onPress={handleDeleteAccount}>
        Yes, delete my account permanently
      </Button>
      <Button backgroundColor="white" textColor="red" onPress={() => navigation.goBack()}>
        No, keep my account
      </Button>
    </StyledView>
  );
};

export default DeleteAccount;
