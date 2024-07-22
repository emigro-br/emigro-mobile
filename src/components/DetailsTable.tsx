import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Card } from "@/components/ui/card";

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
  <HStack testID="row" className="justify-between">
    <Text size="sm" className="text-[gray]">
      {label}
    </Text>
    <Text className="text-textLight-900">{value}</Text>
  </HStack>
);
