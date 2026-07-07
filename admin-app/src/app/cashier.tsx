import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { BrandHeader, ScreenShell, SectionTitle } from '@/components/coffee-ui';
import { BanAn, coffeeApi } from '@/services/api';
import { getCurrentUser, canAccess } from '@/services/session';
import type { KhuyenMai } from '@/services/api';
import * as database from '@/services/database';

export default function CashierScreen() {
  const [tables, setTables] = useState<BanAn[]>([]);
  const [promotions, setPromotions] = useState<KhuyenMai[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState('0 phút');
  const [filterStatus, setFilterStatus] = useState<'all' | 'empty' | 'occupied'>('all');

  const user = getCurrentUser();
  const hasReportPermission = canAccess('Báo cáo doanh thu');

  // Dynamic work hours timer
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

  // Load tables + promotions
  useEffect(() => {
    let isMounted = true;

    Promise.all([coffeeApi.getBanAn(), coffeeApi.getKhuyenMai?.() ?? Promise.resolve([])])
      .then(([banAnData, kmData]) => {
        if (!isMounted) return;
        setTables(banAnData);
        setPromotions(kmData as KhuyenMai[]);
        setErrorMessage('');
        setIsOffline(false);

        // Đồng bộ xuống SQLite
        database.syncBanAn(banAnData);
        database.syncKhuyenMai(kmData);
      })
      .catch(async () => {
        if (!isMounted) return;
        // Fallback sang SQLite
        const [localBanAn, localKM] = await Promise.all([
          database.getLocalBanAn(),
          database.getLocalKhuyenMai(),
        ]);

        if (localBanAn && localBanAn.length > 0) {
          const parsedTables = localBanAn.map((item) => ({
            idBan: Number((item as any).maBan),
            tenBan: (item as any).tenBan,
            trangThai: Number((item as any).trangThai),
            id: (item as any).id,
          }));
          setTables(parsedTables as BanAn[]);
          setIsOffline(true);
          setErrorMessage('');
        } else {
          setErrorMessage('Không tải được bàn ăn. Kiểm tra kết nối mạng.');
        }

        if (localKM && localKM.length > 0) {
          setPromotions(localKM as unknown as KhuyenMai[]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text selectable>Không tìm thấy phiên làm việc. Vui lòng đăng nhập lại.</Text>
      </View>
    );
  }

  // Count occupied tables
  const displayedTables = tables.filter(t => t.idBan >= 1 && t.idBan <= 10);
  const occupiedCount = displayedTables.filter(t => t.trangThai === 1).length;

  const handleResetTables = async () => {
    try {
      await coffeeApi.resetAllTables();
      const updated = await coffeeApi.getBanAn();
      setTables(updated);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể reset trạng thái bàn');
    }
  };

  const handleCompleteTable = useCallback(async (idBan: number) => {
    try {
      await coffeeApi.updateTableStatus(idBan, 0);
      const updated = await coffeeApi.getBanAn();
      setTables(updated);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái bàn');
    }
  }, []);

  const filteredTables = displayedTables.filter(t => 
    filterStatus === 'all' || 
    (filterStatus === 'empty' && t.trangThai === 0) || 
    (filterStatus === 'occupied' && t.trangThai === 1)
  );

  return (
    <ScreenShell active="home">
      <BrandHeader />

      {/* Offline banner */}
      {isOffline && (
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: '#fffbea', borderWidth: 1, borderColor: '#fde68a',
          borderRadius: 8, padding: 10, marginHorizontal: 20, marginTop: 12,
        }}>
          <Ionicons name="cloud-offline-outline" size={16} color="#b45309" />
          <Text selectable style={{ fontSize: 12, color: '#b45309', fontWeight: '600', flex: 1 }}>
            Offline — đang dùng cache ({promotions.length} KM · cập nhật khi có mạng)
          </Text>
        </View>
      )}

      {/* Banner Thông tin nhân viên (Dữ liệu động) */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View
          style={{
            backgroundColor: '#fbf8ee',
            borderWidth: 1,
            borderColor: '#e8e2d5',
            borderRadius: 12,
            padding: 16,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            marginBottom: 20,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#302d43', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name="cash-outline" size={22} color="#f9aa23" />
            </View>
            <View style={{ flex: 1 }}>
              <Text selectable style={{ fontSize: 13, color: '#9b9aa0', fontWeight: '600' }}>THU NGÂN ĐANG TRỰC</Text>
              <Text selectable style={{ fontSize: 18, fontWeight: '800', color: '#302d43' }}>
                {user.displayName || user.username}
              </Text>
            </View>
            <View style={{ backgroundColor: '#e2f5d9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text selectable style={{ fontSize: 11, color: '#4c9b24', fontWeight: '800' }}>Active</Text>
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
                {user.shift || 'Ca B'} ({user.workType || 'FULLTIME'})
              </Text>
            </View>
            <View>
              <Text selectable style={{ fontSize: 11, color: '#9b9aa0' }}>Giờ đã làm (Động)</Text>
              <Text selectable style={{ fontSize: 14, fontWeight: '700', color: '#f3545b', marginTop: 2 }}>
                {timeElapsed}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Phân quyền động: Báo cáo doanh thu */}
        <SectionTitle>Báo cáo doanh thu nhanh</SectionTitle>
        <View style={{ marginTop: 10, marginBottom: 22 }}>
          {hasReportPermission ? (
            <Link href="/reports" asChild>
              <Pressable
                style={{
                  backgroundColor: '#f1f8ff',
                  borderWidth: 1,
                  borderColor: '#cce5ff',
                  borderRadius: 10,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Ionicons name="bar-chart" size={24} color="#0056b3" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text selectable style={{ fontSize: 15, fontWeight: '700', color: '#0056b3' }}>Xem báo cáo doanh thu cửa hàng</Text>
                  <Text selectable style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Bạn có quyền xem báo cáo thống kê, biểu đồ doanh thu chi tiết.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#0056b3" />
              </Pressable>
            </Link>
          ) : (
            <View
              style={{
                backgroundColor: '#f5f5f5',
                borderWidth: 1,
                borderColor: '#e0e0e0',
                borderRadius: 10,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                opacity: 0.8,
              }}>
              <Ionicons name="lock-closed" size={24} color="#888" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text selectable style={{ fontSize: 15, fontWeight: '700', color: '#666' }}>Báo cáo doanh thu (Đã khóa)</Text>
                <Text selectable style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Chức năng này bị hạn chế bởi Admin. Hãy yêu cầu Admin kích hoạt quyền truy cập.</Text>
              </View>
            </View>
          )}
        </View>

        {/* Section Quản lý Bàn ăn / Đơn hàng */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <SectionTitle>Danh sách bàn & Đơn hàng</SectionTitle>
          <Text selectable style={{ fontSize: 12, color: '#9b9aa0', fontWeight: '600' }}>
            Đang hoạt động: {occupiedCount}/{displayedTables.length}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {['Tất cả', 'Trống', 'Có khách'].map((item, index) => {
              const statusMap = ['all', 'empty', 'occupied'] as const;
              const isActive = filterStatus === statusMap[index];
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilterStatus(statusMap[index])}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 14,
                    backgroundColor: isActive ? '#302d43' : '#f0f0f0',
                  }}>
                  <Text selectable style={{ fontSize: 12, fontWeight: isActive ? '700' : '500', color: isActive ? '#fff' : '#666' }}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={() => {
              Alert.alert('Xác nhận', 'Bạn có chắc muốn Reset tất cả các bàn về trạng thái Trống?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Reset', onPress: handleResetTables, style: 'destructive' }
              ]);
            }}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              backgroundColor: '#ffefef',
              borderWidth: 1,
              borderColor: '#fde2e2',
            }}>
            <Text selectable style={{ fontSize: 12, fontWeight: '700', color: '#f3545b' }}>Reset</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <Text selectable style={{ paddingVertical: 20, color: '#9b9aa0', textAlign: 'center' }}>Đang tải sơ đồ bàn...</Text>
        ) : errorMessage ? (
          <Text selectable style={{ paddingVertical: 20, color: '#f3545b', textAlign: 'center' }}>{errorMessage}</Text>
        ) : filteredTables.length === 0 ? (
          <Text selectable style={{ paddingVertical: 20, color: '#9b9aa0', textAlign: 'center' }}>Không có bàn nào phù hợp.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
            {filteredTables.map((table) => {
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
                    <MaterialCommunityIcons
                      name={isOccupied ? 'coffee' : 'coffee-outline'}
                      size={18}
                      color={isOccupied ? '#f3545b' : '#54cf2d'}
                    />
                  </View>
                  <Text selectable style={{ fontSize: 11, color: isOccupied ? '#f3545b' : '#54cf2d', fontWeight: '700', marginTop: 8 }}>
                    {isOccupied ? 'Có khách - Đang dùng' : 'Bàn trống'}
                  </Text>
                  {isOccupied && (
                    <Pressable
                      onPress={() => handleCompleteTable(table.idBan)}
                      style={{
                        marginTop: 8,
                        paddingVertical: 6,
                        backgroundColor: '#54cf2d',
                        borderRadius: 4,
                        alignItems: 'center',
                      }}>
                      <Text selectable style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Hoàn thành</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}
