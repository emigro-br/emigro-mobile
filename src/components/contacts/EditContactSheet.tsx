// src/components/contacts/EditContactSheet.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { Contact, ContactPixKey } from '@/services/emigro/contacts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView as RNScrollView } from 'react-native';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null; // must include pixKeys
  onUpdated: (contact: any) => void;
};

type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

type PixKeyDraft = {
  id: string; // id from backend or local temp id prefix "new-"
  keyType: PixKeyType;
  keyValue: string;
  label?: string;
  _origin?: 'existing' | 'new'; // internal
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
    const labels = options.map((o) => o.label);
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
      },
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
        overflow: 'hidden',
      }}
    >
      <Picker
        selectedValue={value}
        onValueChange={(v) => onChange(v as PixKeyType)}
        dropdownIconColor="#fff"
        style={{
          color: '#fff',
          height: 55,
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

// --- Edit Sheet ---------------------------------------------------------------

export default function EditContactSheet({ isOpen, onClose, contact, onUpdated }: Props) {
  // guard for initial data
  const initial = useRef<Contact | null>(null);
  useEffect(() => {
    initial.current = contact ?? null;
  }, [contact]);

  // contact fields
  const [displayName, setDisplayName] = useState('');
  const [docDigits, setDocDigits] = useState(''); // digits only
  const [docTouched, setDocTouched] = useState(false);

  // keys
  const [keys, setKeys] = useState<PixKeyDraft[]>([]);
  const [saving, setSaving] = useState(false);


  const SHEET_HEADER = 56;
  const insets = useSafeAreaInsets();
  
  // hydrate when sheet opens / contact changes
  useEffect(() => {
    if (!contact) return;
    setDisplayName(contact.displayName || '');
    // backend may store digits only; keep digits only here
    const rawDoc = (contact as any).documentTaxId || '';
    setDocDigits(onlyDigits(String(rawDoc || '')));

    const drafts: PixKeyDraft[] = (contact.pixKeys || []).map((k) => ({
      id: k.id,
      keyType: k.keyType as PixKeyType,
      keyValue: String(k.keyValue ?? ''),
      label: k.label || '',
      _origin: 'existing',
    }));
    setKeys(drafts.length ? drafts : [{ id: `new-${Date.now()}`, keyType: 'EMAIL', keyValue: '', label: '', _origin: 'new' }]);
    setDocTouched(false);
  }, [contact]);

  const keyErrors = useMemo(() => keys.map((k) => validateKey(k)), [keys]);

  const atLeastOneValidKey = useMemo(
    () => keyErrors.some((e) => e === null),
    [keyErrors],
  );

  const docError: string | null = useMemo(() => {
    if (!docTouched && !docDigits) return null; // optional
    if (!docDigits) return null;
    if (docDigits.length === 11) return cpfValid(docDigits) ? null : 'Invalid CPF';
    if (docDigits.length === 14) return cnpjValid(docDigits) ? null : 'Invalid CNPJ';
    return 'Enter 11-digit CPF or 14-digit CNPJ';
  }, [docDigits, docTouched]);

  const canSave =
    displayName.trim().length > 1 &&
    !saving &&
    atLeastOneValidKey &&
    (!docDigits ||
      (docDigits.length === 11 && cpfValid(docDigits)) ||
      (docDigits.length === 14 && cnpjValid(docDigits)));

  const addKey = () => {
    const newId = `new-${Date.now()}`;
    setKeys((prev) => [...prev, { id: newId, keyType: 'EMAIL', keyValue: '', label: '', _origin: 'new' }]);
  };

  const removeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const updateKey = (id: string, patch: Partial<PixKeyDraft>) => {
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  };

  // diff helpers
  const originalKeys = useMemo<ContactPixKey[]>(
    () => (initial.current?.pixKeys ?? []) as ContactPixKey[],
    [initial.current],
  );

  const findOriginal = (id: string) => originalKeys.find((k) => k.id === id);

  const handleSave = async () => {
    if (!contact) return;
    if (!canSave) {
      Alert.alert('Missing info', 'Please fix the highlighted fields.');
      return;
    }

    try {
      setSaving(true);

      // 1) Update base contact (name + document)
      // If your API uses a different verb/path, tell me and I’ll patch surgically.
      await api().patch(`/contacts/${contact.id}`, {
        displayName: displayName.trim(),
        documentTaxId: docDigits || null,
      });

      // 2) Keys reconciliation (added/removed/changed)
      const currentById = new Map(keys.map((k) => [k.id, k]));
      const originalById = new Map((originalKeys || []).map((k) => [k.id, k]));

      const added = keys.filter((k) => k._origin === 'new' && (keyErrors[keys.indexOf(k)] === null));
      const removed = originalKeys.filter((ok) => !currentById.has(ok.id));

      const changed = keys
        .filter((k) => k._origin !== 'new' && originalById.has(k.id))
        .filter((k) => {
          const ok = originalById.get(k.id)!;
          return (
            (ok.keyType as PixKeyType) !== k.keyType ||
            String(ok.keyValue ?? '') !== k.keyValue ||
            String(ok.label ?? '') !== String(k.label ?? '')
          );
        });

      // delete removed
      for (const r of removed) {
        await api().delete(`/contacts/${contact.id}/pix-keys/${r.id}`);
      }

      // re-create changed (delete + add)
      for (const c of changed) {
        await api().delete(`/contacts/${contact.id}/pix-keys/${c.id}`);
        await api().post(`/contacts/${contact.id}/pix-keys`, {
          keyType: c.keyType,
          keyValue: c.keyValue.trim(),
          label: c.label?.trim() || undefined,
        });
      }

      // create added
      for (const a of added) {
        await api().post(`/contacts/${contact.id}/pix-keys`, {
          keyType: a.keyType,
          keyValue: a.keyValue.trim(),
          label: a.label?.trim() || undefined,
        });
      }

	  // 3) Refetch, then normalize the payload to the client shape before returning
	  const refreshed = await api().get(`/contacts/${contact.id}`);
	  const raw = refreshed.data || {};

	  const normalized = {
	    id: raw.id,
	    displayName: raw.displayName ?? raw.display_name ?? '',
	    nickname: raw.nickname ?? null,
	    avatarUrl: raw.avatarUrl ?? raw.avatar_url ?? null,
	    notes: raw.notes ?? null,
	    isFavorite: !!(raw.isFavorite ?? raw.is_favorite),
	    // the API may return document_tax_id; keep camelCase for the app
	    documentTaxId: raw.documentTaxId ?? raw.document_tax_id ?? null,
	    // keep any extra fields if your Contact type has them; otherwise safe to omit
	    pixKeys: (raw.pixKeys ?? raw.pix_keys ?? []).map((k: any) => ({
	      id: k.id,
	      keyType: k.keyType ?? k.key_type,      // normalize
	      keyValue: k.keyValue ?? k.key_value,   // normalize
	      label: k.label ?? null,
	      isPrimary: !!(k.isPrimary ?? k.is_primary),
	      bankCode: k.bankCode ?? k.bank_code ?? null,
	      bankName: k.bankName ?? k.bank_name ?? null,
	      accountType: k.accountType ?? k.account_type ?? null,
	      branchNumber: k.branchNumber ?? k.branch_number ?? null,
	      accountNumber: k.accountNumber ?? k.account_number ?? null,
	    })),
	  };

	  onUpdated(normalized);
	  onClose();

    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to update contact.');
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
		      <Text size="xl" weight="semibold" style={{ marginBottom: 12 }}>
		        Edit Contact
		      </Text>

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
		            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
		              <View style={{ width: 130 }}>
		                <KeyTypeSelector
		                  value={k.keyType}
		                  onChange={(t) => updateKey(k.id, { keyType: t, keyValue: '' })}
		                />
		              </View>

					  <View style={{ flex: 1, minWidth: 0 }}>
					    <TextInput
					      value={k.keyValue}
					      onChangeText={(t) => updateKey(k.id, { keyValue: t })}
					      placeholder={placeholder}
					      placeholderTextColor="#a1a1aa"
					      autoCapitalize={k.keyType === 'EMAIL' ? 'none' : 'characters'}
					      autoCorrect={false}
					      keyboardType={
					        k.keyType === 'EMAIL'
					          ? 'email-address'
					          : k.keyType === 'PHONE'
					          ? 'phone-pad'
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
					        // ↓ ensure the input can actually grow on iOS
					        flexGrow: 1,
					        flexShrink: 1,
					        minWidth: 0,
					        width: '100%',
					      }}
					    />
					  </View>


		              <Pressable
		                onPress={() => removeKey(k.id)}
		                hitSlop={12}
		                style={{
		                  width: 36,
		                  height: 36,
		                  borderRadius: 18,
		                  alignItems: 'center',
		                  justifyContent: 'center',
		                  backgroundColor: '#141414',
		                  borderWidth: 1,
		                  borderColor: '#303030',
		                }}
		              >
		                <Text style={{ color: '#bbb', fontSize: 16 }}>×</Text>
		              </Pressable>
		            </View>

		            <View style={{ marginTop: 8 }}>
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
		                  paddingBottom: 0,
		                  height: 40,
		                  justifyContent: 'center',
		                }}
		              />
		            </View>

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
		          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Save</Text>
		        )}
		      </Pressable>

		      {/* Danger zone */}
		      <Pressable
		        onPress={() => {
		          if (!contact) return;
		          Alert.alert(
		            'Delete contact',
		            'This will remove the contact and all its PIX keys. This action cannot be undone.',
		            [
		              { text: 'Cancel', style: 'cancel' },
		              {
		                text: 'Delete',
		                style: 'destructive',
		                onPress: async () => {
		                  try {
		                    setSaving(true);
		                    await api().delete(`/contacts/${contact.id}`);
		                    onUpdated && onUpdated(null as any);
		                    onClose();
		                  } catch (e: any) {
		                    Alert.alert('Error', e?.message ?? 'Failed to delete contact.');
		                  } finally {
		                    setSaving(false);
		                  }
		                },
		              },
		            ],
		          );
		        }}
		        style={{
		          marginTop: 16,
		          alignItems: 'center',
		          justifyContent: 'center',
		          backgroundColor: 'transparent',
		          paddingVertical: 6,
		        }}
		      >
		        <Text
		          style={{
		            color: '#fe0055',
		            fontWeight: '600',
		            fontSize: 14,
		            textDecorationLine: 'underline',
		          }}
		        >
		          Delete Contact
		        </Text>
		      </Pressable>
		    </RNScrollView>
		  </KeyboardAvoidingView>
		) : (
			<ScrollView
			  style={{ width: '100%' }}
			  contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: insets.bottom + 28, paddingTop: 8 }}
			  keyboardShouldPersistTaps="handled"
			>
		    <Text size="xl" weight="semibold" style={{ marginBottom: 12 }}>
		      Edit Contact
		    </Text>

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
		          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
		            <View style={{ width: 130 }}>
		              <KeyTypeSelector
		                value={k.keyType}
		                onChange={(t) => updateKey(k.id, { keyType: t, keyValue: '' })}
		              />
		            </View>

		            <View style={{ flex: 1 }}>
		              <TextInput
		                value={k.keyValue}
		                onChangeText={(t) => updateKey(k.id, { keyValue: t })}
		                placeholder={placeholder}
		                placeholderTextColor="#a1a1aa"
		                autoCapitalize={k.keyType === 'EMAIL' ? 'none' : 'characters'}
		                autoCorrect={false}
		                keyboardType={
		                  k.keyType === 'EMAIL'
		                    ? 'email-address'
		                    : k.keyType === 'PHONE'
		                    ? 'phone-pad'
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
		                }}
		              />
		            </View>

		            <Pressable
		              onPress={() => removeKey(k.id)}
		              hitSlop={12}
		              style={{
		                width: 36,
		                height: 36,
		                borderRadius: 18,
		                alignItems: 'center',
		                justifyContent: 'center',
		                backgroundColor: '#141414',
		                borderWidth: 1,
		                borderColor: '#303030',
		              }}
		            >
		              <Text style={{ color: '#bbb', fontSize: 16 }}>×</Text>
		            </Pressable>
		          </View>

		          <View style={{ marginTop: 8 }}>
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
		                paddingBottom: 0,
		                height: 40,
		                justifyContent: 'center',
		              }}
		            />
		          </View>

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
		        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Save</Text>
		      )}
		    </Pressable>

		    {/* Danger zone */}
		    <Pressable
		      onPress={() => {
		        if (!contact) return;
		        Alert.alert(
		          'Delete contact',
		          'This will remove the contact and all its PIX keys. This action cannot be undone.',
		          [
		            { text: 'Cancel', style: 'cancel' },
		            {
		              text: 'Delete',
		              style: 'destructive',
		              onPress: async () => {
		                try {
		                  setSaving(true);
		                  await api().delete(`/contacts/${contact.id}`);
		                  onUpdated && onUpdated(null as any);
		                  onClose();
		                } catch (e: any) {
		                  Alert.alert('Error', e?.message ?? 'Failed to delete contact.');
		                } finally {
		                  setSaving(false);
		                }
		              },
		            },
		          ],
		        );
		      }}
		      style={{
		        marginTop: 16,
		        alignItems: 'center',
		        justifyContent: 'center',
		        backgroundColor: 'transparent',
		        paddingVertical: 6,
		      }}
		    >
		      <Text
		        style={{
		          color: '#fe0055',
		          fontWeight: '600',
		          fontSize: 14,
		          textDecorationLine: 'underline',
		        }}
		      >
		        Delete Contact
		      </Text>
		    </Pressable>
		  </ScrollView>
		)}


      </ActionsheetContent>
    </Actionsheet>
  );
}
