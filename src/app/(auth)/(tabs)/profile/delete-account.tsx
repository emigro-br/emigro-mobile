import React, { useState } from 'react';

import { useRouter } from 'expo-router';

import { Toast } from '@/components/Toast';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { Heading } from '@/components/ui/heading';
import { CheckIcon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { deleteAccount } from '@/services/emigro/auth';
import { sessionStore } from '@/stores/SessionStore';

const DeleteAccount = () => {
  const router = useRouter();
  const toast = useToast();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await sessionStore.clear();
    } catch (error) {
      let message = 'Could not delete your account, please try again later.';
      if (error instanceof Error) {
        message = error.message;
      }
      toast.show({
        duration: 10000,
        render: ({ id }) => (
          <Toast id={id} title="Failed to delete your account" description={message} action="error" />
        ),
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView className="bg-white">
      <Box className="flex-1">
        <VStack space="lg" className="p-4">
          <Heading size="xl">Delete Account</Heading>
          <VStack space="lg">
            <Text>Please be aware that this action is final and cannot be reversed.</Text>
            <Text>
              By proceeding with the deletion of your Emigro account, you will permanently remove all your data from
              Emigro systems. This includes your personal profile, app settings, user history, and any associated data.
            </Text>
            <Text>
              <Text bold>Once your account is deleted, you will not be able to access any Emigro services</Text>,
              retrieve your data, or restore your account. If you have any subscriptions or ongoing services, they will
              be immediately canceled.
            </Text>
            <Text>
              If you have any remaining balance or credits within Emigro, please ensure to redeem or transfer them
              before account deletion as they will not be recoverable afterward.
            </Text>
            <Text>
              We strongly advise you to backup any important data or transfer any assets before you finalize the
              deletion of your account.
            </Text>

            <Checkbox
              size="md"
              value="checked"
              isChecked={isChecked}
              onChange={setIsChecked}
              aria-label="Confirm understanding of account deletion risks"
              testID="checkbox"
              className="mt-2"
            >
              <CheckboxIndicator className="mr-2">
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>
                I have read and understand the risks associated with deleting my account permanently.
              </CheckboxLabel>
            </Checkbox>
          </VStack>
          <ButtonGroup flexDirection="column">
            <Button variant="solid" onPress={() => handleDeleteAccount()} disabled={!isChecked || isDeleting}>
              <ButtonText>Yes, delete my account permanently</ButtonText>
            </Button>
            <Button variant="link" onPress={() => router.back()} disabled={isDeleting}>
              <ButtonText>No, keep my account</ButtonText>
            </Button>
          </ButtonGroup>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default DeleteAccount;
