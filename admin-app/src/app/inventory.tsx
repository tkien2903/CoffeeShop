import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { InventoryItem, InventoryResponse, coffeeApi } from '@/services/api';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getInventory()
      .then((data) => {
        if (isMounted) {
          setInventory(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được kho');
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

  const items = useMemo(() => {
    const allItems = inventory?.items ?? [];
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return allItems;
    }

    return allItems.filter((item) => `${item.tenMon} ${item.loai}`.toLowerCase().includes(keyword));
  }, [inventory, query]);

  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="cube-outline" size={16} color="#111" />
          <Text selectable style={{ flex: 1, marginLeft: 7, fontWeight: '900', fontSize: 15 }}>
            Quản lý kho
          </Text>
        </View>

        {inventory ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Metric label="Tổng mặt hàng" value={String(inventory.tongMatHang)} />
            <Metric label="Cần cập nhật" value={String(inventory.sapHet)} tone="warning" />
          </View>
        ) : null}

        <View
          style={{
            height: 32,
            borderWidth: 1,
            borderColor: '#ded9cf',
            borderRadius: 6,
            backgroundColor: palette.cream,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}>
          <Ionicons name="search" size={14} color="#777" />
          <TextInput
            placeholder="Tìm mặt hàng..."
            placeholderTextColor="#6f6f6f"
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, paddingVertical: 0, paddingLeft: 8, fontSize: 12 }}
          />
        </View>

        {isLoading ? (
          <StatusText>Đang tải kho...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : (
          <View style={{ gap: 8 }}>
            {items.map((item) => (
              <InventoryRow key={item.idMon} item={item} />
            ))}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

function Metric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'warning' }) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 62,
        borderRadius: 8,
        backgroundColor: tone === 'warning' ? '#fff2d9' : '#f7f5ec',
        padding: 12,
        justifyContent: 'center',
      }}>
      <Text selectable style={{ color: '#6d655c', fontSize: 11, fontWeight: '800' }}>
        {label}
      </Text>
      <Text selectable style={{ color: tone === 'warning' ? palette.orange : palette.ink, fontSize: 20, fontWeight: '900' }}>
        {value}
      </Text>
    </View>
  );
}

function InventoryRow({ item }: { item: InventoryItem }) {
  return (
    <View
      style={{
        minHeight: 62,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ece7df',
        paddingHorizontal: 12,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: item.canhBao ? '#ffe4e0' : '#e7f4dc',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        }}>
        <Ionicons name={item.canhBao ? 'alert-outline' : 'checkmark-outline'} size={18} color={item.canhBao ? palette.red : '#4c9b24'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text selectable style={{ color: palette.ink, fontWeight: '900', fontSize: 13 }}>
          {item.tenMon}
        </Text>
        <Text selectable style={{ color: palette.muted, fontSize: 11 }}>
          {item.loai} · {formatCurrency(item.giaTriDonVi)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text selectable style={{ color: item.canhBao ? palette.red : palette.ink, fontWeight: '900', fontSize: 14 }}>
          {item.soLuongTon}
        </Text>
        <Text selectable style={{ color: palette.muted, fontSize: 10 }}>
          min {item.mucCanhBao}
        </Text>
      </View>
    </View>
  );
}

function StatusText({ children, tone = 'default' }: React.PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 24, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}
