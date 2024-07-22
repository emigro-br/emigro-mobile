import { Spinner } from "@/components/ui/spinner";
import { Center } from "@/components/ui/center";
import { Box } from "@/components/ui/box";

export const LoadingScreen = () => {
  return (
    <Box testID="loading-screen" className="flex-1 justify-center">
      <Center>
        <Spinner size="large" testID="loading-spinner" />
      </Center>
    </Box>
  );
};
