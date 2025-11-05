// src/components/contacts/ChoosePixKeySheet.tsx
import React from 'react';
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
import { Pressable, View } from 'react-native';
import { X } from 'lucide-react-native';
import AvatarInitials from '@/components/common/AvatarInitials';
import { Contact, ContactPixKey } from '@/services/emigro/contacts';
import { displayKeyType } from '@/services/emigro/contacts';
import EditContactSheet from '@/components/contacts/EditContactSheet';

const ACCENT = '#fe0055';

type Props = {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onPick: (k: ContactPixKey) => void;
  /** Called when contact is edited or deleted. If deleted, receives null. */
  onEdited?: (contact: Contact | null) => void;
};

export default function ChoosePixKeySheet({ open, contact, onClose, onPick, onEdited }: Props) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [localContact, setLocalContact] = React.useState<Contact | null>(contact);

  // keep local copy in sync when sheet opens or contact prop changes
  React.useEffect(() => {
    if (open) setLocalContact(contact ?? null);
  }, [contact, open]);

  // Local maskers for showing CPF/CNPJ prettily
  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
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

	  const maskedDoc = React.useMemo(() => {
	    const raw = (localContact as any)?.documentTaxId || '';
	    const d = onlyDigits(raw);
	    if (!d) return '';
	    if (d.length <= 11) return formatCPF(d).slice(0, 14);
	    return formatCNPJ(d).slice(0, 18);
	  }, [localContact]);


  return (
    <Actionsheet isOpen={open} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          maxHeight: '85%',
          backgroundColor: '#0a0a0a',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingHorizontal: 16,
        }}
      >
        {/* Close */}
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

        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 28, paddingTop: 20 }}
        >
		<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
		  <AvatarInitials name={localContact?.displayName || 'Contact'} size={40} roundness={20} />
		  <View style={{ flex: 1 }}>
		    <Text size="lg" weight="bold">
		      {localContact?.displayName || 'Contact'}
		    </Text>
		    {!!maskedDoc && (
		      <Text size="sm" style={{ color: '#9ca3af', marginTop: 2 }}>
		        {maskedDoc}
		      </Text>
		    )}
		  </View>
		  {/* Edit button */}
		  {!!localContact && (
		    <Pressable
		      onPress={() => setEditOpen(true)}
		      style={{
		        borderWidth: 1,
		        borderColor: '#e5e7eb',
		        borderRadius: 10,
		        height: 36,
		        paddingHorizontal: 12,
		        alignItems: 'center',
		        justifyContent: 'center',
		        backgroundColor: '#0a0a0a',
		      }}
		    >
		      <Text style={{ color: '#fff', fontWeight: '700' }}>Edit</Text>
		    </Pressable>
		  )}
		</View>



          <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>PIX keys</Text>

		  {(localContact?.pixKeys ?? []).map((k) => {
		    const typeLabel = displayKeyType(k.keyType);
		    const sub = k.label ? ` • ${k.label}` : '';
		    return (
		      <Pressable
		        key={k.id}
		        onPress={() => onPick(k)}
		        style={{
		          borderWidth: 0,
		          borderColor: '#e5e7eb',
		          borderRadius: 12,
		          backgroundColor: '#2e2e2e',
		          padding: 12,
		          marginBottom: 10,
		        }}
		      >
		        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
		          {typeLabel}
		          {sub}
		        </Text>
		        <Text style={{ color: '#9ca3af', marginTop: 4 }}>{String(k.keyValue ?? '')}</Text>
		      </Pressable>
		    );
		  })}

		  {(!localContact?.pixKeys || localContact.pixKeys.length === 0) && (
		    <Text style={{ color: '#9ca3af' }}>This contact has no PIX keys yet.</Text>
		  )}

        </ScrollView>
		      </ActionsheetContent>
		      {/* Edit Contact Sheet */}
			  <EditContactSheet
			    isOpen={editOpen}
			    contact={localContact}
			    onClose={() => setEditOpen(false)}
			    onUpdated={(updated) => {
			      // updated === null when deleted (per our Edit sheet's Delete action)
			      setEditOpen(false);
			      if (updated && updated.id) {
			        setLocalContact(updated);
			        onEdited?.(updated);
			      } else {
			        // deleted
			        onEdited?.(null);
			        onClose(); // close this ChoosePixKeySheet
			      }
			    }}
			  />
		    </Actionsheet>
		  );
		}
