// src/app/(auth)/payments/pix/key.tsx
import React, { useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Keyboard,
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
import ContactsList from '@/components/contacts/ContactsList';

// Android native picker
import { Picker } from '@react-native-picker/picker';



type KeyType = 'CPF/CNPJ' | 'Phone' | 'Email' | 'EVP';

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
const isEVP = (v: string) => {
  const s = (v || '').trim();
  const pure32 = /^[0-9a-f]{32}$/i.test(s);
  const uuidHyphenated =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
  return pure32 || uuidHyphenated;
};

// Popular DDIs (Brazil default) + Custom
const DDI_OPTIONS = [
  '+55', // Brazil (default)
  '+1',  // USA/Canada
  '+44', // UK
  '+34', // Spain
  '+351',// Portugal
  '+52', // Mexico
  '+54', // Argentina
  'Custom',
] as const;
type DdiOption = (typeof DDI_OPTIONS)[number];

// --- helper: split an E.164 phone into { ddi, local } ------------------------
const splitE164 = (raw: string): { ddi: DdiOption | 'Custom'; local: string; ddiValue: string } => {
  const s = String(raw || '').trim();
  const only = s.replace(/[^\d+]/g, '');
  if (!only.startsWith('+')) {
    // no + -> fallback to Brazil default
    return { ddi: '+55', local: only.replace(/\D/g, ''), ddiValue: '+55' };
  }

  // Prefer any known DDI in your list (longest first), excluding "Custom"
  const known = (DDI_OPTIONS.filter((d) => d !== 'Custom') as string[]).sort(
    (a, b) => b.length - a.length
  );

  for (const code of known) {
    if (only.startsWith(code)) {
      return { ddi: code as DdiOption, local: only.slice(code.length), ddiValue: code };
    }
  }

  // Fallback: first 1–3 digits after '+', but avoid the "+551" case by trying 2 then 1 then 3
  // (works better for countries like +55 and +1 without a full country map)
  const digits = only.slice(1);
  const try2 = `+${digits.slice(0, 2)}`;
  const try1 = `+${digits.slice(0, 1)}`;
  const try3 = `+${digits.slice(0, 3)}`;

  let ddiValue = try2; // default to 2, fixes Brazil "+55"
  if (known.includes(try1)) ddiValue = try1;
  else if (known.includes(try3)) ddiValue = try3;

  return {
    ddi: (known.includes(ddiValue) ? (ddiValue as DdiOption) : 'Custom') as DdiOption | 'Custom',
    ddiValue,
    local: only.slice(ddiValue.length),
  };
};


// CPF algorithm
const cpfValid = (raw: string) => {
  const v = onlyDigits(raw);
  if (v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  const nums = v.split('').map((n) => parseInt(n, 10));
  let s1 = 0;
  for (let i = 0; i < 9; i++) s1 += nums[i] * (10 - i);
  let d1 = (s1 * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== nums[9]) return false;
  let s2 = 0;
  for (let i = 0; i < 10; i++) s2 += nums[i] * (11 - i);
  let d2 = (s2 * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === nums[10];
};

// CNPJ algorithm
const cnpjValid = (raw: string) => {
  const v = onlyDigits(raw);
  if (v.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(v)) return false;
  const nums = v.split('').map((n) => parseInt(n, 10));
  const calc = (len: number) => {
    let pos = len - 7;
    let sum = 0;
    for (let i = len; i >= 1; i--) {
      sum += nums[len - i] * pos--;
      if (pos < 2) pos = 9;
    }
    const res = sum % 11;
    return res < 2 ? 0 : 11 - res;
  };
  const d1 = calc(12);
  const d2 = calc(13);
  return d1 === nums[12] && d2 === nums[13];
};

const isCPF = (v: string) => /^\d{11}$/.test(onlyDigits(v)) && cpfValid(v);
const isCNPJ = (v: string) => /^\d{14}$/.test(onlyDigits(v)) && cnpjValid(v);

// Phone validators (we’ll combine `+DDI` + local digits on submit)
const isE164Phone = (v: string) => /^\+\d{8,15}$/.test((v || '').trim());

// UI maskers
const formatCPF = (d: string) =>
  d.replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');

const formatCNPJ = (d: string) =>
  d.replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');

const formatCPFOrCNPJ = (raw: string) => {
  const d = onlyDigits(raw);
  if (d.length <= 11) return formatCPF(d).slice(0, 14);
  return formatCNPJ(d).slice(0, 18);
};



const OPTIONS: KeyType[] = ['CPF/CNPJ', 'Phone', 'Email', 'EVP'];

export default function PixKeyScreen() {
  const router = useRouter();

  const [keyType, setKeyType] = useState<KeyType>('CPF/CNPJ');
  const [androidType, setAndroidType] = useState<KeyType>('CPF/CNPJ');

  // For CPF/CNPJ input we keep a masked display and digits-internal
  const [pixKey, setPixKey] = useState(''); // display value (masked for docs)
  const [pixKeyDigits, setPixKeyDigits] = useState(''); // digits-only for docs

  // Phone parts
  const [ddi, setDdi] = useState<DdiOption>('+55');
  const [customDdi, setCustomDdi] = useState('+');
  const [phoneLocal, setPhoneLocal] = useState(''); // digits only

  // TaxID gate when DICT can’t resolve (for non-doc keys)
  const [taxIdDigits, setTaxIdDigits] = useState(''); // digits-only + masked UI
  const [needTaxId, setNeedTaxId] = useState(false);

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
        return 'CPF/CNPJ';
      case 'Phone':
        return '(DDD + number)';
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
	    // reset per-type inputs
	    setErr(null);
	    setPixKey('');
	    setPixKeyDigits('');
	    setPhoneLocal('');
	    setNeedTaxId(false);
	    setTaxIdDigits('');
	  }


    );
  };


  const validateKey = () => {
    if (keyType === 'CPF/CNPJ') {
      const d = onlyDigits(pixKeyDigits || pixKey);
      if (d.length === 11) return cpfValid(d) ? null : 'Invalid CPF. Check the digits.';
      if (d.length === 14) return cnpjValid(d) ? null : 'Invalid CNPJ. Check the digits.';
      return 'Enter a valid CPF (11) or CNPJ (14).';
    }
    if (keyType === 'Phone') {
      const chosenDdi = ddi === 'Custom' ? customDdi : ddi;
      const ddiOk = /^\+\d{1,3}$/.test((chosenDdi || '').trim());
      const localOk = /^\d{8,12}$/.test(onlyDigits(phoneLocal));
      if (!ddiOk) return 'Invalid country code. Example: +55';
      if (!localOk) return 'Invalid phone number. Use area code + number (8–12 digits).';
      const full = `${chosenDdi}${onlyDigits(phoneLocal)}`;
      return isE164Phone(full) ? null : 'Invalid phone in international format.';
    }
    if (keyType === 'Email') return isEmail(pixKey) ? null : 'Invalid email (must contain @).';
    if (keyType === 'EVP') return isEVP(pixKey) ? null : 'Invalid random key (UUID v4).';
    return 'Invalid key type.';
  };




  const onContinue = async () => {
    setErr(null);
    setIsLoading(true);
    try {
      // 1) Validate current inputs
      const keyError = validateKey();
      if (keyError) {
        setErr(keyError);
        return;
      }

      // 2) Normalize key for Transfero
      let normalizedPixKey = '';
      if (keyType === 'CPF/CNPJ') {
        const d = onlyDigits(pixKeyDigits || pixKey);
        normalizedPixKey = d; // digits only
      } else if (keyType === 'Phone') {
        const chosenDdi = (ddi === 'Custom' ? customDdi : ddi).trim();
        normalizedPixKey = `${chosenDdi}${onlyDigits(phoneLocal)}`; // +DDI + digits
      } else if (keyType === 'Email') {
        normalizedPixKey = (pixKey || '').trim().toLowerCase();
      } else {
        normalizedPixKey = (pixKey || '').trim();
      }

      // 3) Resolve taxId:
      //    - If docs key: we have it (digits-only).
      //    - Else try DICT; if missing, ask user for CPF/CNPJ with a clearer message.
      let resolvedTaxId = '';
      let resolvedName = '';

      if (keyType === 'CPF/CNPJ') {
        resolvedTaxId = onlyDigits(pixKeyDigits || pixKey);
		} else {
		  try {
		    // For phone keys, DICT on the backend expects digits-only (matches your key_value_norm)
		    const dictQuery =
		      keyType === 'Phone'
		        ? onlyDigits(normalizedPixKey) // e.g. "+5511..." -> "5511..."
		        : normalizedPixKey;

		    const res = await api().get(
		      `/pix/dict-key/${encodeURIComponent(dictQuery)}`
		    );

		    if (res?.data) {
		      resolvedName = res.data.name || '';
		      const maybe = onlyDigits(res.data.taxId || '');
		      if (
		        (maybe.length === 11 && cpfValid(maybe)) ||
		        (maybe.length === 14 && cnpjValid(maybe))
		      ) {
		        resolvedTaxId = maybe;
		      }
		    }
		  } catch {
		    // ignore DICT failures
		  }
		}


	  if (!resolvedTaxId) {
	    if (needTaxId) {
	      const typed = taxIdDigits;
	      if (!((typed.length === 11 && cpfValid(typed)) || (typed.length === 14 && cnpjValid(typed)))) {
	        setErr(
	          'Invalid document. CPF must have 11 digits and CNPJ 14 digits, and it must belong to the recipient account holder.'
	        );
	        return;
	      }
	      resolvedTaxId = typed;
	    } else {
	      setNeedTaxId(true);
	      setErr(
	        'Enter the recipient’s CPF/CNPJ to continue. The document must belong to the account holder; otherwise the payment may fail.'
	      );
	      return;
	    }
	  }


      // 4) Proceed; store normalized values
      paymentStore.setScannedPayment({
        merchantName: resolvedName || 'Unknown Merchant',
        merchantCity: '',
        transactionAmount: 0,
        pixKey: normalizedPixKey,
        assetCode: 'BRL',
        taxId: resolvedTaxId,
        bankName: '',
        txid: '',
        brCode: '',
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
		    const chosen = val as KeyType;
		    setAndroidType(chosen);
		    setKeyType(chosen);
		    // reset per-type inputs
		    setErr(null);
		    setPixKey('');
		    setPixKeyDigits('');
		    setPhoneLocal('');
		    setNeedTaxId(false);
		    setTaxIdDigits('');
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
	  <Pressable style={styles.container} onPress={Keyboard.dismiss}>
	  <KeyboardAvoidingView
	    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	    style={styles.kav}
	  >

        <View style={styles.form}>
          <Text style={styles.title}>Enter the PIX key</Text>

          {Platform.OS === 'ios' ? <SelectorIOS /> : <SelectorAndroid />}

		  {keyType === 'Phone' ? (
			<>
			  <View style={styles.phoneRow}>
			    <View style={styles.ddiCol}>
			      {ddi === 'Custom' ? (
					<TextInput
					  style={[styles.input, styles.inputCompact]}
					  placeholder="Country code (e.g., +55)"
					  placeholderTextColor="#a1a1aa"
					  value={customDdi}
					  onChangeText={(t) => {
					    setErr(null);
					    // Allow only leading + and digits
					    const cleaned = t.replace(/(?!^\+)\D/g, '');
					    setCustomDdi(cleaned.startsWith('+') ? cleaned : `+${cleaned.replace(/\+/g, '')}`);
					  }}
					  autoCapitalize="none"
					  keyboardType="phone-pad"
					  autoCorrect={false}
					/>

			      ) : (
			        <View style={styles.androidPickerBox}>
			          <Picker
			            selectedValue={ddi}
			            onValueChange={(val) => {
			              setErr(null);
			              setDdi(val as DdiOption);
			            }}
			            mode="dialog"
			            dropdownIconColor="#fff"
			            style={styles.androidPicker}
			          >
			            {DDI_OPTIONS.map((opt) => (
			              <Picker.Item key={opt} label={opt} value={opt} />
			            ))}
			          </Picker>
			        </View>
			      )}
			    </View>

			    <View style={styles.phoneCol}>
				<TextInput
				  style={[styles.input, styles.inputCompact]}
				  placeholder={placeholder}
				  placeholderTextColor="#a1a1aa"
				  value={phoneLocal}
				  onChangeText={(t) => {
				    setErr(null);
				    setPhoneLocal(onlyDigits(t));
				  }}
				  autoCapitalize="none"
				  keyboardType="number-pad"
				  autoCorrect={false}
				/>

			    </View>
			  </View>
			</>

		  ) : keyType === 'CPF/CNPJ' ? (
		    <TextInput
		      style={styles.input}
		      placeholder={placeholder}
		      placeholderTextColor="#a1a1aa"
		      value={formatCPFOrCNPJ(pixKeyDigits)}
		      onChangeText={(t) => {
		        setErr(null);
		        const d = onlyDigits(t).slice(0, 14);
		        setPixKeyDigits(d);
		        setPixKey(d); // keep display source in sync
		      }}
		      autoCapitalize="none"
		      keyboardType="number-pad"
		      autoCorrect={false}
		    />
		  ) : (
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
		  )}

		  {/* Only show CPF/CNPJ when the key itself isn't CPF/CNPJ and we couldn't resolve via DICT */}
		  {needTaxId && (
		    <TextInput
		      style={styles.input}
		      placeholder="Recipient CPF/CNPJ (numbers only)"
		      placeholderTextColor="#a1a1aa"
		      value={formatCPFOrCNPJ(taxIdDigits)}
		      onChangeText={(t) => {
		        setErr(null);
		        const d = onlyDigits(t).slice(0, 14);
		        setTaxIdDigits(d);
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
			  (keyType === 'Phone'
			    ? !( (ddi === 'Custom' ? customDdi.trim() : ddi) && onlyDigits(phoneLocal).length >= 8 )
			    : !((keyType === 'CPF/CNPJ' ? onlyDigits(pixKeyDigits || pixKey) : (pixKey || '')).trim())) ||
			  (needTaxId &&
			    !((taxIdDigits.length === 11 && cpfValid(taxIdDigits)) ||
			      (taxIdDigits.length === 14 && cnpjValid(taxIdDigits))))
			}
		  >
		  <ButtonText className="text-lg text-white">
		    {isLoading ? 'Checking…' : 'Continue'}
		  </ButtonText>
		  </Button>

		  {/* Separator between primary form and contacts */}
		  <View style={styles.separator} />

		  {/* Live Contacts (from backend) */}
		  <View style={styles.contactsWrapper}>
		    <ContactsList
		      onSelect={(t, v) => {
		        // normalize selection -> hydrate the form
		        setErr(null);
		        setNeedTaxId(false);
		        setTaxIdDigits('');

		        if (t === 'EMAIL') {
		          setKeyType('Email');
		          setAndroidType('Email');
		          setPixKey(v);
		          setPixKeyDigits('');
		          setPhoneLocal('');
			  } else if (t === 'PHONE') {
			    // Expect E.164 value like +5511999999999
			    const { ddi, ddiValue, local } = splitE164(String(v || ''));
			    setKeyType('Phone');
			    setAndroidType('Phone');
			    setDdi(ddi);
			    setCustomDdi(ddiValue);     // shown if ddi === 'Custom'
			    setPhoneLocal(local.replace(/\D/g, ''));
			    setPixKey('');
			    setPixKeyDigits('');

		        } else if (t === 'CPF' || t === 'CNPJ') {
		          setKeyType('CPF/CNPJ');
		          setAndroidType('CPF/CNPJ');
		          setPixKey('');
		          setPixKeyDigits(v.replace(/\D/g, '').slice(0, 14));
		          setPhoneLocal('');
		        } else if (t === 'EVP') {
		          setKeyType('EVP');
		          setAndroidType('EVP');
		          setPixKey(v);
		          setPixKeyDigits('');
		          setPhoneLocal('');
		        }
		      }}
		    />
		  </View>

		  
        </View>
		  </KeyboardAvoidingView>
		</Pressable>
		
		
		




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
    borderWidth: 0,
    borderColor: '#434343',
	backgroundColor: '#2e2e2e',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  selectorLabel: { color: '#a1a1aa', fontSize: 12, marginBottom: 2 },
  selectorValue: { color: '#ffffff', fontSize: 18, textAlign: 'left' },

  // Android native picker styles
  androidPickerWrapper: { marginBottom: 14 },
  androidPickerBox: {
    borderWidth: 0,
    borderColor: '#434343',
	backgroundColor: '#2e2e2e',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  androidPicker: {
    color: '#ffffff',
    width: '100%',
    height: 52,
    fontSize: 16,
  },

  input: {
    borderWidth: 0,
    borderColor: '#434343',
    borderRadius: 12,
    color: '#ffffff',
    paddingHorizontal: 16,
	backgroundColor: '#2e2e2e',
    height: 52,
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'left',
  },


  error: { color: '#f87171', marginBottom: 20, fontSize: 14, textAlign: 'center' },
  button: { marginTop: 8, height: 56, borderRadius: 12 },
  
  // Phone row (DDI + number) — compact DDI, aligned heights
  phoneRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  // fixed width so DDI doesn’t look oversized
  ddiCol: { width: 110 },
  // number field grows to fill remaining space
  phoneCol: { flex: 1 },
  // zero bottom margin when inputs are in a row
  inputCompact: {
    marginBottom: 0,
  },



  kav: {
    // intentionally no flex so the form doesn't stretch the screen
  },
  contactsWrapper: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#1c2b38',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 20,
    borderRadius: 1,
  },

});
