// src/components/wallet/TransactionDetailsSheet.tsx

import React from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { Pressable, Image } from 'react-native';
import { Download, ExternalLink, X } from 'lucide-react-native';
import { useChainStore } from '@/stores/ChainStore';


const statusStyleMap = {
  success: { bg: '#156c47', text: '#fff', message: 'Payment received successfully!', icon: require('@/assets/images/transactions/success-icon.png') },
  pending: { bg: '#656c15', text: '#000', message: 'Pending', icon: require('@/assets/images/transactions/pending-icon.png') },
  error: { bg: '#b70101', text: '#fff', message: 'An error occurred in this transaction', icon: require('@/assets/images/transactions/error-icon.png') },
};

const getStatusData = (tx: any) => {
  if (tx.status.startsWith('f')) {
    const base = statusStyleMap.success;
    let message = base.message;

    if (tx.type === 'swap-input') {
      message = 'Swap completed successfully!';
    } else if (tx.type === 'crypto-transfer' || tx.type === 'transaction_out' || tx.type === 'transaction_in') {
      // Keep identical success message for all transfer variants
      message = 'Crypto transferred successfully!';
    } else if (tx.type === 'pix-payment') {
      message = 'Pix payment received!';
    } else if (tx.type === 'coinbase-onramp') {
      message = 'Deposit received!';
    }

    return { ...base, message };
  }

  if (tx.status.startsWith('p')) return statusStyleMap.pending;
  if (tx.status.startsWith('e')) return statusStyleMap.error;
  return statusStyleMap.pending;
};

// --- Swap human-amount cutover (UTC) ---
// All swap-input rows created *on/after* this instant already store HUMAN amounts.
// Rows *before* this instant stored RAW base units and must be scaled by 10^decimals.
const SWAP_HUMAN_CUTOVER_ISO = '2025-10-15T17:00:00Z';
const SWAP_HUMAN_CUTOVER_MS = Date.parse(SWAP_HUMAN_CUTOVER_ISO);

const isOnOrAfterCutover = (iso?: string) => {
  if (!iso) return true; // missing dates → assume new format to avoid double-scaling
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return true; // invalid date → assume new format
  return t >= SWAP_HUMAN_CUTOVER_MS;
};





const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${date.getDate().toString().padStart(2, '0')}/` +
    `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
    `${date.getFullYear()} - ` +
    `${date.getHours().toString().padStart(2, '0')}:` +
    `${date.getMinutes().toString().padStart(2, '0')}`;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  transaction: any | null;
};

export const TransactionDetailsSheet = ({ isOpen, onClose, transaction }: Props) => {
  const chains = useChainStore((state) => state.chains);

  if (!transaction) return null;

  const tx = transaction;
  const isPix = tx.type === 'pix-payment';
  const isTransfer = tx.type === 'crypto-transfer';
  const isTransferOut = tx.type === 'transaction_out';
  const isTransferIn = tx.type === 'transaction_in';
  const isAnyTransfer = isTransfer || isTransferOut || isTransferIn;
  const isCoinbase = tx.type === 'coinbase-onramp';
  const isSwap = tx.type === 'swap-input';


  const getChainName = (id: string) => {
    const chain = chains.find(c => c.id === id);
    return chain?.name ?? id?.slice(0, 4) ?? '???';
  };

  const chainName = getChainName(tx.chain_id || tx.to_chain_id);
  const statusData = getStatusData(tx);
  const iconMap = {
    'pix-payment': require('@/assets/images/transactions/pix-icon.png'),
    'coinbase-onramp': require('@/assets/images/transactions/coinbase-icon.png'),
    'crypto-transfer': require('@/assets/images/transactions/transfer-icon.png'),
    'transaction_out': require('@/assets/images/transactions/transfer-icon.png'),
    'transaction_in': require('@/assets/images/transactions/transfer-icon.png'),
    'swap-input': require('@/assets/images/transactions/swap-icon.png'),
    'swap': require('@/assets/images/transactions/swap-icon.png'),
  };
const icon = iconMap[tx.type];

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

        <Box style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
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
        </Box>

        <ScrollView style={{ paddingHorizontal: 12, paddingBottom: 80, marginTop: 16, width: '100%' }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Box style={{
              
              borderRadius: 24,
              width: 42,
              height: 42,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              {icon && <Image source={icon} style={{ width: 24, height: 24 }} resizeMode="contain" />}
            </Box>
			<Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>
			  {isSwap
			    ? 'Token Swap'
			    : isPix
			    ? 'Pix Payment'
			    : isTransferOut
			    ? 'Transfer Out'
			    : isTransferIn
			    ? 'Transfer In'
			    : isTransfer
			    ? 'Crypto Transfer'
			    : 'Deposit (Coinbase)'}
			</Text>

          </Box>

          <Box style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: statusData.bg, padding: 10, borderRadius: 8, marginBottom: 16 }}>
            <Box style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}>
              <Image source={statusData.icon} style={{ width: 14, height: 14 }} resizeMode="contain" />
            </Box>
            <Text style={{ color: statusData.text, fontWeight: 'bold' }}>{statusData.message}</Text>
          </Box>

          <Text style={{ color: '#aaa', marginBottom: 16 }}>{formatDate(tx.created_at)}</Text>

          <Box style={{ height: 1, backgroundColor: '#222', marginVertical: 12 }} />

		  {isPix && (() => {
		    // base BRL (without fee)
		    const baseBrl = parseFloat(String(tx.fiat_amount ?? '0')) || 0;

		    // support camelCase or snake_case just in case
		    const feePremiumBrl = parseFloat(String((tx.feePremiumTotalBrl ?? tx.fee_premium_total_brl) ?? 0)) || 0;
		    const feeFixedBrl   = parseFloat(String((tx.feeFixedBrl        ?? tx.fee_fixed_brl)        ?? 0)) || 0;
		    const feePctBrl     = parseFloat(String((tx.feePctBrl          ?? tx.fee_pct_brl)          ?? 0)) || 0;
		    const feePctFrac    = parseFloat(String((tx.feePct             ?? tx.fee_pct)               ?? 0)) || 0; // e.g. 0.01 = 1%
		    const finalBrl      = parseFloat(String((tx.amountBrlWithFees  ?? tx.amount_brl_with_fees)  ?? baseBrl)) || baseBrl;

		    const pctPercent = (isFinite(feePctFrac) ? feePctFrac * 100 : 0).toFixed(2);

		    return (
		      <>
		        <Text style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>
		          Pix Amount: R$ {baseBrl.toFixed(2)}
		        </Text>

		        {/* show fees only if premium > 0 */}
		        {feePremiumBrl > 0 ? (
		          <>
		            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 2 }}>
		              Emigro fees: R$ {feePremiumBrl.toFixed(2)} (R$ {feeFixedBrl.toFixed(2)} + {pctPercent} %)
		            </Text>
		            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
		              Final Amount: R$ {finalBrl.toFixed(2)}
		            </Text>
		          </>
		        ) : null}

				{tx.merchant_name && tx.merchant_name !== 'Unknown Merchant' ? (
				  <Text style={{ color: '#aaa', marginBottom: 12 }}>To: {tx.merchant_name}</Text>
				) : null}

		        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Transaction Details</Text>
		        <Text style={{ color: '#aaa' }}>
		          Paid using: {parseFloat(String(tx.token_amount ?? 0)).toFixed(6)} {tx.token_symbol} on {chainName}
		        </Text>
		        <Text style={{ color: '#aaa', marginBottom: 4 }}>{tx.wallet_public_address}</Text>
		      </>
		    );
		  })()}


		  {isAnyTransfer && (
		    <>
		      <Text style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>
		        Value: {parseFloat(tx.token_amount).toFixed(6)} {tx.token_symbol}
		      </Text>
		      <Text style={{ color: '#aaa', marginBottom: 4 }}>
		        From: {tx.wallet_public_address} ({chainName})
		      </Text>
		      <Text style={{ color: '#aaa', marginBottom: 12 }}>
		        To: {tx.to_wallet_public_address} ({chainName})
		      </Text>
		    </>
		  )}

		  
		  {isSwap && (() => {
		    const metadata = typeof tx.metadata === "string" ? JSON.parse(tx.metadata) : (tx.metadata || {});
		    const fromDecimals = metadata.fromDecimals ?? tx.token_decimals ?? 6;
		    const toDecimals   = metadata.toDecimals   ?? tx.to_token_decimals ?? 6;

		    const createdAtIso = tx.created_at;

		    let fromHuman: number;
		    let toHuman: number;

		    if (isOnOrAfterCutover(createdAtIso)) {
		      // After cutover → DB already stores HUMAN values
		      fromHuman = parseFloat(String(tx.token_amount ?? '0'));
		      toHuman   = parseFloat(String(tx.to_token_amount ?? '0'));
		    } else {
		      // Before cutover → DB stored RAW base units
		      const fromRaw = Number(tx.token_amount || 0);
		      const toRaw   = Number(tx.to_token_amount || 0);
		      fromHuman = fromRaw / Math.pow(10, fromDecimals);
		      toHuman   = toRaw   / Math.pow(10, toDecimals);
		    }

		    const fromSymbol = tx.token_symbol    || metadata.fromSymbol || '???';
		    const toSymbol   = tx.to_token_symbol || metadata.toSymbol   || '???';

		    return (
		      <>
		        <Text style={{ color: '#fff', fontSize: 22, marginBottom: 2 }}>
		          From: {fromHuman.toFixed(6)} {fromSymbol}
		        </Text>
		        <Text style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>
		          To: {toHuman.toFixed(6)} {toSymbol}
		        </Text>
		        <Text style={{ color: '#aaa', marginBottom: 4 }}>
		          {tx.wallet_public_address} ({chainName})
		        </Text>
		      </>
		    );
		  })()}




          {isCoinbase && (
            <>
              <Text style={{ color: '#fff', fontSize: 22, marginBottom: 4 }}>
                Value: {parseFloat(tx.token_amount).toFixed(6)} {tx.token_symbol}
              </Text>
              <Text style={{ color: '#aaa', marginBottom: 12 }}>To: {tx.to_wallet_public_address} ({chainName})</Text>
            </>
          )}

          <Box style={{ height: 1, backgroundColor: '#222', marginVertical: 12 }} />

		  {/*{isPix && (
		    <Pressable
		      style={{
		        flexDirection: 'row',
		        alignItems: 'center',
		        backgroundColor: '#fd0055',
		        borderRadius: 999,
		        justifyContent: 'center',
		        paddingVertical: 10,
		        paddingHorizontal: 16,
		        marginBottom: 12,
		      }}
		    >
		      <Download color="#fff" size={22} style={{ marginRight: 8 }} />
		      <Text style={{ color: '#fff', fontSize: 18 }}>Download receipt</Text>
		    </Pressable>
		  )}

		  {(isTransfer || isCoinbase) && (
		    <Pressable
		      style={{
		        flexDirection: 'row',
		        alignItems: 'center',
		        backgroundColor: '#fd0055',
		        borderRadius: 999,
		        justifyContent: 'center',
		        paddingVertical: 10,
		        paddingHorizontal: 16,
		      }}
		    >
		      <ExternalLink color="#fff" size={18} style={{ marginRight: 8 }} />
		      <Text style={{ color: '#fff', fontSize: 16 }}>See on explorer</Text>
		    </Pressable>
		  )}*/}

        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};