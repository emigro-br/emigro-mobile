import { Box, Heading, Input, VStack } from '@gluestack-ui/themed';

export const RequestPayment = () => {
  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading>How much you will request?</Heading>
        <Input />
      </VStack>
    </Box>
  );
};
