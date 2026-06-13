import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { hydrateSession, homeRouteFor } from '@/services/session';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrateSession().then((user) => {
      setReady(true);
      if (user && segments[0] === 'index') {
        router.replace(homeRouteFor(user));
      }
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#302d43" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="cashier" />
        <Stack.Screen name="staff" />
        <Stack.Screen name="products" />
        <Stack.Screen name="more" />
        <Stack.Screen name="qr" />
        <Stack.Screen name="employees" />
        <Stack.Screen name="roles" />
        <Stack.Screen name="reports" />
        <Stack.Screen name="inventory" />
      </Stack>
    </ThemeProvider>
  );
}
