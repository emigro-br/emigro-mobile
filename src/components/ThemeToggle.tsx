// /src/components/ThemeToggle.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/__utils__/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Pressable onPress={toggleTheme} className="p-2 rounded-full bg-primary-500">
      <Text className="text-white text-sm">{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
    </Pressable>
  );
};
