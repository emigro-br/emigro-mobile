import { useState } from 'react';

import { Box, Button, ButtonSpinner, ButtonText, Card, Heading, VStack, useToast } from '@gluestack-ui/themed';

import { AssetListTile } from '@/components/AssetListTile';
import { Toast } from '@/components/Toast';
import { addAssetToWallet } from '@/services/emigro/users';
import { balanceStore } from '@/stores/BalanceStore';
import { CryptoAsset, cryptoAssets } from '@/types/assets';

export const ManageAccountsScreen = () => {
  const toast = useToast();
  const allAssets = cryptoAssets();
  const currentAccounts = allAssets.filter((asset) => balanceStore.find(asset));
  const missingAccounts = allAssets.filter((asset) => !balanceStore.find(asset));
  const allAccounts = currentAccounts.concat(missingAccounts); // current accounts first

  const handleAddAccount = async (asset: CryptoAsset) => {
    try {
      await addAssetToWallet(asset);
      await balanceStore.fetchUserBalance();
      toast.show({
        render: ({ id }) => (
          <Toast
            id={id}
            title="Congrats, new asset added!"
            description={`${asset} added to your wallet`}
            action="success"
          />
        ),
      });
    } catch (error) {
      let message = 'Could not add the asset to your wallet, please try again later.';
      if (error instanceof Error) {
        message = error.message;
      }
      toast.show({
        duration: 10000,
        render: ({ id }) => <Toast id={id} title="Failed to add new asset" description={message} action="error" />,
      });
    }
  };

  return <ManageAccounts accounts={allAccounts} onAdd={handleAddAccount} onHide={async () => {}} />;
};

type Props = {
  accounts: CryptoAsset[];
  onAdd: (asset: CryptoAsset) => Promise<void>;
  onHide: (asset: CryptoAsset) => Promise<void>;
};

export const ManageAccounts = ({ accounts, onAdd, onHide }: Props) => {
  const [processing, setProcessing] = useState<CryptoAsset | null>(null);

  const handlePress = async (asset: CryptoAsset) => {
    try {
      setProcessing(asset);
      const fn = balanceStore.find(asset) ? onHide : onAdd;
      await fn(asset);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Box>
      <VStack p="$4" space="lg">
        <Heading size="xl">Accounts</Heading>
        <Card variant="flat">
          <VStack space="2xl">
            {accounts.map((asset, index) => (
              <AssetListTile
                key={index}
                testID="account-tile"
                asset={asset}
                subasset={asset}
                trailing={
                  <ActionButton
                    action={balanceStore.find(asset) ? 'hide' : 'add'}
                    onPress={() => handlePress(asset)}
                    isLoading={processing === asset}
                  />
                }
              />
            ))}
          </VStack>
        </Card>
      </VStack>
    </Box>
  );
};

type ButtonProps = {
  action?: 'add' | 'hide';
  isLoading?: boolean;
  onPress: () => void;
};

const ActionButton = ({ action = 'add', isLoading = false, onPress }: ButtonProps) => {
  if (action === 'hide') return null; // TODO: hide button not implemented yet
  return (
    <Button variant="link" onPress={onPress} isDisabled={isLoading} action={action === 'add' ? 'primary' : 'secondary'}>
      {isLoading ? <ButtonSpinner /> : <ButtonText>{action === 'add' ? 'add' : 'hide'}</ButtonText>}
    </Button>
  );
};
