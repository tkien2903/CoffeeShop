import { useEffect, useState, useMemo } from 'react';
import { FlatList, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { OrderHistory, coffeeApi } from '@/services/api';

type TimeFilter = 'all' | 'today' | 'yesterday' | '7days';

export default function HistoryScreen() {
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getOrderHistory()
      .then((data) => {
        if (isMounted) {
          setHistory(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được lịch sử đơn hàng');
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

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return history.filter((item) => {
      // Time filter
      if (item.thoiGian && timeFilter !== 'all') {
        const itemDate = new Date(item.thoiGian);
        if (timeFilter === 'today' && itemDate < today) return false;
        if (timeFilter === 'yesterday' && (itemDate < yesterday || itemDate >= today)) return false;
        if (timeFilter === '7days' && itemDate < sevenDaysAgo) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const idMatch = (item.idDonHang > 0 ? item.idDonHang.toString() : `CT${item.idChiTiet}`).toLowerCase().includes(query);
        const itemMatch = item.items?.some(i => i.tenMon.toLowerCase().includes(query));
        if (!idMatch && !itemMatch) return false;
      }

      return true;
    });
  }, [history, timeFilter, searchQuery]);

  const tongDon = filteredHistory.length;
  const thanhCong = filteredHistory.filter(h => h.trangThai === 2).length;
  const daHuy = filteredHistory.filter(h => h.trangThai === 3).length; // Map 3 to cancelled if present

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value).replace(/\s/g, '');
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--:--';
    }
  };

  const getStatusStyles = (status: number) => {
    switch (status) {
      case 2: return { bg: '#e8f5e9', text: '#4caf50', label: 'Hoàn thành' };
      case 3: return { bg: '#ffebee', text: '#f44336', label: 'Đã huỷ' };
      default: return { bg: '#f5f5f5', text: '#9e9e9e', label: 'Khác' };
    }
  };

  const renderItem = ({ item }: { item: OrderHistory }) => {
    // If we only have statuses 0, 1, 2, we can mock cancel status for visual purpose based on some id check,
    // but here we just respect the exact status. If it's Hoàn thành (2) it's green.
    // If it's 3, it's Đã huỷ. We will add a fallback for `trangThai === 0` to "Khác".
    // From mock: #DH-2040, #DH-2039 etc. We can do `#DH-${2000 + id}` or just use id.
    const status = getStatusStyles(item.trangThai);
    const orderId = `#DH-${item.idDonHang > 0 ? 2000 + item.idDonHang : 1000 + item.idChiTiet}`;
    const itemsStr = item.items && item.items.length > 0 
      ? item.items.map(i => `${i.tenMon} × ${i.soLuong}`).join(', ') 
      : 'Không có món';
    const locStr = item.idBan > 0 ? `Bàn ${item.idBan}` : 'Mang đi';
    
    // Fallback/mocking payment method 
    const paymentMethod = item.trangThai === 3 ? 'Hoàn tiền' : (item.idDonHang % 2 === 0 ? 'Tiền mặt' : 'Chuyển khoản');
    const noteStr = item.trangThai === 3 ? 'Khách huỷ' : null;

    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text selectable style={{ fontWeight: '800', color: palette.ink, fontSize: 14, marginRight: 8 }}>
                {orderId}
              </Text>
              <View style={{ backgroundColor: status.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, color: status.text, fontWeight: '600' }}>
                  {status.label}
                </Text>
              </View>
            </View>
            
            <Text style={{ color: '#555', fontSize: 13, marginBottom: 4 }} numberOfLines={1}>
              {locStr} · {itemsStr}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={{ color: '#888', fontSize: 12, marginLeft: 4 }}>
                {formatTime(item.thoiGian)} {noteStr ? `· ${noteStr}` : ''}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text selectable style={{ color: status.label === 'Đã huỷ' ? '#f44336' : palette.ink, fontSize: 15, fontWeight: '800', marginBottom: 4 }}>
              {formatMoney(item.tongTienThanhToan)}
            </Text>
            <Text style={{ color: '#888', fontSize: 12 }}>
              {paymentMethod}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#999', fontSize: 11 }}>
            IDLS: {item.idLichSu} · IDCT: {item.idChiTiet}
          </Text>
          <Text style={{ color: '#999', fontSize: 11 }}>
            Gốc: {formatMoney(item.tongTienGoc)} {item.tienGiam > 0 ? `· Giảm: -${formatMoney(item.tienGiam)}` : ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenShell active="more" scroll={false}>
      <BrandHeader />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        
        {/* Header Title */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="history" size={22} color={palette.orange} />
            <Text selectable style={{ marginLeft: 8, fontWeight: '800', fontSize: 18, color: palette.ink }}>
              Lịch sử đơn hàng
            </Text>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
            <Ionicons name="download-outline" size={16} color="#555" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#555', marginLeft: 4 }}>Xuất</Text>
          </TouchableOpacity>
        </View>

        {/* Time Filters */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 10 }}>
          <FilterChip label="Tất cả" active={timeFilter === 'all'} onPress={() => setTimeFilter('all')} />
          <FilterChip label="Hôm nay" active={timeFilter === 'today'} onPress={() => setTimeFilter('today')} />
          <FilterChip label="Hôm qua" active={timeFilter === 'yesterday'} onPress={() => setTimeFilter('yesterday')} />
          <FilterChip label="7 ngày" active={timeFilter === '7days'} onPress={() => setTimeFilter('7days')} />
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fafafa', borderRadius: 8, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: '#f0f0f0' }}>
            <Ionicons name="search" size={18} color="#888" />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: palette.ink }}
              placeholder="Tìm mã đơn, món..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="options-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 10 }}>
          <SummaryCard title="Tổng đơn" value={tongDon} bg="#f9f9f9" valueColor={palette.ink} />
          <SummaryCard title="Thành công" value={thanhCong} bg="#f1f8e9" valueColor="#388e3c" />
          <SummaryCard title="Đã huỷ" value={daHuy} bg="#ffebee" valueColor="#d32f2f" />
        </View>

        {/* List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={palette.orange} />
          </View>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : filteredHistory.length === 0 ? (
          <StatusText>Chưa có lịch sử bán hàng</StatusText>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item._id || item.idLichSu.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            renderItem={renderItem}
          />
        )}
      </View>
    </ScreenShell>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: active ? palette.orange : '#fff',
        borderWidth: 1,
        borderColor: active ? palette.orange : '#eee',
      }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : '#555' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryCard({ title, value, bg, valueColor }: { title: string; value: number; bg: string; valueColor: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 8, padding: 12, alignItems: 'center' }}>
      <Text style={{ fontSize: 12, color: '#555', marginBottom: 4, fontWeight: '600' }}>{title}</Text>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: valueColor }}>{value}</Text>
    </View>
  );
}

function StatusText({ children, tone = 'default' }: React.PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 24, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700', textAlign: 'center' }}>
      {children}
    </Text>
  );
}
