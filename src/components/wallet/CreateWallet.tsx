import React, { useState } from 'react';

import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { createWallet } from '@/services/emigro/users';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { CryptoAsset } from '@/types/assets';

export const CreateWallet = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    setIsCreating(true);

    try {
      const wallet = await createWallet();
      if (wallet.publicKey) {
        // update session and balance
        balanceStore.setUserBalance(wallet.balances);
        sessionStore.fetchUser().catch(console.warn);
        waitForInitialBalance();
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setIsCreating(false);
    }
  };

  // wait to create trusted lines for default assets
  const waitForInitialBalance = async (tries: number = 5) => {
    if (tries <= 0) {
      return;
    }

    try {
      console.debug(`${5 - tries}/5 - Waiting for balances...`);
      await balanceStore.fetchUserBalance({ force: true });
      if (!balanceStore.find(CryptoAsset.USDC)) {
        setTimeout(() => {
          waitForInitialBalance(tries - 1);
        }, 1500);
      }
    } catch (error) {
      console.warn('Error on waiting for balances: ', error);
    }
  };

  return (
    <Card variant="flat">
      <Heading>Welcome to Emigro</Heading>
      <Text className="mb-4">Now, let's create a wallet to use the app</Text>
      <Button onPress={() => handleCreateWallet()} disabled={isCreating}>
        <ButtonText>{isCreating ? 'Creating...' : 'Create your wallet'}</ButtonText>
      </Button>
    </Card>
  );
};
