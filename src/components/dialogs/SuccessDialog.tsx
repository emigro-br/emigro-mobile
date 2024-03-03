import { Linking } from 'react-native';

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  ButtonText,
  CloseIcon,
  Heading,
  Icon,
  Text,
} from '@gluestack-ui/themed';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  publicKey: string;
};
export const SuccessDialog = ({ isOpen, onClose, onConfirm, publicKey }: DialogProps) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="lg">Transaction successful!</Heading>
          <AlertDialogCloseButton>
            <Icon as={CloseIcon} />
          </AlertDialogCloseButton>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="sm">
            You can check the status of your transaction in the{' '}
            <Text
              style={{ color: '#1D4ED8' }}
              onPress={() => Linking.openURL(`https://stellar.expert/explorer/public/account/${publicKey}`)}
            >
              Stellar explorer
            </Text>
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button variant="outline" size="sm" action="secondary" mr="$3" onPress={onConfirm ?? onClose}>
            <ButtonText>Okay</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
