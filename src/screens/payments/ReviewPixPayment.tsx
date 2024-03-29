import { Box, Button, ButtonText, Heading, Text, VStack } from '@gluestack-ui/themed';
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

  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading>Review your Pix payment</Heading>
        <Box>
          <Text>Recipient</Text>
          <Text />
        </Box>
        <PixMandatoryElements pix={pix} />
        {pix.type === PixElementType.STATIC && <StaticPix pix={pix} />}
        <Button>
          <ButtonText>Confirm Payment</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

const PixMandatoryElements = ({ pix }) => (
  <Box>
    <Text>Category Code: {pix.merchantCategoryCode}</Text>
    <Text>Currency: {pix.transactionCurrency}</Text>
    <Text>Country Code: {pix.countryCode}</Text>
    <Text>Merchant Name: {pix.merchantName}</Text>
    <Text>Merchant City: {pix.merchantCity}</Text>
  </Box>
);

const StaticPix = ({ pix }) => (
  <Box>
    <Box>
      <Text>Value</Text>
      <Text>{pix.transactionAmount}</Text>
    </Box>
    <Text>Pix Key: {pix.pixKey}</Text>
    <Text>Tax ID: {pix.txid}</Text>
    <Text>Adicional Info: {pix.infoAdicional}</Text>
    <Text>FSS: {pix.fss}</Text>
  </Box>
);
