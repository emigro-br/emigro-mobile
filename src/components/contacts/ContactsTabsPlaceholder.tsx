import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Pure UI placeholder (no data yet).
 * - Tabs header: Contacts | Recents (Contacts first & default)
 * - Minimal, dark, no background panels; lines between items
 * - Does NOT manage keyboard at all (parent decides)
 */
export default function ContactsTabsPlaceholder() {
  const [activeTab, setActiveTab] = useState<'Contacts' | 'Recents'>('Contacts');

  return (
    <View style={styles.wrapper}>
      {/* Tabs header */}
      <View style={styles.tabsRow}>
        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('Contacts')}
        >
          <Text style={[styles.tabText, activeTab === 'Contacts' && styles.tabTextActive]}>
            Contacts
          </Text>
          <View style={[styles.underline, activeTab === 'Contacts' && styles.underlineActive]} />
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('Recents')}
        >
          <Text style={[styles.tabText, activeTab === 'Recents' && styles.tabTextActive]}>
            Recents
          </Text>
          <View style={[styles.underline, activeTab === 'Recents' && styles.underlineActive]} />
        </Pressable>
      </View>

      {/* Placeholder list */}
      <View style={styles.list}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.item}>
            <View style={styles.avatar} />
            <View style={styles.lines}>
              <View style={styles.lineShort} />
              <View style={styles.lineLong} />
            </View>
            <View style={styles.dot} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
	wrapper: {
	  paddingBottom: 12,
	},
  tabsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 12,
    marginBottom: 8,
  },
  tabBtn: { alignItems: 'center' },
  tabText: { color: '#9ca3af', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#ffffff' },
  underline: { marginTop: 6, height: 2, width: 56, backgroundColor: 'transparent' },
  // neutral gray underline (no blue)
  underlineActive: { backgroundColor: '#fe0055' },

  list: { marginTop: 4 },


  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1f2937' },
  lines: { flex: 1, gap: 6 },
  lineShort: { height: 10, width: '40%', backgroundColor: '#1f2937', borderRadius: 4 },
  lineLong: { height: 10, width: '70%', backgroundColor: '#1f2937', borderRadius: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827' },
});
