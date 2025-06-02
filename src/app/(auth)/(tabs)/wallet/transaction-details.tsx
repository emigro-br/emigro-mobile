// src/app/(auth)/(tabs)/wallet/transaction-details.tsx
import React from 'react';
import { View, Image, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Download, ExternalLink } from 'lucide-react-native';
import { useChainStore } from '@/stores/ChainStore';

const statusStyleMap = {
  success: { bg: '#093', text: '#fff', message: 'Payment received successfully!' },
  pending: { bg: '#ffcc00', text: '#000', message: 'Pending' },
  error: { bg: '#cc0000', text: '#fff', message: 'An error occurred in this transaction' },
};

const getStatusData = (status: string) => {
  if (status.startsWith('f')) return statusStyleMap.success;
  if (status.startsWith('p')) return statusStyleMap.pending;
  if (status.startsWith('e')) return statusStyleMap.error;
  return statusStyleMap.pending;
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, '0')}/$${
    (date.getMonth() + 1).toString().padStart(2, '0')
  }/${date.getFullYear()} - ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export default function TransactionDetails() {
  const { transaction } = useLocalSearchParams();
  const tx = JSON.parse(transaction as string);
  const router = useRouter();
  const chains = useChainStore((state) => state.chains);

  const getChainName = (id: string) => {
    const chain = chains.find(c => c.id === id);
    return chain?.name ?? id.slice(0, 4);
  };

  const statusData = getStatusData(tx.status);
  const isPix = tx.type === 'pix-payment';
  const isTransfer = tx.type === 'crypto-transfer';
  const isCoinbase = tx.type === 'coinbase-onramp';
  const chainName = getChainName(tx.chain_id || tx.to_chain_id);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0a', padding: 16 }}>
      <Pressable onPress={router.back}>
        <Text style={{ color: '#fe0055', fontSize: 16, marginBottom: 12 }}>{'< Back'}</Text>
      </Pressable>

      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
        {isPix ? 'Pix Payment' : isTransfer ? 'Crypto Transfer' : 'Deposit (Coinbase)'}
      </Text>

      <Text style={{ color: '#aaa', marginBottom: 16 }}>{formatDate(tx.created_at)}</Text>

      <View style={{ backgroundColor: statusData.bg, padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ color: statusData.text, fontWeight: 'bold' }}>{statusData.message}</Text>
      </View>

      <View style={{ height: 1, backgroundColor: '#222', marginVertical: 12 }} />

      {isPix && (
        <>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>Value (in BRL): R$ {parseFloat(tx.fiat_amount || '0').toFixed(2)}</Text>
          <Text style={{ color: '#aaa', marginBottom: 12 }}>To: {tx.merchant_name}</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Transaction Details</Text>
          <Text style={{ color: '#aaa' }}>Paid using: {tx.token_symbol} on {chainName}</Text>
        </>
      )}

      {isTransfer && (
        <>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>
            Value: {parseFloat(tx.token_amount).toFixed(6)} {tx.token_symbol}
          </Text>
          <Text style={{ color: '#aaa', marginBottom: 4 }}>From: {tx.wallet_public_address} ({chainName})</Text>
          <Text style={{ color: '#aaa', marginBottom: 12 }}>To: {tx.to_wallet_public_address} ({chainName})</Text>
        </>
      )}

      {isCoinbase && (
        <>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 4 }}>
            Value: {parseFloat(tx.token_amount).toFixed(6)} {tx.token_symbol}
          </Text>
          <Text style={{ color: '#aaa', marginBottom: 12 }}>To: {tx.to_wallet_public_address} ({chainName})</Text>
        </>
      )}

      <View style={{ height: 1, backgroundColor: '#222', marginVertical: 12 }} />

      {isPix && (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Download color="#fff" size={18} style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff' }}>Download receipt (to be implemented)</Text>
        </Pressable>
      )}

      {(isTransfer || isCoinbase) && (
        <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ExternalLink color="#fff" size={18} style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff' }}>See on explorer (to be implemented)</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}