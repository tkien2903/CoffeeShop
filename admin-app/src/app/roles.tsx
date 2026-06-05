import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { RolePermission, coffeeApi } from '@/services/api';

export default function RolesScreen() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getRoles()
      .then((data) => {
        if (isMounted) {
          setRoles(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được phân quyền');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

        {isLoading ? (
          <StatusText>Đang tải phân quyền...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : (
          roles.map((role) => <RoleCard key={role.tenVaiTro} role={role} />)
        )}
      </View>
    </ScreenShell>
  );
}

function RoleCard({ role }: { role: RolePermission }) {
  return (
    <View
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
        <MaterialCommunityIcons name={role.tenVaiTro === 'Admin' ? 'crown-outline' : 'account-badge-outline'} size={15} color={palette.orange} />
        <Text selectable style={{ flex: 1, marginLeft: 8, color: palette.ink, fontWeight: '900', fontSize: 13 }}>
          {role.tenVaiTro}
        </Text>
        <Text selectable style={{ color: palette.ink, fontSize: 11 }}>
          {role.soNguoi} người
        </Text>
      </View>
      {Object.entries(role.quyen).map(([permission, enabled]) => (
        <View
          key={permission}
          style={{
            minHeight: 32,
            paddingHorizontal: 13,
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: 1,
            borderColor: '#eeeeee',
          }}>
          <PermissionIcon label={permission} />
          <Text selectable style={{ flex: 1, marginLeft: 8, fontSize: 13, color: '#20202a' }}>
            {permission}
          </Text>
          <SwitchPill on={enabled} />
        </View>
      ))}
    </View>
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
  if (label.includes('kho')) {
    return <Ionicons name="cube-outline" size={14} color="#555" />;
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

function StatusText({ children, tone = 'default' }: React.PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 18, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}
