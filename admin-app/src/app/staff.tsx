import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { BrandHeader, ScreenShell, SectionTitle } from '@/components/coffee-ui';
import { BanAn, coffeeApi } from '@/services/api';
import { getCurrentUser, canAccess } from '@/services/session';

export default function StaffScreen() {
  const [tables, setTables] = useState<BanAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeElapsed, setTimeElapsed] = useState('0 phút');

  const user = getCurrentUser();
  const hasQrPermission = canAccess('Quản lý mã QR');
  const hasInventoryPermission = canAccess('Quản lý kho');

  // Dynamic hours timer
  useEffect(() => {
    if (!user || !user.loginAt) return;

    const updateElapsedTime = () => {
      const loginDate = new Date(user.loginAt);
      const now = new Date();
      const diffMs = now.getTime() - loginDate.getTime();
      if (diffMs < 0) {
        setTimeElapsed('0 phút');
        return;
      }
      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours > 0) {
        setTimeElapsed(`${hours} giờ ${mins} phút`);
      } else {
        setTimeElapsed(`${mins} phút`);
      }
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Load tables
  useEffect(() => {
    let isMounted = true;
    coffeeApi
      .getBanAn()
      .then((data) => {
        if (isMounted) {
          setTables(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được bàn ăn');
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

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text selectable>Không tìm thấy phiên làm việc. Vui lòng đăng nhập lại.</Text>
      </View>
    );
  }

  const vacantCount = tables.filter(t => t.trangThai === 0).length;

  return (
    <ScreenShell active="home">
      <BrandHeader />

      {/* Banner thông tin nhân viên phục vụ */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View
          style={{
            backgroundColor: '#f5efff',
            borderWidth: 1,
            borderColor: '#e2d5f8',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            marginBottom: 20,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#9049ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name="walk-outline" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable style={{ fontSize: 13, color: '#9049ff', fontWeight: '600' }}>NHÂN VIÊN PHỤC VỤ</Text>
              <Text selectable style={{ fontSize: 18, fontWeight: '800', color: '#302d43' }}>
                {user.displayName || user.username}
              </Text>
            </View>
            <View style={{ backgroundColor: '#e2f5d9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text selectable style={{ fontSize: 11, color: '#4c9b24', fontWeight: '800' }}>On Duty</Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <View>
              <Text selectable style={{ fontSize: 11, color: '#9b9aa0' }}>Mã nhân viên</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#302d43', marginTop: 2 }}>
                NV{String(user.employeeCode).padStart(4, '0')}
              </Text>
            </View>
            <View>
              <Text selectable style={{ fontSize: 11, color: '#9b9aa0' }}>Ca trực</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#302d43', marginTop: 2 }}>
                {user.shift || 'Ca B'} ({user.workType || 'PARTTIME'})
              </Text>
            </View>
            <View>
              <Text selectable style={{ fontSize: 11, color: '#9b9aa0' }}>Thời gian trực</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#f3545b', marginTop: 2 }}>
                {timeElapsed}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Phân quyền động của Phục vụ: Quản lý mã QR, Quản lý kho */}
        <SectionTitle>Tính năng phục vụ</SectionTitle>
        <View style={{ gap: 10, marginTop: 10, marginBottom: 22 }}>
          {/* Card Quản lý mã QR */}
          {hasQrPermission ? (
            <Link href="/qr" asChild>
              <Pressable
                style={{
                  backgroundColor: '#fff7f2',
                  borderWidth: 1,
                  borderColor: '#ffd8c2',
                  borderRadius: 10,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Ionicons name="qr-code-outline" size={22} color="#ff7b32" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#ff7b32' }}>Quản lý mã QR bàn ăn</Text>
                  <Text selectable style={{ fontSize: 11, color: '#666' }}>Xem và cung cấp mã QR cho khách tại bàn.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ff7b32" />
              </Pressable>
            </Link>
          ) : (
            <View
              style={{
                backgroundColor: '#f5f5f5',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 10,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: 0.75,
              }}>
              <Ionicons name="lock-closed" size={22} color="#888" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#777' }}>Quản lý mã QR (Đã khóa)</Text>
                <Text selectable style={{ fontSize: 11, color: '#888' }}>Liên hệ Admin để cấp quyền xem mã QR bàn.</Text>
              </View>
            </View>
          )}

          {/* Card Quản lý kho */}
          {hasInventoryPermission ? (
            <Link href="/inventory" asChild>
              <Pressable
                style={{
                  backgroundColor: '#f3faf4',
                  borderWidth: 1,
                  borderColor: '#ccebd5',
                  borderRadius: 10,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Ionicons name="cube-outline" size={22} color="#3aa85c" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#3aa85c' }}>Kiểm tra kho nguyên liệu</Text>
                  <Text selectable style={{ fontSize: 11, color: '#666' }}>Theo dõi mức tồn kho và các mặt hàng sắp hết.</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#3aa85c" />
              </Pressable>
            </Link>
          ) : (
            <View
              style={{
                backgroundColor: '#f5f5f5',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 10,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: 0.75,
              }}>
              <Ionicons name="lock-closed" size={22} color="#888" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#777' }}>Kiểm tra kho nguyên liệu (Đã khóa)</Text>
                <Text selectable style={{ fontSize: 11, color: '#888' }}>Liên hệ Admin để cấp quyền theo dõi tồn kho.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Sơ đồ bàn hỗ trợ phục vụ */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionTitle>Sơ đồ bàn & Đón khách</SectionTitle>
          <Text selectable style={{ fontSize: 12, color: '#9b9aa0', fontWeight: '600' }}>
            Bàn trống: {vacantCount}/{tables.length}
          </Text>
        </View>

        {isLoading ? (
          <Text selectable style={{ paddingVertical: 20, color: '#9b9aa0', textAlign: 'center' }}>Đang tải bàn ăn...</Text>
        ) : errorMessage ? (
          <Text selectable style={{ paddingVertical: 20, color: '#f3545b', textAlign: 'center' }}>{errorMessage}</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
            {tables.map((table) => {
              const isOccupied = table.trangThai === 1;
              return (
                <View
                  key={table.id ?? table.idBan}
                  style={{
                    width: '48%',
                    backgroundColor: isOccupied ? '#fef0f0' : '#f0f9eb',
                    borderWidth: 1,
                    borderColor: isOccupied ? '#fde2e2' : '#e1f3d8',
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 80,
                    justifyContent: 'space-between',
                  }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text selectable style={{ fontSize: 14, fontWeight: '800', color: '#302d43' }}>
                      {table.tenBan ?? `Bàn ${table.idBan}`}
                    </Text>
                    <Ionicons
                      name={isOccupied ? 'people' : 'people-outline'}
                      size={18}
                      color={isOccupied ? '#f3545b' : '#54cf2d'}
                    />
                  </View>
                  <Text selectable style={{ fontSize: 11, color: isOccupied ? '#f3545b' : '#54cf2d', fontWeight: '700', marginTop: 8 }}>
                    {isOccupied ? 'Đang có khách' : 'Bàn trống (Sẵn sàng)'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}
