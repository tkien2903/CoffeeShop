import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { getCurrentUser, clearSession, canAccess } from '@/services/session';

type MoreMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap | keyof typeof MaterialCommunityIcons.glyphMap;
  href: '/employees' | '/qr' | '/roles' | '/reports' | '/inventory' | '/admin' | '/history' | '/media';
  permission: string;
  material?: boolean;
};

const menu: MoreMenuItem[] = [
  { label: 'Quản lý nhân viên', icon: 'person-outline', href: '/employees', permission: 'Quản lý nhân viên' },
  { label: 'Quản lý mã QR', icon: 'qrcode', href: '/qr', permission: 'Quản lý mã QR', material: true },
  { label: 'Phân quyền truy cập', icon: 'pencil-ruler', href: '/roles', permission: 'Cài đặt hệ thống', material: true },
  { label: 'Báo cáo doanh thu', icon: 'book-open-variant', href: '/reports', permission: 'Báo cáo doanh thu', material: true },
  { label: 'Quản lý kho', icon: 'settings-outline', href: '/inventory', permission: 'Quản lý kho' },
  { label: 'Lịch sử đơn hàng', icon: 'file-document-edit-outline', href: '/history', permission: 'Xem đơn hàng', material: true },
  { label: 'Multimedia Demo', icon: 'camera-burst', href: '/media', permission: 'Cài đặt hệ thống', material: true },
];

export default function MoreScreen() {
  const router = useRouter();
  const user = getCurrentUser();

  const formatLoginTime = (loginAtStr?: string) => {
    if (!loginAtStr) return 'Đang trực';
    try {
      const date = new Date(loginAtStr);
      return `Login: ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Đang trực';
    }
  };

  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ height: 3, backgroundColor: '#9a45ff' }} />
      
      {/* Thông tin nhân viên động */}
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
        <Text selectable style={{ flex: 1, fontSize: 17, color: palette.ink, fontWeight: '700' }}>
          {user?.displayName || user?.username || 'Chưa đăng nhập'}
        </Text>
        <View style={{ width: 140, gap: 3 }}>
          <Text selectable style={{ fontSize: 12, fontFamily: 'serif', color: palette.ink, fontWeight: '600' }}>
            Mã NV: {user ? String(user.employeeCode).padStart(4, '0') : 'N/A'}
          </Text>
          <Text selectable style={{ fontSize: 12, fontFamily: 'serif', color: palette.ink, fontWeight: '600' }}>
            {user ? formatLoginTime(user.loginAt) : 'N/A'}
          </Text>
          <Text selectable style={{ fontSize: 12, fontFamily: 'serif', color: palette.ink, fontWeight: '600' }}>
            Ca trực: {user?.shift || 'N/A'} ({user?.workType || 'N/A'})
          </Text>
        </View>
      </View>

      {/* Menu danh mục lọc theo phân quyền động */}
      {menu
        .filter((item) => canAccess(item.permission))
        .map((item, index) => (
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

      {/* Đăng xuất - Xóa session */}
      <Pressable
        onPress={async () => {
          await clearSession();
          router.replace('/');
        }}
        style={({ pressed }) => ({
          width: 116,
          height: 65,
          borderWidth: 2,
          borderColor: '#ff4753',
          borderRadius: 7,
          alignSelf: 'center',
          marginTop: 22,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}>
        <Text selectable style={{ color: '#f04b52', fontWeight: '900', fontSize: 17 }}>
          Logout
        </Text>
      </Pressable>
    </ScreenShell>
  );
}
