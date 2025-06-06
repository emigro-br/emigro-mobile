import React from 'react';

import { usePathname, useRouter } from 'expo-router';

import { ListTile } from '@/components/ListTile';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { ArrowRightIcon, ArrowUpIcon, ClockIcon, Icon, SlashIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Sep24Transaction, Sep24TransactionStatus } from '@/services/emigro/types';
import { CryptoAsset } from '@/types/assets';
import { labelFor, symbolFor } from '@/utils/assets';

type Props = {
  asset: CryptoAsset; // TODO: asset or fiat?
  transactions: Sep24Transaction[];
};

export const Sep24TransactionHistory = ({ asset, transactions }: Props) => {
  if (transactions && transactions.length === 0) {
    return null;
  }

  return (
    <Box>
      <Heading className="mb-4">History</Heading>
      <VStack space="lg">
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <TransactionItem transaction={transaction} asset={asset} />
            {index < transactions.length - 1 && <Divider className="my-4" />}
          </React.Fragment>
        ))}
      </VStack>
    </Box>
  );
};

const Pending = ({ label = 'Pending' }: { label?: string }) => (
  <Badge variant="solid" action="warning">
    <BadgeText style={{ textTransform: 'none' }}>{label}</BadgeText>
  </Badge>
);

const Completed = () => (
  <Badge variant="solid" action="success">
    <BadgeText style={{ textTransform: 'none' }}>Completed</BadgeText>
  </Badge>
);

const Incompleted = () => (
  <Badge variant="solid" action="error">
    <BadgeText style={{ textTransform: 'none' }}>Canceled - Transaction abandoned</BadgeText>
  </Badge>
);

const Error = () => (
  <Badge variant="solid" action="error">
    <BadgeText style={{ textTransform: 'none' }}>Error</BadgeText>
  </Badge>
);

const statusBadge = (status: Sep24TransactionStatus) => {
  switch (status) {
    case 'incomplete':
      return <Incompleted />;
    case 'error':
      return <Error />;
    case 'completed':
      return <Completed />;
    case 'pending_anchor':
      return <Pending label="Pending the anchor" />;
    case 'pending_user_transfer_start':
      return <Pending label="Anchor waiting your transfer" />;
    case 'pending_external':
      return <Pending label="Waiting bank transfer" />;
    case 'pending_user':
      return <Pending label="Pending - required more user information" />;
  }
};

const statusIcon = (status: Sep24TransactionStatus) => {
  const props = {
    size: 'md',
    className: 'text-typography-800', // TODO: use theme
  };
  switch (status) {
    case 'error':
    case 'incomplete':
      return <Icon as={SlashIcon} testID="icon-incomplete" {...props} />;
    case 'completed':
      return <Icon as={ArrowUpIcon} testID="icon-complete" {...props} />;
    case 'pending_external':
    case 'pending_user_transfer_start':
    default:
      props.className = 'text-warning-500';
      return <Icon as={ClockIcon} testID="icon-pending" {...props} />;
  }
};

const TransactionDate = ({ date }: { date: string }) => {
  const dateObj = new Date(date);
  const today = new Date();
  let dateStr;

  if (dateObj.toDateString() === today.toDateString()) {
    dateStr = `Today at ${dateObj.getHours()}:${('0' + dateObj.getMinutes()).slice(-2)}`;
  } else {
    dateStr = dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
  }

  return (
    <Text size="sm" className="text-typography-500">
      {dateStr}
    </Text>
  );
};

const TransactionItem = ({ transaction, asset }: { transaction: Sep24Transaction; asset: CryptoAsset }) => {
  const router = useRouter();
  const path = usePathname(); // workaround for nested routes
  const { status } = transaction;

  const strikeIt = status === Sep24TransactionStatus.INCOMPLETE || status === Sep24TransactionStatus.ERROR;
  const title = (
    <Text strikeThrough={strikeIt} className="text-typography-950 font-medium">
      {labelFor(asset) as string}
    </Text>
  );

  const trailing = (date: string, amount: string) => {
    return (
      <VStack space="xs" testID="transaction-item" className="h-full items-end">
        <TransactionDate date={date} />
        {amount && <Text className="font-medium">{symbolFor(asset, Number(amount))}</Text>}
      </VStack>
    );
  };

  return (
    <>
      <ListTile
        title={title}
        leading={statusIcon(status)}
        subtitle={statusBadge(status)}
        trailing={trailing(transaction.started_at, transaction.amount_in)}
      />
      {transaction.kind === 'withdrawal' && status === Sep24TransactionStatus.PENDING_USER_TRANSFER_START && (
        <Button
          variant="link"
          onPress={() =>
            router.push({
              pathname: `${path}/confirm`,
              params: {
                asset,
                id: transaction.id,
              },
            })
          }
          className="ml-8 my--4 self-start"
        >
          <ButtonText>Confirm payment</ButtonText>
          <ButtonIcon as={ArrowRightIcon} size="sm" className="ml-1" />
        </Button>
      )}
    </>
  );
};
