import { View } from "@/components/ui/view";
import { Heading } from "@/components/ui/heading";
import { CloseIcon, Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";

type Props = {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
  testID?: string;
};
export const SuccessDialog = ({ isOpen, title, children, onClose, testID = 'success-dialog' }: Props) => {
  return (
    <View testID={testID}>
      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg">{title}</Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>{children}</AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="outline" size="sm" action="secondary" onPress={onClose} className="mr-3">
              <ButtonText>Okay</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};
