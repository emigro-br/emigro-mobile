import { Toast as GToast, ToastDescription, ToastTitle } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';

type Props = {
  id: string;
  title: string;
  description: string;
  action: 'error' | 'warning' | 'success' | 'info' | 'muted'; // TODO: Add 'attention' to the union
};

export const Toast = ({ id, title, description, action }: Props) => {
  return (
    <GToast nativeID={`toast-${id}`} action={action} variant="accent" testID={`toast-${id}`}>
      <VStack space="xs">
        <ToastTitle>{title}</ToastTitle>
        <ToastDescription>{description}</ToastDescription>
      </VStack>
    </GToast>
  );
};
