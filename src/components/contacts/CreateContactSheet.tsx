// src/components/contacts/CreateContactSheet.tsx
import React, { useMemo, useState } from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';

import { X } from 'lucide-react-native';
import { api } from '@/services/emigro/api';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView as RNScrollView } from 'react-native';


type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (contact: any) => void;
};

type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

type PixKeyDraft = {
  id: string; // local temp id
  keyType: PixKeyType;
  keyValue: string;
  label?: string;
};

const ACCENT = '#fe0055';

// --- helpers/validation -------------------------------------------------------

const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');


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

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim());
const isEVP = (s: string) => {
  const v = (s || '').trim();
  const pure32 = /^[0-9a-f]{32}$/i.test(v);
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  return pure32 || uuid;
};
const isE164 = (v: string) => /^\+?\d{8,15}$/.test((v || '').trim());
// UI maskers for CPF/CNPJ
const formatCPF = (d: string) =>
  d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');

const formatCNPJ = (d: string) =>
  d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5');

const formatCPFOrCNPJ = (raw: string) => {
  const d = onlyDigits(raw || '');
  if (d.length <= 11) return formatCPF(d).slice(0, 14);
  return formatCNPJ(d).slice(0, 18);
};

const validateKey = (k: PixKeyDraft): string | null => {
  const val = (k.keyValue || '').trim();
  if (!val) return 'Value is required';
  switch (k.keyType) {
    case 'CPF':
      return cpfValid(val) ? null : 'Invalid CPF';
    case 'CNPJ':
      return cnpjValid(val) ? null : 'Invalid CNPJ';
    case 'EMAIL':
      return isEmail(val) ? null : 'Invalid email';
    case 'PHONE':
      return isE164(val) ? null : 'Invalid phone (use + and digits, e.g. +5511999999999)';
    case 'EVP':
      return isEVP(val) ? null : 'Invalid random key (UUID or 32 hex chars)';
    default:
      return 'Invalid type';
  }
};

// --- UI components ------------------------------------------------------------

function KeyTypeSelector({
  value,
  onChange,
}: {
  value: PixKeyType;
  onChange: (t: PixKeyType) => void;
}) {
	const options: { label: string; value: PixKeyType }[] = [
	  { label: 'CPF', value: 'CPF' },
	  { label: 'CNPJ', value: 'CNPJ' },
	  { label: 'Email', value: 'EMAIL' },
	  { label: 'Phone', value: 'PHONE' },
	  { label: 'Random Key', value: 'EVP' },
	];


  const openIOS = () => {
	const labels = options.map(o => o.label);
	ActionSheetIOS.showActionSheetWithOptions(
	  {
	    options: [...labels, 'Cancel'],
	    cancelButtonIndex: labels.length,
	    userInterfaceStyle: 'dark',
	    title: 'PIX key type',
	  },
	  (idx) => {
	    if (idx === labels.length) return;
	    onChange(options[idx].value);
	  }
	);

  };

  if (Platform.OS === 'ios') {
    return (
      <Pressable
        onPress={openIOS}
        style={{
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 10,
          backgroundColor: '#0a0a0a',
          height: 48,
          justifyContent: 'center',
          paddingHorizontal: 10,
          paddingVertical: 0,
          width: '100%', 
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            lineHeight: 20,
            paddingTop: 2,
          }}
          numberOfLines={1}
        >
          {options.find(o => o.value === value)?.label ?? value}
        </Text>
      </Pressable>
    );
  }






  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        backgroundColor: '#0a0a0a',
        height: 48,
        justifyContent: 'center',
        overflow: 'hidden', // ← prevents internal layout from drawing outside
      }}
    >
      <Picker
        selectedValue={value}
        onValueChange={(v) => onChange(v as PixKeyType)}
        dropdownIconColor="#fff"
        style={{
          color: '#fff',
          height: 55,        // ← match wrapper height
          paddingVertical: 0,
        }}
        mode="dialog"
      >
	  {options.map((o) => (
	    <Picker.Item key={o.value} label={o.label} value={o.value} />
	  ))}

      </Picker>
    </View>
  );




}

export function CreateContactSheet({ isOpen, onClose, onCreated }: Props) {
	// contact fields
	const [displayName, setDisplayName] = useState('');
	const [docDigits, setDocDigits] = useState(''); // optional CPF/CNPJ (digits only)
	const [docTouched, setDocTouched] = useState(false);
	// keys

  const [keys, setKeys] = useState<PixKeyDraft[]>([
    { id: 'k1', keyType: 'EMAIL', keyValue: '', label: '' },
  ]);

  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const SHEET_HEADER = 56;

  
  const keyErrors = useMemo(() => {
    return keys.map((k) => validateKey(k));
  }, [keys]);

  const atLeastOneValidKey = useMemo(
    () => keyErrors.some((e) => e === null),
    [keyErrors]
  );
  const docError: string | null = useMemo(() => {
    if (!docTouched && !docDigits) return null; // pristine or empty -> optional
    if (!docDigits) return null; // empty is allowed
    if (docDigits.length === 11) return cpfValid(docDigits) ? null : 'Invalid CPF';
    if (docDigits.length === 14) return cnpjValid(docDigits) ? null : 'Invalid CNPJ';
    // allow typing up to 14; show soft guidance
    return 'Enter 11-digit CPF or 14-digit CNPJ';
  }, [docDigits, docTouched]);

  const canSave =
    displayName.trim().length > 1 &&
    !saving &&
    atLeastOneValidKey &&
    // if document is filled, it must be valid
    (!docDigits ||
      (docDigits.length === 11 && cpfValid(docDigits)) ||
      (docDigits.length === 14 && cnpjValid(docDigits)));


  const addKey = () => {
    const newId = `k${Date.now()}`;
    setKeys((prev) => [...prev, { id: newId, keyType: 'EMAIL', keyValue: '', label: '' }]);
  };

  const removeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const updateKey = (id: string, patch: Partial<PixKeyDraft>) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  };

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Missing info', 'Please add at least one valid PIX key.');
      return;
    }

    try {
      setSaving(true);
      // 1) create contact
	  const res = await api().post('/contacts', {
	    displayName: displayName.trim(),
	    documentTaxId: docDigits || undefined, // optional
	  });

      const created = res.data;

      // 2) add each VALID key
      const validKeys = keys.filter((_, idx) => keyErrors[idx] === null);
      for (const k of validKeys) {
        await api().post(`/contacts/${created.id}/pix-keys`, {
          keyType: k.keyType,
          keyValue: k.keyValue.trim(),
          label: k.label?.trim() || undefined,
          // bank fields intentionally omitted for now (future)
        });
      }

      // notify parent and cleanup
	  onCreated(created);
	  setDisplayName('');
	  setDocDigits('');
	  setDocTouched(false);
	  setKeys([{ id: 'k1', keyType: 'EMAIL', keyValue: '', label: '' }]);

    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create contact.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
	  <ActionsheetContent
	    style={{
	      backgroundColor: '#0a0a0a',
	      borderTopLeftRadius: 24,
	      borderTopRightRadius: 24,
	      paddingHorizontal: 16,
	      alignSelf: 'stretch',
	      width: '100%',
	      maxHeight: '92%',
	      paddingTop: insets.top > 0 ? 8 : 12,
	      flex: 1,
	    }}
	  >

        {/* Close */}
		<Pressable
		  onPress={onClose}
		  style={{
		    position: 'absolute',
		    top: 12,            // ⬅️ back to fixed 12 like before
		    right: 16,
		    zIndex: 10,
		    width: 34,
		    height: 34,
		    borderRadius: 16,
		    backgroundColor: ACCENT,
		    alignItems: 'center',
		    justifyContent: 'center',
		  }}
		>
		  <X color="#fff" size={20} />
		</Pressable>


        {/* Drag indicator */}
        <Box style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator
              style={{ width: 80, height: 8, borderRadius: 3, backgroundColor: '#555' }}
            />
          </ActionsheetDragIndicatorWrapper>
        </Box>

		{/* Content */}
		{Platform.OS === 'ios' ? (
			<KeyboardAvoidingView
			  behavior="padding"
			  keyboardVerticalOffset={SHEET_HEADER}
			  style={{ flex: 1 }}
			>
			<RNScrollView
			  style={{ flex: 1 }}
			  contentContainerStyle={{
				flexGrow: 1,
			    paddingHorizontal: 4,
			    paddingTop: 8,
			    paddingBottom: insets.bottom + 24,
			  }}
			  contentInsetAdjustmentBehavior="automatic"
			  automaticallyAdjustKeyboardInsets={true}
			  keyboardShouldPersistTaps="handled"
			  keyboardDismissMode="interactive"
			>
		      {/* Contact info */}
		      <View
		        style={{
		          borderWidth: 1,
		          borderColor: '#e5e7eb',
		          borderRadius: 12,
		          backgroundColor: '#0a0a0a',
		          paddingHorizontal: 14,
		          height: 52,
		          justifyContent: 'center',
		          marginBottom: 12,
		        }}
		      >
		        <TextInput
		          value={displayName}
		          onChangeText={setDisplayName}
		          placeholder="Full name"
		          placeholderTextColor="#a1a1aa"
		          autoCapitalize="words"
		          autoCorrect
		          style={{ color: '#fff', fontSize: 16 }}
		          returnKeyType="next"
		        />
		      </View>

		      <View style={{ marginBottom: 4 }}>
		        <View
		          style={{
		            borderWidth: 1,
		            borderColor: docError ? '#f87171' : '#e5e7eb',
		            borderRadius: 12,
		            backgroundColor: '#0a0a0a',
		            paddingHorizontal: 14,
		            height: 52,
		            justifyContent: 'center',
		          }}
		        >
		          <TextInput
		            value={formatCPFOrCNPJ(docDigits)}
		            onChangeText={(t) => {
		              setDocTouched(true);
		              const d = onlyDigits(t).slice(0, 14);
		              setDocDigits(d);
		            }}
		            placeholder="CPF/CNPJ (optional)"
		            placeholderTextColor="#a1a1aa"
		            keyboardType="number-pad"
		            autoCapitalize="none"
		            autoCorrect={false}
		            style={{ color: '#fff', fontSize: 16 }}
		            returnKeyType="done"
		          />
		        </View>
		        {!!docError && (
		          <Text style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{docError}</Text>
		        )}
		      </View>

		      {/* PIX keys section header */}
		      <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>PIX keys</Text>

		      {/* Key rows */}
		      {keys.map((k, idx) => {
		        const error = keyErrors[idx];
		        const placeholder =
		          k.keyType === 'EMAIL'
		            ? 'name@domain.com'
		            : k.keyType === 'PHONE'
		            ? '+5511999999999'
		            : k.keyType === 'CPF'
		            ? 'CPF (11 digits)'
		            : k.keyType === 'CNPJ'
		            ? 'CNPJ (14 digits)'
		            : 'UUID or 32 hex chars';

		        return (
		          <View
		            key={k.id}
		            style={{
		              borderWidth: 1,
		              borderColor: error ? '#f87171' : '#e5e7eb',
		              borderRadius: 12,
		              backgroundColor: '#0a0a0a',
		              padding: 12,
		              marginBottom: 10,
		            }}
		          >
				  
				  
				  
				  {/* selector */}
				  <View style={{ marginBottom: 10 }}>
				    <KeyTypeSelector
				      value={k.keyType}
				      onChange={(t) =>
				        updateKey(k.id, { keyType: t, keyValue: t === 'PHONE' ? '+' : '' })
				      }
				    />
				  </View>


				  {/* selector input (with per-type mask/validation) */}
				  <View style={{ marginBottom: 10 }}>
				    <TextInput
				      value={
				        k.keyType === 'CPF' || k.keyType === 'CNPJ'
				          ? formatCPFOrCNPJ(k.keyValue)
				          : k.keyValue
				      }
				      onChangeText={(t) => {
				        if (k.keyType === 'CPF') {
				          const d = onlyDigits(t).slice(0, 11);
				          updateKey(k.id, { keyValue: d });
				        } else if (k.keyType === 'CNPJ') {
				          const d = onlyDigits(t).slice(0, 14);
				          updateKey(k.id, { keyValue: d });
					  } else if (k.keyType === 'PHONE') {
					    // allow only digits and a single leading '+', and auto-prefix '+'
					    let v = (t || '').replace(/[^\d+]/g, '');
					    v = v.replace(/(?!^)\+/g, ''); // keep only the first '+'
					    if (v.length > 0 && v[0] !== '+') v = '+' + v.replace(/\+/g, '');
					    updateKey(k.id, { keyValue: v });

				        } else {
				          updateKey(k.id, { keyValue: t });
				        }
				      }}
				      placeholder={placeholder}
				      placeholderTextColor="#a1a1aa"
				      autoCapitalize={k.keyType === 'EMAIL' ? 'none' : 'characters'}
				      autoCorrect={false}
				      keyboardType={
				        k.keyType === 'EMAIL'
				          ? 'email-address'
				          : k.keyType === 'PHONE'
				          ? 'phone-pad'
				          : k.keyType === 'CPF' || k.keyType === 'CNPJ'
				          ? 'number-pad'
				          : 'default'
				      }
				      style={{
				        color: '#fff',
				        fontSize: 16,
				        lineHeight: 20,
				        borderWidth: 1,
				        borderColor: '#e5e7eb',
				        borderRadius: 10,
				        paddingHorizontal: 12,
				        paddingVertical: 10,
				        height: 48,
				        textAlignVertical: 'center',
				        width: '100%',
				      }}
				    />
				  </View>
				  {k.keyType === 'PHONE' &&
				    k.keyValue.trim().length > 0 &&
				    !k.keyValue.trim().startsWith('+55') && (
				      <Text style={{ color: '#fbbf24', fontSize: 12, marginBottom: 6 }}>
				        This phone doesn’t start with +55 (Brazil). Make sure the DDI is correct.
				      </Text>
				  )}


				  {/* label */}
				  <View style={{ marginBottom: 6 }}>
				    <TextInput
				      value={k.label}
				      onChangeText={(t) => updateKey(k.id, { label: t })}
				      placeholder="Label (optional, e.g., Work)"
				      placeholderTextColor="#a1a1aa"
				      style={{
				        color: '#fff',
				        fontSize: 14,
				        borderBottomWidth: 1,
				        borderColor: '#e5e7eb',
				        borderRadius: 0,
				        paddingHorizontal: 0,
				        paddingBottom: 6,
				        height: 40,
				        justifyContent: 'center',
				      }}
				    />
				  </View>

				  {/* delete link */}
				  <Pressable onPress={() => removeKey(k.id)} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
				    <Text style={{ color: '#ef4444', textDecorationLine: 'underline' }}>Delete key</Text>
				  </Pressable>

				  {!!error && (
				    <Text style={{ color: '#f87171', marginTop: 6, fontSize: 12 }}>{error}</Text>
				  )}

		          </View>
		        );
		      })}

		      {/* Add key button */}
		      <Pressable
		        onPress={addKey}
		        style={{
		          height: 46,
		          borderRadius: 10,
		          borderWidth: 1,
		          borderColor: ACCENT,
		          backgroundColor: 'transparent',
		          alignItems: 'center',
		          justifyContent: 'center',
		          marginBottom: 16,
		        }}
		      >
		        <Text style={{ color: ACCENT, fontWeight: '700' }}>+ Add PIX key</Text>
		      </Pressable>

		      {/* Save */}
		      <Pressable
		        disabled={!canSave}
		        onPress={handleSave}
		        style={{
		          height: 52,
		          borderRadius: 500,
		          alignItems: 'center',
		          justifyContent: 'center',
		          backgroundColor: canSave ? ACCENT : '#7a213f',
		        }}
		      >
		        {saving ? (
		          <ActivityIndicator color="#fff" />
		        ) : (
		          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Create</Text>
		        )}
		      </Pressable>

		      {/* tiny helper */}
		      {!atLeastOneValidKey && (
		        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
		          Add at least one valid PIX key to continue.
		        </Text>
		      )}
		    </RNScrollView>
		  </KeyboardAvoidingView>
		) : (
			<ScrollView
			  style={{ width: '100%' }}
			  contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: insets.bottom + 28, paddingTop: 8 }}
			  keyboardShouldPersistTaps="handled"
			>
		    {/* Contact info */}
		    <View
		      style={{
		        borderWidth: 1,
		        borderColor: '#e5e7eb',
		        borderRadius: 12,
		        backgroundColor: '#0a0a0a',
		        paddingHorizontal: 14,
		        height: 52,
		        justifyContent: 'center',
		        marginBottom: 12,
		      }}
		    >
		      <TextInput
		        value={displayName}
		        onChangeText={setDisplayName}
		        placeholder="Full name"
		        placeholderTextColor="#a1a1aa"
		        autoCapitalize="words"
		        autoCorrect
		        style={{ color: '#fff', fontSize: 16 }}
		        returnKeyType="next"
		      />
		    </View>

		    <View style={{ marginBottom: 4 }}>
		      <View
		        style={{
		          borderWidth: 1,
		          borderColor: docError ? '#f87171' : '#e5e7eb',
		          borderRadius: 12,
		          backgroundColor: '#0a0a0a',
		          paddingHorizontal: 14,
		          height: 52,
		          justifyContent: 'center',
		        }}
		      >
		        <TextInput
		          value={formatCPFOrCNPJ(docDigits)}
		          onChangeText={(t) => {
		            setDocTouched(true);
		            const d = onlyDigits(t).slice(0, 14);
		            setDocDigits(d);
		          }}
		          placeholder="CPF/CNPJ (optional)"
		          placeholderTextColor="#a1a1aa"
		          keyboardType="number-pad"
		          autoCapitalize="none"
		          autoCorrect={false}
		          style={{ color: '#fff', fontSize: 16 }}
		          returnKeyType="done"
		        />
		      </View>
		      {!!docError && (
		        <Text style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{docError}</Text>
		      )}
		    </View>

		    {/* PIX keys section header */}
		    <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>PIX keys</Text>

		    {/* Key rows */}
		    {/** ——— the same key rows block from above stays unchanged ——— */}
		    {keys.map((k, idx) => {
		      const error = keyErrors[idx];
		      const placeholder =
		        k.keyType === 'EMAIL'
		          ? 'name@domain.com'
		          : k.keyType === 'PHONE'
		          ? '+5511999999999'
		          : k.keyType === 'CPF'
		          ? 'CPF (11 digits)'
		          : k.keyType === 'CNPJ'
		          ? 'CNPJ (14 digits)'
		          : 'UUID or 32 hex chars';

		      return (
		        <View
		          key={k.id}
		          style={{
		            borderWidth: 1,
		            borderColor: error ? '#f87171' : '#e5e7eb',
		            borderRadius: 12,
		            backgroundColor: '#0a0a0a',
		            padding: 12,
		            marginBottom: 10,
		          }}
		        >
				{/* selector */}
				<View style={{ marginBottom: 10 }}>
				  <KeyTypeSelector
				    value={k.keyType}
				    onChange={(t) =>
				      updateKey(k.id, { keyType: t, keyValue: t === 'PHONE' ? '+' : '' })
				    }
				  />
				</View>


				{/* selector input (with per-type mask/validation) */}
				<View style={{ marginBottom: 10 }}>
				  <TextInput
				    value={
				      k.keyType === 'CPF' || k.keyType === 'CNPJ'
				        ? formatCPFOrCNPJ(k.keyValue)
				        : k.keyValue
				    }
				    onChangeText={(t) => {
				      if (k.keyType === 'CPF') {
				        const d = onlyDigits(t).slice(0, 11);
				        updateKey(k.id, { keyValue: d });
				      } else if (k.keyType === 'CNPJ') {
				        const d = onlyDigits(t).slice(0, 14);
				        updateKey(k.id, { keyValue: d });
					} else if (k.keyType === 'PHONE') {
					  // allow only digits and a single leading '+', and auto-prefix '+'
					  let v = (t || '').replace(/[^\d+]/g, '');
					  v = v.replace(/(?!^)\+/g, ''); // keep only the first '+'
					  if (v.length > 0 && v[0] !== '+') v = '+' + v.replace(/\+/g, '');
					  updateKey(k.id, { keyValue: v });

				      } else {
				        updateKey(k.id, { keyValue: t });
				      }
				    }}
				    placeholder={placeholder}
				    placeholderTextColor="#a1a1aa"
				    autoCapitalize={k.keyType === 'EMAIL' ? 'none' : 'characters'}
				    autoCorrect={false}
				    keyboardType={
				      k.keyType === 'EMAIL'
				        ? 'email-address'
				        : k.keyType === 'PHONE'
				        ? 'phone-pad'
				        : k.keyType === 'CPF' || k.keyType === 'CNPJ'
				        ? 'number-pad'
				        : 'default'
				    }
				    style={{
				      color: '#fff',
				      fontSize: 16,
				      lineHeight: 20,
				      borderWidth: 1,
				      borderColor: '#e5e7eb',
				      borderRadius: 10,
				      paddingHorizontal: 12,
				      paddingVertical: 10,
				      height: 48,
				      textAlignVertical: 'center',
				      width: '100%',
				    }}
				  />
				</View>
				{k.keyType === 'PHONE' &&
				  k.keyValue.trim().length > 0 &&
				  !k.keyValue.trim().startsWith('+55') && (
				    <Text style={{ color: '#fbbf24', fontSize: 12, marginBottom: 6 }}>
				      This phone doesn’t start with +55 (Brazil). Make sure the DDI is correct.
				    </Text>
				)}


				{/* label */}
				<View style={{ marginBottom: 6 }}>
				  <TextInput
				    value={k.label}
				    onChangeText={(t) => updateKey(k.id, { label: t })}
				    placeholder="Label (optional, e.g., Work)"
				    placeholderTextColor="#a1a1aa"
				    style={{
				      color: '#fff',
				      fontSize: 14,
				      borderBottomWidth: 1,
				      borderColor: '#e5e7eb',
				      borderRadius: 0,
				      paddingHorizontal: 0,
				      paddingBottom: 6,
				      height: 40,
				      justifyContent: 'center',
				    }}
				  />
				</View>

				{/* delete link */}
				<Pressable onPress={() => removeKey(k.id)} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
				  <Text style={{ color: '#ef4444', textDecorationLine: 'underline' }}>Delete key</Text>
				</Pressable>

				{!!error && (
				  <Text style={{ color: '#f87171', marginTop: 6, fontSize: 12 }}>{error}</Text>
				)}

		        </View>
		      );
		    })}

		    {/* Add key button */}
		    <Pressable
		      onPress={addKey}
		      style={{
		        height: 46,
		        borderRadius: 10,
		        borderWidth: 1,
		        borderColor: ACCENT,
		        backgroundColor: 'transparent',
		        alignItems: 'center',
		        justifyContent: 'center',
		        marginBottom: 16,
		      }}
		    >
		      <Text style={{ color: ACCENT, fontWeight: '700' }}>+ Add PIX key</Text>
		    </Pressable>

		    {/* Save */}
		    <Pressable
		      disabled={!canSave}
		      onPress={handleSave}
		      style={{
		        height: 52,
		        borderRadius: 500,
		        alignItems: 'center',
		        justifyContent: 'center',
		        backgroundColor: canSave ? ACCENT : '#7a213f',
		      }}
		    >
		      {saving ? (
		        <ActivityIndicator color="#fff" />
		      ) : (
		        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Create</Text>
		      )}
		    </Pressable>

		    {!atLeastOneValidKey && (
		      <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
		        Add at least one valid PIX key to continue.
		      </Text>
		    )}
		  </ScrollView>
		)}


      </ActionsheetContent>
    </Actionsheet>
  );
}
