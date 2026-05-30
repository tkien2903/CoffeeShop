import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';

const roles = [
  {
    title: 'Admin',
    meta: '2 người · Tất cả quyền',
    icon: 'crown-outline',
    rows: ['Quản lý nhân viên', 'Báo cáo doanh thu', 'Quản lý mã QR', 'Cài đặt hệ thống'],
    enabled: [true, true, true, true],
  },
  {
    title: 'Quản lý ca',
    meta: '5 người',
    icon: 'account-badge-outline',
    rows: ['Quản lý nhân viên', 'Báo cáo doanh thu', 'Quản lý mã QR', 'Cài đặt hệ thống'],
    enabled: [true, true, false, false],
  },
  {
    title: 'Nhân viên',
    meta: '12 người',
    icon: 'account-outline',
    rows: ['Quản lý nhân viên', 'Báo cáo doanh thu', 'Xem đơn hàng', 'Quản lý mã QR'],
    enabled: [false, false, true, false],
  },
];

export default function RolesScreen() {
  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ paddingHorizontal: 10, paddingTop: 18, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#111" />
          <Text selectable style={{ flex: 1, marginLeft: 6, fontWeight: '800', fontSize: 14 }}>
            Phân quyền truy cập
          </Text>
          <Pressable
            style={{
              height: 30,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 7,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
            <Ionicons name="add" size={13} color="#111" />
            <Text selectable style={{ fontSize: 12 }}>
              Thêm vai trò ↗
            </Text>
          </Pressable>
        </View>

        {roles.map((role) => (
          <View
            key={role.title}
            style={{
              borderWidth: 1,
              borderColor: '#e2e0dc',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#fff',
            }}>
            <View
              style={{
                height: 38,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f4f1e9',
              }}>
              <MaterialCommunityIcons name={role.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={15} color={palette.orange} />
              <Text selectable style={{ flex: 1, marginLeft: 8, color: palette.ink, fontWeight: '900', fontSize: 13 }}>
                {role.title}
              </Text>
              <Text selectable style={{ color: palette.ink, fontSize: 11 }}>
                {role.meta}
              </Text>
            </View>
            {role.rows.map((row, index) => (
              <View
                key={row}
                style={{
                  minHeight: 32,
                  paddingHorizontal: 13,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderColor: '#eeeeee',
                }}>
                <PermissionIcon label={row} />
                <Text selectable style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#20202a' }}>
                  {row}
                </Text>
                <SwitchPill on={role.enabled[index]} />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

function PermissionIcon({ label }: { label: string }) {
  if (label.includes('doanh thu')) {
    return <Ionicons name="bar-chart-outline" size={14} color="#555" />;
  }
  if (label.includes('QR')) {
    return <MaterialCommunityIcons name="qrcode" size={14} color="#555" />;
  }
  if (label.includes('đơn hàng')) {
    return <Ionicons name="receipt-outline" size={14} color="#555" />;
  }
  if (label.includes('hệ thống')) {
    return <Ionicons name="settings-outline" size={14} color="#555" />;
  }
  return <Ionicons name="people-outline" size={14} color="#555" />;
}

function SwitchPill({ on }: { on: boolean }) {
  return (
    <View
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        padding: 2,
        backgroundColor: on ? palette.orange : '#dedede',
        alignItems: on ? 'flex-end' : 'flex-start',
      }}>
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' }} />
    </View>
  );
}
