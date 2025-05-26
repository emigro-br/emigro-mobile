import { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // ← FORCING DARK

  useEffect(() => {
    console.log('[ThemeProvider] Forcing default theme: dark');
  }, []);

  const toggleTheme = () => {
    console.log('[ThemeProvider] Toggling theme...');
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <GluestackUIProvider mode={theme}>
        <View className={`flex-1 dark bg-background-900`}>
          {children}
        </View>
      </GluestackUIProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
