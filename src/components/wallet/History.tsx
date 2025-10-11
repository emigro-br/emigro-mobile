import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { api } from '@/services/emigro/api';
import { useChainStore } from '@/stores/ChainStore';
import { ScrollView } from '@/components/ui/scroll-view';
import { Download, ExternalLink, X } from 'lucide-react-native';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';

const typeIconMap: Record<string, any> = {
  'pix-payment': require('@/assets/images/transactions/pix-icon.png'),
  'coinbase-onramp': require('@/assets/images/transactions/coinbase-icon.png'),
  'crypto-transfer': require('@/assets/images/transactions/transfer-icon.png'),
  'transaction_out': require('@/assets/images/transactions/transfer-icon.png'),
  'transaction_in': require('@/assets/images/transactions/transfer-icon.png'),
  'swap-input': require('@/assets/images/transactions/swap-icon.png'),
};


const typeNameMap: Record<string, string> = {
  'pix-payment': 'Pix Payment',
  'coinbase-onramp': 'Deposit (Coinbase)',
  'crypto-transfer': 'Transfer Crypto',
  'transaction_out': 'Transfer Out',
  'transaction_in': 'Transfer In',
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
  return {
    value: floatVal.toFixed(6),
    symbol: tx.token_symbol || '???',
  };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onTransactionPress: (tx: any) => void;
};

export const History = ({ isOpen, onClose, onTransactionPress }: Props) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const chains = useChainStore((state) => state.chains);

  const getChainName = (id: string) => {
    const chain = chains.find((c) => c.id === id);
    return chain?.name ?? id?.slice(0, 4) ?? '???';
  };

  const fetchPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await api().get(`/paymentv2/all?page=${p}`);
      setTransactions(res.data.data || []);
      setPage(res.data.page || 1);
      setTotalPages(res.data.totalPages || 1); // NEW: Capture total pages from backend
    } catch (err) {
      console.error('[History] Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePagination = (current: number, total: number) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l: number;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  
  useEffect(() => {
    if (isOpen) {
      fetchPage(1);
    }
  }, [isOpen]);

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent style={{ backgroundColor: '#0a0a0a', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
	  <Pressable
	    onPress={onClose}
	    style={{
	      position: 'absolute',
	      top: 12,
	      right: 16,
	      zIndex: 10,
	      width: 34,
	      height: 34,
	      borderRadius: 16,
	      backgroundColor: '#fe0055',
	      alignItems: 'center',
	      justifyContent: 'center',
	    }}
	  >
	    <X color="#fff" size={20} />
	  </Pressable>

	  <ActionsheetDragIndicatorWrapper>
	    <ActionsheetDragIndicator
	      style={{
	        width: 80,
	        height: 8,
	        borderRadius: 3,
	        backgroundColor: '#555',
	      }}
	    />
	  </ActionsheetDragIndicatorWrapper>
	  <ScrollView style={{ paddingHorizontal: 12, paddingBottom: 0, marginTop: 36, width: '100%', maxHeight: '80%' }}>

          {loading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="small" color="#aaa" />
              <Text className="text-gray-400 mt-2">Loading...</Text>
            </View>
          ) : transactions.length === 0 ? (
            <Text className="text-center text-white mt-16 text-lg">No transactions found.</Text>
          ) : (
            <VStack space="sm">
              {transactions.map((tx, idx) => {
                const typeIcon = typeIconMap[tx.type] ?? null;
                const typeName = typeNameMap[tx.type] ?? tx.type ?? 'Unknown';
                const { name: statusName, icon: statusIcon } = getStatusDetails(tx.status);
                const chainName = getChainName(tx.chain_id);
                const { value, symbol } = getDisplayValues(tx);

                return (
                  <Pressable
                    key={tx.id || idx}
                    onPress={() => onTransactionPress(tx)}
                  >
                    <Card className="flex-row items-center p-3 rounded-lg mb-2" style={{ backgroundColor: '#2e2e2e' }}>
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
                        <Text className="text-white font-bold text-md">{typeName} [{chainName}]</Text>
                        <Text className="text-gray-400 text-sm">{statusName}</Text>
                        <Text className="text-gray-400 text-sm">{formatDate(tx.created_at)}</Text>
                      </VStack>

                      <VStack alignItems="flex-end">
                        <Text className="text-white">{value}</Text>
                        <Text className="text-gray-300 text-sm">{symbol}</Text>
                      </VStack>
                    </Card>
                  </Pressable>
                );
              })}
            </VStack>
          )}
        </ScrollView>

        {/* Pagination Controls */}
		<View className="flex-row items-center justify-center flex-wrap px-4 pt-4 pb-6 gap-2">
		  {/* Previous */}
		  <TouchableOpacity
		    disabled={page <= 1}
		    onPress={() => fetchPage(page - 1)}
		    style={{
		      backgroundColor: page <= 1 ? '#000000' : '#fe0055',
		      paddingHorizontal: 12,
		      paddingVertical: 8,
		      borderRadius: 6,
		      marginRight: 6,
		    }}
		  >
		    <Text style={{ color: 'white' }}>Previous</Text>
		  </TouchableOpacity>

		  {/* Page numbers */}
		  {generatePagination(page, totalPages).map((item, index) => (
		    <TouchableOpacity
		      key={index}
		      disabled={item === '...'}
		      onPress={() => typeof item === 'number' && fetchPage(item)}
		      style={{
		        backgroundColor: item === page ? '#fe0055' : '#000000',
		        paddingHorizontal: 10,
		        paddingVertical: 6,
		        borderRadius: 50,
		        marginHorizontal: 2,
		      }}
		    >
		      <Text style={{ color: 'white' }}>{item}</Text>
		    </TouchableOpacity>
		  ))}

		  {/* Next */}
		  <TouchableOpacity
		    disabled={page >= totalPages}
		    onPress={() => fetchPage(page + 1)}
		    style={{
		      backgroundColor: page >= totalPages ? '#000000' : '#fe0055',
		      paddingHorizontal: 12,
		      paddingVertical: 8,
		      borderRadius: 6,
		      marginLeft: 6,
		    }}
		  >
		    <Text style={{ color: 'white' }}>Next</Text>
		  </TouchableOpacity>
		</View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
