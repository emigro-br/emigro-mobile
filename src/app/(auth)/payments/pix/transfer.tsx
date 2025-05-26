import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { paymentStore } from '@/stores/PaymentStore';
import { PixPayment } from '@/types/PixPayment';

const PixTransfer = () => {
  console.log('[PixTransfer] component mounted.');

  const router = useRouter();
  const [pixKey, setPixKey] = useState('');
  const [value, setValue] = useState('');
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  console.log('[PixTransfer] paymentStore import is:', paymentStore);

  const handleContinue = async () => {
    console.log('[PixTransfer] handleContinue called.');
    setError('');

    if (!pixKey || !value || !cpf || !name) {
      console.warn('[PixTransfer] Missing required fields.');
      setError('Please fill in all fields.');
      return;
    }

    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      console.warn('[PixTransfer] Invalid amount input:', value);
      setError('Please enter a valid amount.');
      return;
    }

    if (!/^\d{11}$/.test(cpf)) {
      console.warn('[PixTransfer] Invalid CPF input:', cpf);
      setError('Please enter a valid CPF (11 digits).');
      return;
    }

    try {
      const transferDetails = {
        pixKey,
        value: amount,
        name,
        taxId: cpf,
      };
      console.log('[PixTransfer] Preparing to set PixTransferDetails:', transferDetails);

      paymentStore.setPixTransferDetails(transferDetails);
      console.log('[PixTransfer] PixTransferDetails successfully set in store.', paymentStore.pixTransferDetails);

      const scannedPayment: PixPayment = {
        merchantName: name,
        merchantCity: '',
        transactionAmount: amount,
        pixKey,
        assetCode: 'BRL',
        taxId: cpf,
        bankName: '',
        txid: '',
      };

      paymentStore.setScannedPayment(scannedPayment);
      console.log('[PixTransfer] scannedPayment (PixPayment) set successfully:', paymentStore.scannedPayment);

      console.log('[PixTransfer] Navigating to /payments/confirm');
      router.push('/payments/confirm');
    } catch (err) {
      console.error('[PixTransfer] Error during handleContinue:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pix Transfer' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Insert the Full Name"
            placeholderTextColor="#a1a1aa"
            value={name}
            onChangeText={(text) => setName(text)}
          />

          <Text style={styles.label}>CPF (Tax ID)</Text>
          <TextInput
            style={styles.input}
            placeholder="Insert the CPF (11 digits)"
            placeholderTextColor="#a1a1aa"
            value={cpf}
            keyboardType="numeric"
            onChangeText={(text) => setCpf(text.replace(/\D/g, ''))}
          />

          <Text style={styles.label}>Pix Key</Text>
          <TextInput
            style={styles.input}
            placeholder="Insert the Pix Key"
            placeholderTextColor="#a1a1aa"
            value={pixKey}
            onChangeText={(text) => setPixKey(text)}
            autoCapitalize="none"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Insert the amount"
            placeholderTextColor="#a1a1aa"
            value={value}
            keyboardType="decimal-pad"
            onChangeText={(text) => setValue(text)}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button size="lg" onPress={handleContinue} style={styles.button}>
            <ButtonText className="text-lg text-white">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default PixTransfer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Dark background
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff', // White label
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    color: '#ffffff', // White text
    padding: 16,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center', // Center text inside inputs
  },
  error: {
    color: '#f87171',
    marginBottom: 20,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    height: 56,
    borderRadius: 9999, // Full rounded button
  },
});
