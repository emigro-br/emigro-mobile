import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonGroup,
  ButtonText,
  CheckIcon,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Heading,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { deleteAccount } from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

const DeleteAccount = ({ navigation }: Props) => {
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await sessionStore.clear();
    } catch (error) {
      console.error(error);
      //TODO: missing feedback to the user
    }
  };

  return (
    <ScrollView>
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
              mt="$2"
              value="checked"
              isChecked={isChecked}
              onChange={setIsChecked}
              aria-label="Confirm understanding of account deletion risks"
              testID="checkbox"
            >
              <CheckboxIndicator mr="$2">
                <CheckboxIcon as={CheckIcon} />
              </CheckboxIndicator>
              <CheckboxLabel>
                I have read and understand the risks associated with deleting my account permanently.
              </CheckboxLabel>
            </Checkbox>
          </VStack>
          <ButtonGroup flexDirection="column">
            <Button variant="solid" onPress={handleDeleteAccount} isDisabled={!isChecked}>
              <ButtonText>Yes, delete my account permanently</ButtonText>
            </Button>
            <Button variant="link" onPress={() => navigation.popToTop()}>
              <ButtonText>No, keep my account</ButtonText>
            </Button>
          </ButtonGroup>
        </VStack>
      </Box>
    </ScrollView>
  );
};

export default DeleteAccount;
