import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CoffeeLogo, palette } from '@/components/coffee-ui';

export default function LoginScreen() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [secure, setSecure] = useState(true);

  const handleLogin = () => {
    if (username.trim().toLowerCase() === 'admin' && password === '123456') {
      router.replace('/admin');
      return;
    }

    alert('Sai tài khoản hoặc mật khẩu');
  };

  return (
    <ImageBackground
      source={require('@/assets/images/logo-glow.png')}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: 56,
          paddingBottom: 36,
        }}>
        <View style={{ alignItems: 'flex-end', paddingRight: 12 }}>
          <CoffeeLogo size={112} />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text selectable style={{ fontSize: 44, lineHeight: 52, fontWeight: '900', color: palette.ink }}>
            Welcome
          </Text>
          <Text selectable style={{ marginTop: 2, color: '#b8b8bd', fontSize: 12, fontWeight: '700' }}>
            THE COFFEE HOUSE
          </Text>
        </View>

        <View style={{ marginTop: 42, gap: 14 }}>
          <TextInput
            placeholder="Username"
            placeholderTextColor="#b4b1b1"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={{
              height: 38,
              borderBottomWidth: 1,
              borderBottomColor: '#bcb7b4',
              color: palette.ink,
              fontWeight: '600',
            }}
          />
          <View>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#b4b1b1"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              style={{
                height: 38,
                borderBottomWidth: 1,
                borderBottomColor: '#bcb7b4',
                color: palette.ink,
                paddingRight: 34,
                fontWeight: '600',
              }}
            />
            <Pressable
              accessibilityLabel="Hiện mật khẩu"
              onPress={() => setSecure((value) => !value)}
              style={{ position: 'absolute', right: 0, top: 8, padding: 4 }}>
              <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={18} color="#b5b0af" />
            </Pressable>
            <Text selectable style={{ marginTop: 4, color: '#b8b8bd', fontSize: 10 }}>
              Must contain a number and at least 6 characters
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => ({
            marginTop: 46,
            height: 42,
            backgroundColor: palette.ink,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.82 : 1,
          })}>
          <Text selectable style={{ color: '#fff', fontFamily: 'serif', fontSize: 16, fontWeight: '900' }}>
            Sign In
          </Text>
        </Pressable>

        <View style={{ position: 'absolute', left: -7, top: 330, transform: [{ rotate: '18deg' }] }}>
          <BeanCluster />
        </View>
        <View style={{ position: 'absolute', right: -9, bottom: 120, transform: [{ rotate: '34deg' }] }}>
          <BeanCluster />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

function BeanCluster() {
  return (
    <View style={{ width: 74, height: 60 }}>
      {[0, 1, 2, 3].map((item) => (
        <View
          key={item}
          style={{
            position: 'absolute',
            width: item % 2 ? 36 : 24,
            height: item % 2 ? 18 : 30,
            left: [2, 28, 24, 48][item],
            top: [2, 9, 32, 30][item],
            borderRadius: 18,
            backgroundColor: palette.brown,
            transform: [{ rotate: item % 2 ? '13deg' : '-35deg' }],
          }}
        />
      ))}
    </View>
  );
}
