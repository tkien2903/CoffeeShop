import { useEffect, useState, useCallback } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, SectionTitle } from '@/components/coffee-ui';
import { BanAn, coffeeApi } from '@/services/api';

export default function OrdersScreen() {
  const [tables, setTables] = useState<BanAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTables = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setIsLoading(true);
      const data = await coffeeApi.getBanAn();
      const first10Tables = data.slice(0, 10);
      setTables(first10Tables);
      setErrorMessage('');
    } catch {
      setErrorMessage('Không tải được bàn ăn');
    } finally {
      if (showLoadingIndicator) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTables();
  }, [loadTables]);

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await coffeeApi.resetAllTables();
      await loadTables(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể reset bàn ăn. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const handleCompleteTable = async (idBan: number) => {
    try {
      setIsLoading(true);
      await coffeeApi.updateTableStatus(idBan, 0);
      await loadTables(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể hoàn thành bàn ăn. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const vacantCount = tables.filter(t => t.trangThai === 0).length;

  return (
    <ScreenShell active="orders">
      <BrandHeader />
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30 }}>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <SectionTitle>Sơ đồ bàn ăn ({tables.length} bàn)</SectionTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text selectable style={{ fontSize: 13, color: '#9b9aa0', fontWeight: '600' }}>
              Bàn trống: {vacantCount}/{tables.length}
            </Text>
            <TouchableOpacity 
              onPress={handleReset} 
              style={{ backgroundColor: '#f3545b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="refresh" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Reset</Text>
            </TouchableOpacity>
          </View>
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                    <Text selectable style={{ fontSize: 11, color: isOccupied ? '#f3545b' : '#54cf2d', fontWeight: '700' }}>
                      {isOccupied ? 'Đang có khách' : 'Bàn trống'}
                    </Text>
                    {isOccupied && (
                      <TouchableOpacity 
                        onPress={() => handleCompleteTable(table.idBan)}
                        style={{ backgroundColor: '#54cf2d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>Xong</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}
