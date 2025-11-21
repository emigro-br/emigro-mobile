import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useForm } from 'react-hook-form';

import { createCircleTransfer } from '@/services/emigro/transactions';

export default function EnterAmountScreen() {
  const router = useRouter();

  const {
    assetId = '',
    symbol = '',
    recipientAddress = '',
    balance = '0',
    walletId = '',
  } = useLocalSearchParams();

  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount || '0');
  const parsedBalance = parseFloat(balance || '0');

  const isOverBalance = parsedAmount > parsedBalance;
  const isInvalid = !parsedAmount || isOverBalance;
  const isDisabled = isInvalid || isSubmitting;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animatePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const { handleSubmit } = useForm();

  const onSubmit = async () => {
    if (isSubmitting) {
      console.log('[amount.tsx][onSubmit] ⚠️ Already submitting, ignoring duplicate press');
      return;
    }

    setIsSubmitting(true);

    console.log('[amount.tsx][onSubmit] 📨 Starting transfer...');
    console.log('[amount.tsx][onSubmit] Params:', {
      walletId,
      assetId,
      recipientAddress,
      amount,
    });

    if (!walletId || !assetId || !recipientAddress) {
      console.warn('[amount.tsx][onSubmit] ❌ Missing required input');
      router.replace('/transfers/confirm/status?error=missing');
      return;
    }

    try {
      await createCircleTransfer({
        sourceWalletId: walletId,
        assetId,
        destinationAddress: recipientAddress,
        amount,
      });

      console.log('[amount.tsx][onSubmit] ✅ Transfer request sent successfully');
      router.replace('/transfers/confirm/status?success=true');
      // Do not reset isSubmitting here; we are leaving this screen.
    } catch (err) {
      console.error('[amount.tsx][onSubmit] ❌ Transfer failed:', err);
      setIsSubmitting(false);
      router.replace('/transfers/confirm/status?error=transfer_failed');
    }
  };

  const handleMax = () => {
    console.log('[amount.tsx][handleMax] ⬆️ Setting max amount:', balance);
    setAmount(balance.toString());
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Transfer' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="bg-background-900"
        style={{
          flex: 1,
          paddingTop: 60,
          paddingHorizontal: 20,
        }}
      >
        {/* Recipient */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ color: '#888', fontSize: 14, flex: 1 }}>
            To: {recipientAddress}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="decimal-pad"
            placeholderTextColor="#888"
            style={{
              fontSize: 60,
              color: isOverBalance ? '#f87171' : '#fff',
              textAlign: 'right',
              flex: 1,
            }}
          />
          <Text style={{ fontSize: 32, color: '#fff', marginLeft: 10 }}>{symbol}</Text>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#333', marginVertical: 12 }} />

        {/* Balance + Max Button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text style={{ color: '#888' }}>Available To Send</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#fff', marginRight: 10 }}>
              {Number(balance).toFixed(5)} {symbol}
            </Text>
            <Pressable
              onPress={handleMax}
              style={{
                backgroundColor: '#222',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12 }}>Max</Text>
            </Pressable>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPressIn={animatePress}
          onPress={handleSubmit(onSubmit)}
          disabled={isDisabled}
        >
          <Animated.View
            style={{ transform: [{ scale: scaleAnim }] }}
            className={`bg-primary-500 rounded-full py-4 items-center justify-center mt-4 ${
              isDisabled ? 'opacity-50' : ''
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isSubmitting ? 'Transferring...' : 'Transfer'}
            </Text>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </>
  );
}
