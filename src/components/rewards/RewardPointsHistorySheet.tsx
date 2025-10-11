// src/components/rewards/RewardPointsHistorySheet.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, FlatList, Dimensions } from 'react-native';
import { api } from '@/services/emigro/api';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { X } from 'lucide-react-native';


type LedgerItem = {
  id: string;
  userId: string;
  points: number;
  reason: string;
  createdAt: string;
  metadata?: Record<string, any> | null;
};

type LedgerResponse = {
  items: LedgerItem[];
  nextCursor?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const RewardPointsHistorySheet: React.FC<Props> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const PAGE_SIZE = 20;
  const SHEET_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.85);
  
  const fetchPage = async (opts?: { next?: boolean }) => {
    if (loading || loadingMore) return;
    opts?.next ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await api().get<LedgerResponse>('/rewards/ledger', {
        params: { limit: PAGE_SIZE, cursor: opts?.next ? cursor || undefined : undefined },
      });
      const data = res.data;
      if (!opts?.next) {
        setItems(Array.isArray(data.items) ? data.items : []);
      } else {
        setItems((prev) => [...prev, ...(Array.isArray(data.items) ? data.items : [])]);
      }
      const next = data.nextCursor ?? null;
      setCursor(next);
      setHasMore(!!next);
    } catch (e) {
      // swallow and keep UI responsive
    } finally {
      opts?.next ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setItems([]);
      setCursor(null);
      setHasMore(true);
      fetchPage();
    }
  }, [isOpen]);

  const renderItem = ({ item }: { item: LedgerItem }) => {
    // Be tolerant to backend shapes: points | delta | amount | value | metadata.points*
    const anyItem: any = item;
    const ptsRaw =
      anyItem?.points ??
      anyItem?.pointsDelta ??
      anyItem?.delta ??
      anyItem?.amount ??
      anyItem?.value ??
      anyItem?.metadata?.points ??
      anyItem?.metadata?.pointsDelta ??
      0;

    const ptsNum = Number(ptsRaw);
    const safeNum = Number.isFinite(ptsNum) ? ptsNum : 0;

    // createdAt or created_at
    const createdIso: string = anyItem?.createdAt ?? anyItem?.created_at ?? new Date().toISOString();
    const date = new Date(createdIso);
    const dateStr =
      `${date.getDate().toString().padStart(2, '0')}/` +
      `${(date.getMonth() + 1).toString().padStart(2, '0')}/` +
      `${date.getFullYear()} ` +
      `${date.getHours().toString().padStart(2, '0')}:` +
      `${date.getMinutes().toString().padStart(2, '0')}`;

    const isPositive = safeNum >= 0;
    const pointsStr = `${isPositive ? '+' : ''}${safeNum.toFixed(2)} EP`;

    const reason =
      anyItem?.reason ??
      anyItem?.type ??
      anyItem?.metadata?.reason ??
      'Points';

    return (
      <View
        style={{
          backgroundColor: '#2e2e2e',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          marginBottom: 10,
        }}
      >
        {/* Top row: reason (left) + points (right) */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700', flex: 1 }} numberOfLines={1}>
            {reason}
          </Text>
          <Text
            style={{
              color: isPositive ? '#7CFC00' : '#ff6961',
              fontWeight: '800',
              fontSize: 16,
              marginLeft: 12,
            }}
          >
            {pointsStr}
          </Text>
        </View>

        {/* Second line: date */}
        <Text style={{ color: '#bbb', marginTop: 6, fontSize: 12 }}>{dateStr}</Text>
      </View>
    );
  };



  const ListFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ paddingVertical: 10 }}>
        {loadingMore ? (
          <ActivityIndicator size="small" color="#aaa" />
        ) : (
          <Pressable
            onPress={() => fetchPage({ next: true })}
            style={{
              alignSelf: 'center',
              backgroundColor: '#fe0055',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Load more</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
	  <ActionsheetContent
	    style={{
	      backgroundColor: '#0a0a0a',
	      borderTopLeftRadius: 24,
	      borderTopRightRadius: 24,
	      maxHeight: SHEET_MAX_HEIGHT,
	      paddingTop: 8,
	    }}
	  >
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
            backgroundColor: '#fe0055',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X color="#fff" size={20} />
        </Pressable>

        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator
            style={{
              width: 80,
              height: 8,
              borderRadius: 3,
              backgroundColor: '#555',
            }}
          />
        </ActionsheetDragIndicatorWrapper>

		<View style={{ width: '100%', paddingHorizontal: 16, paddingBottom: 8, marginTop: 16 }}>

          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10 }}>
            Points history
          </Text>

          {loading && items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="small" color="#aaa" />
              <Text style={{ color: '#aaa', marginTop: 8 }}>Loading…</Text>
            </View>
          ) : items.length === 0 ? (
            <Text style={{ color: '#ccc', marginTop: 12 }}>No entries yet.</Text>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(it) => it.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListFooterComponent={ListFooter}
            />
          )}
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};
