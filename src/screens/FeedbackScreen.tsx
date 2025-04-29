import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { AlertCircleIcon, CheckCircleIcon, ClockIcon, CloseCircleIcon, Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type Props = {
  title: string;
  message: string;
  action?: 'success' | 'error' | 'warning' | 'waiting';
  btnLabel?: string;
  onContinue: () => void;
};

export const FeedbackScreen = ({
  title,
  message,
  action = 'success',
  btnLabel = 'Continue',
  onContinue,
}: Props) => {
  const insets = useSafeAreaInsets();

  const renderIcon = () => {
    let iconProps = { as: CheckCircleIcon, className: 'text-success-500' };
    if (action === 'error') {
      iconProps = { as: CloseCircleIcon, className: 'text-error-500' };
    } else if (action === 'warning') {
      iconProps = { as: AlertCircleIcon, className: 'text-warning-500' };
    } else if (action === 'waiting') {
      iconProps = { as: ClockIcon, className: 'text-warning-500' };
    }
    return <Icon {...iconProps} size="3xl" testID={`${action}-icon`} />;
  };

  return (
    <Box
      className="flex-1 bg-[#0a0a0a] justify-center"
      style={{
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}
    >
      <VStack space="lg" className="px-6 items-center">
        {renderIcon()}
        {title && (
          <Heading size="2xl" className="text-white text-center" testID="feedback-title">
            {title}
          </Heading>
        )}
        {message && (
          <Text size="xl" className="text-gray-400 text-center" testID="feedback-message">
            {message}
          </Text>
        )}
      </VStack>
      <Box className="mt-10 px-4">
        <Divider className="bg-gray-800" />
        <Button size="lg" onPress={onContinue} testID="action-button" className="mt-6 rounded-full">
          <ButtonText className="text-lg text-white">{btnLabel}</ButtonText>
        </Button>
      </Box>
    </Box>
  );
};
