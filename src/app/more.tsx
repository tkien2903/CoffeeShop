import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';

type MoreMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  href: '/employees' | '/qr' | '/roles' | '/admin';
  material?: boolean;
};

const menu: MoreMenuItem[] = [
  { label: 'Quản lý nhân viên', icon: 'person-outline', href: '/employees' },
  { label: 'Quản lý mã QR', icon: 'qrcode', href: '/qr', material: true },
  { label: 'Phân quyền truy cập', icon: 'pencil-ruler', href: '/roles', material: true },
  { label: 'Báo cáo doanh thu', icon: 'book-open-variant', href: '/admin', material: true },
  { label: 'Quản lý kho', icon: 'settings-outline', href: '/admin' },
  { label: 'Lịch sử đơn hàng', icon: 'file-document-edit-outline', href: '/admin', material: true },
];

export default function MoreScreen() {
  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ height: 3, backgroundColor: '#9a45ff' }} />
      <View
        style={{
          minHeight: 82,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff0b8',
        }}>
        <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: '#0d0d0d', marginRight: 10 }}>
          <View
            style={{
              position: 'absolute',
              right: -2,
              bottom: 0,
              width: 15,
              height: 15,
              borderRadius: 8,
              backgroundColor: '#55d72b',
            }}
          />
        </View>
        <Text selectable style={{ flex: 1, fontSize: 17, color: palette.ink }}>
          Admin
        </Text>
        <View style={{ width: 120, gap: 5 }}>
          <Text selectable style={{ fontSize: 16, fontFamily: 'serif', color: palette.ink }}>
            Mã NV: 0001
          </Text>
          <Text selectable style={{ fontSize: 16, fontFamily: 'serif', color: palette.ink }}>
            Login: 15h00
          </Text>
          <Text selectable style={{ fontSize: 16, fontFamily: 'serif', color: palette.ink }}>
            Ca B
          </Text>
        </View>
      </View>

      {menu.map((item, index) => (
        <Link key={item.label} href={item.href} asChild>
          <Pressable
            style={{
              height: 57,
              paddingHorizontal: 18,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: index % 2 === 0 ? '#dedede' : '#f2eeee',
            }}>
            {item.material ? (
              <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={27} color="#464646" />
            ) : (
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={28} color="#151515" />
            )}
            <Text selectable style={{ marginLeft: 18, fontSize: 16, fontFamily: 'serif', color: palette.ink }}>
              {item.label}
            </Text>
          </Pressable>
        </Link>
      ))}

      <Pressable
        style={{
          width: 116,
          height: 65,
          borderWidth: 2,
          borderColor: '#ff4753',
          borderRadius: 7,
          alignSelf: 'center',
          marginTop: 22,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text selectable style={{ color: '#f04b52', fontWeight: '900', fontSize: 17 }}>
          Logout
        </Text>
      </Pressable>
    </ScreenShell>
  );
}
