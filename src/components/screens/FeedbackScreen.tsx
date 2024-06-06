import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Box,
  Button,
  ButtonText,
  CheckCircleIcon,
  CloseCircleIcon,
  Divider,
  Heading,
  Icon,
  Text,
  VStack,
} from '@gluestack-ui/themed';

type Props = {
  title: string;
  message: string;
  action?: 'success' | 'error';
  btnLabel?: string;
  onContinue: () => void;
};

export const FeedbackScreen = ({ title, message, action = 'success', btnLabel = 'Continue', onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const renderIcon = () => {
    if (action === 'error') {
      return <Icon as={CloseCircleIcon} color="$error500" size="3xl" testID="error-icon" />;
    }
    return <Icon as={CheckCircleIcon} color="$success500" size="3xl" testID="success-icon" />;
  };

  return (
    <Box flex={1} bg="$white" justifyContent="space-between" pt={insets.top} pb={insets.bottom}>
      <VStack px="$4" space="lg">
        {renderIcon()}
        {title && <Heading size="2xl">{title}</Heading>}
        {message && <Text size="xl">{message}</Text>}
      </VStack>

      <Box>
        <Divider />
        <Button size="lg" onPress={onContinue} m="$4" testID="action-button">
          <ButtonText>{btnLabel}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
};
