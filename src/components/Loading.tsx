import { Box, Center, Spinner } from '@gluestack-ui/themed';

export const LoadingScreen = () => {
  return (
    <Box flex={1} justifyContent="center">
      <Center>
        <Spinner size="large" testID="loading-spinner" />
      </Center>
    </Box>
  );
};
