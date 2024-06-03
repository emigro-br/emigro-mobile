import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="confirm"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
