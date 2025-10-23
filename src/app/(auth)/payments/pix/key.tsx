// src/app/(auth)/payments/pix/key.tsx
import React, { useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, ButtonText } from '@/components/ui/button';
import { api } from '@/services/emigro/api';
import { paymentStore } from '@/stores/PaymentStore';

// Android native picker
import { Picker } from '@react-native-picker/picker';

type KeyType = 'CPF/CNPJ' | 'Phone' | 'Email' | 'EVP';

const isCPF = (v: string) => /^\d{11}$/.test(v);
const isCNPJ = (v: string) => /^\d{14}$/.test(v);
const onlyDigits = (v: string) => v.replace(/\D/g, '');
const isPhone = (v: string) => /^\+?\d{10,14}$/.test(v.replace(/[^\d+]/g, ''));
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isEVP = (v: string) => {
  const s = v.trim();
  // Accept either pure 32-hex or UUID v4 with hyphens
  const pure32 = /^[0-9a-f]{32}$/i.test(s);
  const uuidHyphenated = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  return pure32 || uuidHyphenated;
};


const OPTIONS: KeyType[] = ['CPF/CNPJ', 'Phone', 'Email', 'EVP'];

export default function PixKeyScreen() {
  const router = useRouter();

  const [keyType, setKeyType] = useState<KeyType>('CPF/CNPJ');
  const [androidType, setAndroidType] = useState<KeyType>('CPF/CNPJ');
  const [pixKey, setPixKey] = useState('');
  const [taxId, setTaxId] = useState('');           // NEW: user-provided CPF/CNPJ when needed
  const [needTaxId, setNeedTaxId] = useState(false); // NEW: show CPF/CNPJ field gate
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  // Normalize/validate a CPF or CNPJ; returns only-digits string or '' if invalid
  const validateTaxId = (v: string): string => {
    const d = onlyDigits(v || '');
    if (isCPF(d) || isCNPJ(d)) return d;
    return '';
  };

  const placeholder = useMemo(() => {
    switch (keyType) {
      case 'CPF/CNPJ':
        return 'Only numbers';
      case 'Phone':
        return 'Phone number with country code';
      case 'Email':
        return 'name@domain.com';
      case 'EVP':
        return 'Random Key';
      default:
        return 'Enter the PIX key';
    }
  }, [keyType]);



  const openIOSPicker = () => {
    const optionLabels = OPTIONS.map((o) => (o === 'EVP' ? 'Random Key' : o));
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...optionLabels, 'Cancel'],
        cancelButtonIndex: OPTIONS.length,
        userInterfaceStyle: 'dark',
      },
      (buttonIndex) => {
        if (buttonIndex === OPTIONS.length) return;
        const chosen = OPTIONS[buttonIndex] as KeyType; // indices align with OPTIONS
        setKeyType(chosen);
      }
    );
  };


  const validateKey = () => {
    const raw = pixKey.trim();
    if (!raw) return 'Enter the PIX key';

    if (keyType === 'CPF/CNPJ') {
      const d = onlyDigits(raw);
      if (!(isCPF(d) || isCNPJ(d))) return 'CPF must have 11 numbers or CNPJ 14 numbers';
      return null;
    }
    if (keyType === 'Phone') return isPhone(raw) ? null : 'Invalid phone number (include country code, e.g., +55...)';
    if (keyType === 'Email') return isEmail(raw) ? null : 'Invalid email';
    if (keyType === 'EVP') return isEVP(raw) ? null : 'Invalid key (UUID v4 with hyphens or 32 hex)';

    return 'Invalid key type';
  };


  const onContinue = async () => {
    setErr(null);
    setIsLoading(true);
    try {
      // 1) Validate the PIX key the user typed
      const keyError = validateKey();
      if (keyError) {
        setErr(keyError);
        return;
      }

      // 2) Try to determine the receiver's taxId without asking:
      //    - If key IS CPF/CNPJ, we already have it.
      //    - Else try DICT. If still missing, show CPF/CNPJ field and stop.
      let resolvedTaxId = '';
      let resolvedName = '';

      if (keyType === 'CPF/CNPJ') {
        resolvedTaxId = validateTaxId(pixKey); // guaranteed by validateKey, but normalize again
      } else {
        try {
          const keyForDict = pixKey.trim();
          const res = await api().get(`/pix/dict-key/${encodeURIComponent(keyForDict)}`);
          if (res?.data) {
            resolvedName = res.data.name || '';
            resolvedTaxId = validateTaxId(res.data.taxId || '');
          }
        } catch {
          // DICT not available or not found – fall through
        }
      }

      // 3) If taxId is still missing, require user input (one-time gate)
      if (!resolvedTaxId) {
        // If we already asked and user filled, validate that value
        if (needTaxId) {
          const typed = validateTaxId(taxId);
          if (!typed) {
            setErr('Enter a valid CPF/CNPJ.');
            return;
          }
          resolvedTaxId = typed;
        } else {
          setNeedTaxId(true); // show field
          setErr("Enter the recipient's CPF/CNPJ to continue.");
          return;
        }
      }

      // 4) Proceed with the flow; store normalized taxId
      paymentStore.setScannedPayment({
        merchantName: resolvedName || 'Unknown Merchant',
        merchantCity: '',
        transactionAmount: 0, // ask amount next
        pixKey: pixKey.trim(),
        assetCode: 'BRL',
        taxId: resolvedTaxId,  // REQUIRED by backend
        bankName: '',
        txid: '',
        brCode: '', // not a copia-e-cola flow
      } as any);

      router.replace({
        pathname: '/payments/pix/enter-amount',
        params: { returnTo: '/payments/confirm' },
      });
    } finally {
      setIsLoading(false);
    }
  };


  const SelectorIOS = () => (
    <Pressable onPress={openIOSPicker} style={styles.selectorPressable}>
      <Text style={styles.selectorLabel}>Key type</Text>
      <Text style={styles.selectorValue}>{keyType}</Text>
    </Pressable>
  );

  const SelectorAndroid = () => (
    <View style={styles.androidPickerWrapper}>
      <Text style={styles.selectorLabel}>Key type</Text>
      <View style={styles.androidPickerBox}>
        <Picker
          selectedValue={androidType}
          onValueChange={(val) => {
            setAndroidType(val as KeyType);
            setKeyType(val as KeyType);
          }}
          mode="dialog"
          dropdownIconColor="#fff"
          style={styles.androidPicker}
        >
          {OPTIONS.map((opt) => (
            <Picker.Item
              key={opt}
              label={opt === 'EVP' ? 'Random Key' : opt}
              value={opt}
            />
          ))}
        </Picker>
      </View>
    </View>
  );


  return (
    <>
      <Stack.Screen options={{ title: 'PIX via Key' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.form}>
          <Text style={styles.title}>Enter your PIX key</Text>

          {Platform.OS === 'ios' ? <SelectorIOS /> : <SelectorAndroid />}

          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#a1a1aa"
            value={pixKey}
            onChangeText={(t) => {
              setErr(null);
              setPixKey(t);
            }}
            autoCapitalize="none"
            keyboardType={keyType === 'Email' ? 'email-address' : 'default'}
            autoCorrect={false}
          />
		  {/* Only show CPF/CNPJ when the key itself isn't CPF/CNPJ and we couldn't resolve via DICT */}
		  {needTaxId && (
		    <TextInput
		      style={styles.input}
		      placeholder="Recipient's CPF/CNPJ (number only)"
		      placeholderTextColor="#a1a1aa"
		      value={taxId}
		      onChangeText={(t) => {
		        setErr(null);
		        setTaxId(onlyDigits(t));
		      }}
		      autoCapitalize="none"
		      keyboardType="number-pad"
		      autoCorrect={false}
		    />
		  )}

          {err ? <Text style={styles.error}>{err}</Text> : null}

		  <Button
		    size="lg"
		    onPress={onContinue}
		    style={styles.button}
		    disabled={
		      isLoading ||
		      !pixKey.trim() ||
		      (needTaxId && !validateTaxId(taxId))
		    }
		  >
		    <ButtonText className="text-lg text-white">
		      {isLoading ? 'Checking…' : 'Continue'}
		    </ButtonText>
		  </Button>

        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  form: { padding: 20 },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },

  // iOS selector (ActionSheet trigger)
  selectorPressable: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  selectorLabel: { color: '#a1a1aa', fontSize: 12, marginBottom: 2 },
  selectorValue: { color: '#ffffff', fontSize: 18, textAlign: 'center' },

  // Android native picker styles
  androidPickerWrapper: { marginBottom: 14 },
  androidPickerBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
  },
  androidPicker: {
    color: '#ffffff',
    width: '100%',
  },

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    padding: 16,
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  error: { color: '#f87171', marginBottom: 20, fontSize: 14, textAlign: 'center' },
  button: { marginTop: 8, height: 56, borderRadius: 9999 },
});
