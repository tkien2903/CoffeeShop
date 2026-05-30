import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="products" />
        <Stack.Screen name="more" />
        <Stack.Screen name="qr" />
        <Stack.Screen name="employees" />
        <Stack.Screen name="roles" />
      </Stack>
    </ThemeProvider>
  );
}
