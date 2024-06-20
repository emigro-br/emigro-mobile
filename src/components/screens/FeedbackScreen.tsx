import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  CheckCircleIcon,
  ClockIcon,
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
  action?: 'success' | 'error' | 'warning' | 'waiting';
  btnLabel?: string;
  onContinue: () => void;
};

export const FeedbackScreen = ({ title, message, action = 'success', btnLabel = 'Continue', onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  const renderIcon = () => {
    let iconProps = { as: CheckCircleIcon, color: '$success500' };
    if (action === 'error') {
      iconProps = { as: CloseCircleIcon, color: '$error500' };
    } else if (action === 'warning') {
      iconProps = { as: AlertCircleIcon, color: '$warning500' };
    } else if (action === 'waiting') {
      iconProps = { as: ClockIcon, color: '$warning500' };
    }
    return <Icon {...iconProps} size="3xl" testID={`${action}-icon`} />;
  };

  return (
    <Box flex={1} bg="$white" justifyContent="space-between" pt={insets.top} pb={insets.bottom}>
      <VStack px="$4" space="lg">
        {renderIcon()}
        {title && (
          <Heading size="2xl" testID="feedback-title">
            {title}
          </Heading>
        )}
        {message && (
          <Text size="xl" testID="feedback-message">
            {message}
          </Text>
        )}
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
