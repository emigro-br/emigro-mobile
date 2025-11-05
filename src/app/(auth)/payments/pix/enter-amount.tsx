// src/app/(auth)/payments/pix/enter-amount.tsx
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View, Text } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { paymentStore } from '@/stores/PaymentStore';

// Minimal BRL helpers (fits your existing masking style without extra deps)
const maskBRL = (s: string) => {
  const only = s.replace(/[^\d]/g, '');
  const n = only ? parseInt(only, 10) : 0;
  const fixed = (n / 100).toFixed(2);
  // Convert "1234.56" -> "1.234,56"
  const parts = fixed.split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];
  return `R$ ${intPart},${decPart}`;
};

const parseBRL = (s: string) => {
  if (!s) return 0;
  const only = s.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const n = Number(only);
  return Number.isFinite(n) ? n : 0;
};

export default function EnterPixAmount() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const returnTo = typeof params?.returnTo === 'string' ? params.returnTo : undefined;

  const existing = paymentStore.scannedPayment;
  const initial = useMemo(() => {
    const v = existing?.transactionAmount;
    if (v && Number(v) > 0) return maskBRL((Number(v) * 100).toFixed(0));
    return 'R$ 0,00';
  }, [existing?.transactionAmount]);

  const [raw, setRaw] = useState(initial);
  const [err, setErr] = useState<string | null>(null);

  const onChange = (t: string) => {
    setErr(null);
    setRaw(maskBRL(t));
  };

  const onContinue = () => {
    const brl = parseBRL(raw);
    if (!Number.isFinite(brl) || brl <= 0) {
      setErr('Informe um valor maior que R$ 0,00');
      return;
    }

    // Persist back to store; confirm/fast flows will read it
    paymentStore.setScannedPayment({
      ...existing,
      transactionAmount: brl,
    });

    if (returnTo) {
      router.replace(returnTo);
    } else {
      // Default: normal flow -> go to confirm screen
      router.replace('/payments/confirm');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'PIX Value' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Enter the amount you would like to pay in BRL</Text>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={raw}
            onChangeText={onChange}
            placeholder="R$ 0,00"
            placeholderTextColor="#a1a1aa"
          />

          {err ? <Text style={styles.error}>{err}</Text> : null}

          <Button size="lg" onPress={onContinue} style={styles.button}>
            <ButtonText className="text-lg text-white">Continue</ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  form: {
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 0,
    borderColor: '#434343',
    borderRadius: 12,
    backgroundColor: '#2e2e2e',
    color: '#ffffff',
    padding: 16,
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  error: {
    color: '#f87171',
    marginBottom: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    height: 56,
    borderRadius: 12,
  },
});
