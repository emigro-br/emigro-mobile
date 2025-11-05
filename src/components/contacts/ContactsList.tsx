import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Contact, ContactPixKey, PixKeyType, listContacts, displayKeyType } from '@/services/emigro/contacts';
import { api } from '@/services/emigro/api';
import { Star } from 'lucide-react-native';

import { CreateContactSheet } from '@/components/contacts/CreateContactSheet';
import AvatarInitials from '@/components/common/AvatarInitials';
import ChoosePixKeySheet from '@/components/contacts/ChoosePixKeySheet';


type Props = {
  /** Called when the user chose a concrete PIX key */
  onSelect: (keyType: PixKeyType, keyValue: string) => void;
};

export default function ContactsList({ onSelect }: Props) {
  //const [tab, setTab] = useState<'Contacts' | 'Favorites' | 'Recents'>('Contacts');
  const [tab, setTab] = useState<'Contacts' | 'Favorites' >('Contacts');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<Contact[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContact, setSheetContact] = useState<Contact | null>(null);

  const toggleFavorite = async (contactId: string, next: boolean) => {
    // optimistic update
    setData((prev) => prev.map((c) => (c.id === contactId ? { ...c, isFavorite: next } : c)));
    try {
      await api().patch(`/contacts/${contactId}`, { isFavorite: next });
    } catch (e: any) {
      // rollback on error
      setData((prev) => prev.map((c) => (c.id === contactId ? { ...c, isFavorite: !next } : c)));
      Alert.alert('Error', e?.message || 'Failed to update favorite.');
    }
  };

  
  const fetchData = async () => {
    setLoading(true);
    setErr(null);
    try {
      const list = await listContacts();
      setData(list);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderRow = ({ item }: { item: Contact }) => {
    const keyCount = item.pixKeys?.length ?? 0;
    const subtitle =
      item.nickname && item.nickname.trim().length > 0
        ? item.nickname
        : keyCount > 0
        ? `${keyCount} ${keyCount === 1 ? 'key' : 'keys'}`
        : 'No keys';

    const fav = !!item.isFavorite;

    return (
      <View style={styles.row}>
        {/* Whole row press opens the key chooser */}
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}
          onPress={() => {
            const keys = item.pixKeys ?? [];
            if (keys.length === 0) {
              Alert.alert('No PIX keys', 'This contact has no PIX keys yet.');
              return;
            }
            setSheetContact(item);
            setSheetOpen(true);
          }}
        >
          <AvatarInitials name={item.displayName || 'Contact'} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{item.displayName || 'Unnamed contact'}</Text>
            <Text style={styles.rowSub}>{subtitle}</Text>
          </View>
        </Pressable>

        {/* Favorite star */}
        <Pressable
          onPress={() => toggleFavorite(item.id, !fav)}
          hitSlop={8}
          style={styles.favoriteBtn}
        >
          <Star
            size={20}
            color="#fe0055"
            // When filled, set fill to color; when not, 'none'
            fill={fav ? '#fe0055' : 'none'}
          />
        </Pressable>
      </View>
    );
  };




  const [createOpen, setCreateOpen] = useState(false);

  const listHeader = useMemo(
    () => (
      <View style={styles.tabsRow}>
        <Pressable style={styles.tabBtn} onPress={() => setTab('Contacts')}>
          <Text style={[styles.tabText, tab === 'Contacts' && styles.tabTextActive]}>Contacts</Text>
          <View style={[styles.underline, tab === 'Contacts' && styles.underlineActive]} />
        </Pressable>

        <Pressable style={styles.tabBtn} onPress={() => setTab('Favorites')}>
          <Text style={[styles.tabText, tab === 'Favorites' && styles.tabTextActive]}>Favorites</Text>
          <View style={[styles.underline, tab === 'Favorites' && styles.underlineActive]} />
        </Pressable>

        {/*<Pressable style={styles.tabBtn} onPress={() => setTab('Recents')}>
          <Text style={[styles.tabText, tab === 'Recents' && styles.tabTextActive]}>Recents</Text>
          <View style={[styles.underline, tab === 'Recents' && styles.underlineActive]} />
        </Pressable>*/}
      </View>
    ),
    [tab],
  );




  if (loading) {
    return (
      <View style={styles.container}>
        {listHeader}
        <ActivityIndicator />
      </View>
    );
  }

  if (err) {
    return (
      <View style={styles.container}>
        {listHeader}
        <Text style={styles.errorText}>{err}</Text>
        <Pressable style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {listHeader}

		{tab === 'Recents' ? (
		  <View>
		    <Text style={styles.emptyText}>No recent transfers yet.</Text>
		  </View>
		) : tab === 'Favorites' ? (
		  <FlatList
		    data={data.filter((c) => !!c.isFavorite)}
		    keyExtractor={(it) => it.id}
		    renderItem={renderRow}
		    
		    scrollEnabled={false}
		    ListEmptyComponent={<Text style={styles.emptyText}>You have no favorite contacts yet.</Text>}
		  />
		) : (
		  <>
		    <FlatList
		      data={data}
		      keyExtractor={(it) => it.id}
		      renderItem={renderRow}
		      
		      scrollEnabled={false}
		      ListEmptyComponent={<Text style={styles.emptyText}>You have no contacts yet.</Text>}
		    />
		    <Pressable style={styles.createBtn} onPress={() => setCreateOpen(true)}>
		      <Text style={styles.createBtnText}>+ Create Contact</Text>
		    </Pressable>
		  </>
		)}


		<ChoosePixKeySheet
		  open={sheetOpen}
		  contact={sheetContact}
		  onClose={() => setSheetOpen(false)}
		  onPick={(k) => {
		    setSheetOpen(false);
		    onSelect(k.keyType, k.keyValue);
		  }}
		  onEdited={(updated) => {
		    if (updated && updated.id) {
		      // replace in list + keep sheet open with new data
		      setData((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
		      setSheetContact(updated);
		    } else {
		      // deleted
		      if (sheetContact?.id) {
		        setData((prev) => prev.filter((c) => c.id !== sheetContact.id));
		      }
		      setSheetContact(null);
		      setSheetOpen(false);
		    }
		  }}
		/>


      </View>

      {/* Create Contact sheet */}
      <CreateContactSheet
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          // Refresh the list after creating
          fetchData();
        }}
      />
    </>
  );


}

const styles = StyleSheet.create({
  container: { paddingBottom: 12 },
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 0, // width must match parent padding
  },
  tabBtn: { alignItems: 'center' },
  tabText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  underline: { marginTop: 6, height: 2, width: 56, backgroundColor: 'transparent' },
  underlineActive: { backgroundColor: '#fe0055' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f2937' },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rowSub: { color: '#9ca3af', fontSize: 13, marginTop: 2 },
  favoriteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  separator: { height: 1, backgroundColor: '#1f2937' },

  errorText: { color: '#fca5a5', marginTop: 8 },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
  },
  retryText: { color: '#fff' },
  emptyText: { color: '#9ca3af', marginTop: 8 },

  // Android sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetCard: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sheetItem: { paddingVertical: 10 },
  sheetItemText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sheetItemSub: { color: '#9ca3af', fontSize: 13 },
  createBtn: {
    borderWidth: 1,
    borderColor: '#fe0055',
    borderRadius: 12,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 18,
  },
  createBtnText: {
	
    color: '#fe0055',
    fontWeight: '500',
    fontSize: 13,
  },

});
