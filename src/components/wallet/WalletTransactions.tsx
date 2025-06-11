// src/components/wallet/WalletTransactions

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Pressable } from 'react-native';
import { api } from '@/services/emigro/api';
import { VStack } from '../ui/vstack';
import { Card } from '../ui/card';
import { useChainStore } from '@/stores/ChainStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { sessionStore } from '@/stores/SessionStore';
import { RefreshCw } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { TransactionDetailsSheet } from './TransactionDetailsSheet';

const typeIconMap = {
  'pix-payment': require('@/assets/images/transactions/pix-icon.png'),
  'coinbase-onramp': require('@/assets/images/transactions/coinbase-icon.png'),
  'crypto-transfer': require('@/assets/images/transactions/transfer-icon.png'),
  'swap-input': require('@/assets/images/transactions/swap-icon.png'),
};

const typeNameMap = {
  'pix-payment': 'Pix Payment',
  'coinbase-onramp': 'Deposit (Coinbase)',
  'crypto-transfer': 'Transfer Crypto',
  'swap-input': 'Token Swap',
};

const statusIconMap = {
  pending: require('@/assets/images/transactions/pending-icon.png'),
  error: require('@/assets/images/transactions/error-icon.png'),
  success: require('@/assets/images/transactions/success-icon.png'),
};

const getStatusDetails = (status: string) => {
  if (status.startsWith('p')) return { name: 'Pending', icon: statusIconMap.pending };
  if (status.startsWith('e')) return { name: 'Failed', icon: statusIconMap.error };
  if (status.startsWith('f')) return { name: 'Success', icon: statusIconMap.success };
  return { name: 'Unknown', icon: statusIconMap.pending };
};

export const WalletTransactions = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const chains = useChainStore((state) => state.chains);
  const walletId = sessionStore.user?.circleWallet?.id;
  const { balances, refresh } = useWalletBalances(walletId);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isSheetOpen, setSheetOpen] = useState(false);

  const getChainName = (id: string) => {
    const chain = chains.find(c => c.id === id);
    return chain?.name ?? id.slice(0, 4);
  };

  const fetchTransactions = async () => {
    const isFirstLoad = transactions.length === 0;
    if (isFirstLoad) setLoading(true);

    try {
      const res = await api().get('/paymentv2/latest');
      if (!Array.isArray(res.data)) throw new Error('Invalid response format');
      setTransactions(res.data);
    } catch (err: any) {
      console.error('[WalletTransactions] Error:', err);
      if (isFirstLoad) setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
      fetchTransactions();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}/` +
           `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
           `${date.getFullYear()} - ` +
           `${date.getHours().toString().padStart(2, '0')}:` +
           `${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getDisplayValues = (tx: any) => {
    if (tx.type === 'pix-payment') {
      return {
        value: parseFloat(tx.fiat_amount || '0').toFixed(2),
        symbol: 'BRL',
      };
    }

    const floatVal = parseFloat(tx.token_amount || '0');
    const formatted = floatVal.toFixed(6);
    return {
      value: formatted,
      symbol: tx.token_symbol || '???',
    };
  };

  if (loading && transactions.length === 0) {
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#888" />
        <Text className="text-xs text-gray-400 mt-2">Loading transactions...</Text>
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View className="items-center py-4">
        <Text className="text-sm text-red-400">{error}</Text>
      </View>
    );
  }

  if (!transactions.length) {
    return (
      <View className="items-center py-4">
        <Text className="text-sm text-gray-400">No transactions yet</Text>
      </View>
    );
  }

  return (
    <>
      <VStack space="md" className="px-4 py-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-lg font-bold">Recent Transactions</Text>
          <Pressable onPress={handleRefresh}>
            <View className="bg-[#222] w-7 h-7 rounded-full items-center justify-center">
              {refreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <RefreshCw size={16} color="#fff" />
              )}
            </View>
          </Pressable>
        </View>

        {transactions.map((tx, idx) => {
          const typeIcon = typeIconMap[tx.type] ?? null;
          const typeName = typeNameMap[tx.type] ?? tx.type ?? 'Unknown';
          const { name: statusName, icon: statusIcon } = getStatusDetails(tx.status);
          const chainName = getChainName(tx.chain_id);
          const { value, symbol } = getDisplayValues(tx);

          return (
            <Pressable
              key={tx.id || idx}
              onPress={() => {
                setSelectedTransaction(tx);
                setSheetOpen(true);
              }}
            >
              <Card className="flex-row items-center p-3 rounded-lg" style={{ backgroundColor: '#2e2e2e' }}>
                <View className="relative mr-4">
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#fe0055',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {typeIcon && (
                      <Image
                        source={typeIcon}
                        style={{ width: 24, height: 24 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <View style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Image
                      source={statusIcon}
                      style={{ width: 12, height: 12 }}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <VStack className="flex-1">
                  <Text className="text-white font-bold text-md">
                    {typeName} [{chainName}]
                  </Text>
                  <Text className="text-gray-400 text-sm">{statusName}</Text>
                  <Text className="text-gray-400 text-sm">{formatDate(tx.created_at)}</Text>
                </VStack>

                <VStack alignItems="flex-end">
                  <Text className="text-white" size="md">{value}</Text>
                  <Text className="text-gray-300 text-sm">{symbol}</Text>
                </VStack>
              </Card>
            </Pressable>
          );
        })}
      </VStack>

      <TransactionDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setSheetOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
};
