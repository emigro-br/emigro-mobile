import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { Box, Button, ButtonGroup, ButtonText, Heading, Text, VStack } from '@gluestack-ui/themed';

import { deleteAccount } from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

const DeleteAccount = () => {
  const navigation = useNavigation();

  const handleDeleteAccount = async () => {
    const session = sessionStore.session;
    if (!session) {
      navigation.navigate('Welcome' as never);
      return;
    }
    try {
      await deleteAccount(session);
      sessionStore.clear();
      navigation.navigate('Welcome' as never);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading size="xl">Delete Account</Heading>
        <VStack space="lg">
          <Text>Please be aware that this action is final and cannot be reversed.</Text>
          <Text>
            By proceeding with the deletion of your Emigro account, you will permanently remove all your data from
            Emigro systems. This includes your personal profile, app settings, user history, and any associated data.
          </Text>
          <Text>
            <Text bold>Once your account is deleted, you will not be able to access any Emigro services</Text>, retrieve
            your data, or restore your account. If you have any subscriptions or ongoing services, they will be
            immediately canceled.
          </Text>
          <Text>
            If you have any remaining balance or credits within Emigro, please ensure to redeem or transfer them before
            account deletion as they will not be recoverable afterward.
          </Text>
          <Text>
            We strongly advise you to backup any important data or transfer any assets before you finalize the deletion
            of your account.
          </Text>
        </VStack>
        <ButtonGroup flexDirection="column">
          <Button variant="solid" onPress={handleDeleteAccount}>
            <ButtonText>Yes, delete my account permanently</ButtonText>
          </Button>
          <Button variant="link" onPress={() => navigation.goBack()}>
            <ButtonText>No, keep my account</ButtonText>
          </Button>
        </ButtonGroup>
      </VStack>
    </Box>
  );
};

export default DeleteAccount;
