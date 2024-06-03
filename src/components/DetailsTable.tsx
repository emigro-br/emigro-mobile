import { Card, HStack, Text, VStack } from '@gluestack-ui/themed';

export type RowItem = {
  label: string;
  value: string | number;
};

type Props = {
  rows: RowItem[];
};

export const DetailsTable = ({ rows }: Props) => (
  <Card variant="flat">
    <VStack space="lg">
      {rows.map((row, index) => (
        <Row key={index} {...row} />
      ))}
    </VStack>
  </Card>
);

type RowProps = {
  label: string;
  value: string | number;
};

const Row = ({ label, value }: RowProps) => (
  <HStack justifyContent="space-between" testID="row">
    <Text size="sm" color="gray">
      {label}
    </Text>
    <Text color="$textLight900">{value}</Text>
  </HStack>
);
