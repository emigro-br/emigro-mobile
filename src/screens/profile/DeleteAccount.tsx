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
    <StyledView>
      <StyledText className="">Delete Account</StyledText>
      <StyledText>
        Please be aware that this action is final and cannot be reversed. By proceeding with the deletion of your XXX
        account, you will permanently remove all your data from XXX systems. This includes your personal profile, app
        settings, user history, and any associated data. Once your account is deleted, you will not be able to access
        any XXX services, retrieve your data, or restore your account. If you have any subscriptions or ongoing
        services, they will be immediately canceled. If you have any remaining balance or credits within XXX, please
        ensure to redeem or transfer them before account deletion as they will not be recoverable afterward. We strongly
        advise you to backup any important data or transfer any assets before you finalize the deletion of your account.
      </StyledText>
      <Button onPress={handleDeleteAccount}>Confirm</Button>
    </StyledView>
  );
};

export default DeleteAccount;
