import { Box, Button, ButtonText, Card, Center, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import { PixElementType, hasError, parsePix } from 'pix-utils';

type Props = {
  navigation: any;
  route: any;
};

export const ReviewPixPayment = ({ route }: Props) => {
  const brCode = route.params.brCode;
  const pix = parsePix(brCode);

  // check pix is PixError
  if (hasError(pix) || pix.type === PixElementType.INVALID) {
    // Handle PixError
    // For example, display an error message
    return <Text>Error:</Text>;
  }

  // FIXME: load CPF/Institution from API using the pix key

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Review your Pix payment</Heading>
        {pix.type === PixElementType.STATIC && <StaticPix pix={pix} />}
        <Button>
          <ButtonText>Confirm Payment</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

// const PixMandatoryElements = ({ pix }) => (
//   <Box>
//     <Text bold>Mandatory</Text>
//     <Text>Category Code: {pix.merchantCategoryCode}</Text>
//     <Text>Currency: {pix.transactionCurrency}</Text>
//     <Text>Country Code: {pix.countryCode}</Text>
//     <Text>Merchant Name: {pix.merchantName}</Text>
//     <Text>Merchant City: {pix.merchantCity}</Text>
//   </Box>
// );

const StaticPix = ({ pix }) => (
  <VStack space="3xl">
    <Box>
      <Text size="4xl" bold>
        R$ {Number(pix.transactionAmount).toFixed(2)}
      </Text>
      <Text>
        for <Text bold>{pix.merchantName}</Text>
      </Text>
      <Text>in {pix.merchantCity}</Text>
    </Box>
    {pix.infoAdicional && (
      <Center>
        <Card variant="filled" bg="$backgroundLight100">
          <Text textAlign="center">{pix.infoAdicional}</Text>
        </Card>
      </Center>
    )}
    <VStack space="md">
      <HStack justifyContent="space-between">
        <Text bold>CPF/CNPJ:</Text>
        <Text>????</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Institution:</Text>
        <Text>????</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Pix Key:</Text>
        <Text>{pix.pixKey}</Text>
      </HStack>
      <HStack justifyContent="space-between">
        <Text bold>Indetifier:</Text>
        <Text>{pix.txid}</Text>
      </HStack>
    </VStack>
    {/* <Text>FSS: {pix.fss}</Text> */}
  </VStack>
);
