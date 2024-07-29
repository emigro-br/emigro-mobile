import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

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
          <Button variant="outline" size="sm" action="secondary" onPress={onClose} className="mr-3">
            <ButtonText>Close</ButtonText>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
