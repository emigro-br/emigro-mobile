import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  ButtonText,
  Heading,
  Text,
} from '@gluestack-ui/themed';

type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
};
export const ErrorDialog = ({ isOpen, onClose, errorMessage }: DialogProps) => {
  return (
    <AlertDialog isOpen={isOpen} onClose={onClose}>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="lg">Transaction Failed!</Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="sm">
            Failed message: <Text>{errorMessage}</Text>
          </Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button variant="outline" size="sm" action="secondary" mr="$3" onPress={onClose}>
            <ButtonText>Close</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
