// src/components/common/AvatarInitials.tsx
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

type Props = {
  name: string;
  size?: number;
  roundness?: number;
};

/** Deterministic pastel-ish color by name */
function colorFromName(name: string) {
  const s = (name || 'U').toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 45%, 28%)`; // dark pastel for dark UI
}

export default function AvatarInitials({ name, size = 36, roundness = 18 }: Props) {
  const initials = useMemo(() => {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const bg = useMemo(() => colorFromName(name), [name]);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: roundness,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>{initials}</Text>
    </View>
  );
}
