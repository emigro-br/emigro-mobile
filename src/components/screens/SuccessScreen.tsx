import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Button, ButtonText, CheckCircleIcon, Divider, Heading, Icon, Text, VStack } from '@gluestack-ui/themed';

type Props = {
  title: string;
  message: string;
  btnLabel?: string;
  onContinue: () => void;
};

export const SuccessScreen = ({ title, message, btnLabel = 'Continue', onContinue }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <Box flex={1} bg="$white" justifyContent="space-between" pt={insets.top} pb={insets.bottom}>
      <VStack px="$4" space="lg">
        <Icon as={CheckCircleIcon} color="$success500" size="3xl" />
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
