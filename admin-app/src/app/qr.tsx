import { Image } from 'expo-image';
import { router } from 'expo-router';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import * as MediaLibrary from 'expo-media-library';
let MediaLibrary: any;
try {
  MediaLibrary = require('expo-media-library');
} catch (error) {
  MediaLibrary = {
    usePermissions: () => [{ status: 'granted' }, async () => ({ status: 'granted' })],
    saveToLibraryAsync: async () => { 
      // Fallback
    }
  };
}
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { API_BASE_URL, BanAn, coffeeApi } from '@/services/api';

export default function QrScreen() {
  const [tables, setTables] = useState<BanAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

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
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được danh sách bàn');
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

  const handleDownload = async (table: BanAn) => {
    const base64Data = table.maQR && !table.maQR.startsWith('http') ? table.maQR : table.qrImageBase64;
    
    if (!base64Data) {
      Alert.alert('Lỗi', 'Không có ảnh QR để tải.');
      return;
    }

    if (permissionResponse?.status !== 'granted') {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để lưu ảnh QR.');
        return;
      }
    }

    try {
      // @ts-ignore
      const fileUri = (FileSystem.documentDirectory || '') + `QR_Ban_${table.idBan}.png`;
      const base64Code = base64Data.startsWith('data:') ? base64Data.split(',')[1] : base64Data;
      
      try {
        await FileSystem.writeAsStringAsync(fileUri, base64Code, {
          encoding: FileSystem.EncodingType.Base64,
        });
      } catch (fsError) {
        Alert.alert('Thông báo', 'Tính năng lưu ảnh đang được cài đặt vào app. Vui lòng đợi tiến trình build chạy xong nha!');
        return;
      }

      if (MediaLibrary.saveToLibraryAsync.toString().includes('Fallback')) {
        Alert.alert('Thông báo', 'Tính năng lưu ảnh đang được cài đặt vào app. Vui lòng đợi bản build chạy xong!');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(fileUri);
      
      // Update backend to ensure maQR contains the base64 code if it doesn't already
      if (table.maQR !== base64Code) {
         try {
           await fetch(`${API_BASE_URL}/ban-an/cap-nhat-qr`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
             },
             body: new URLSearchParams({
               idBan: table.idBan.toString(),
               maQR: base64Code
             }).toString()
           });
         } catch (e) {
           console.warn('Could not update backend maQR', e);
         }
      }

      Alert.alert('Thành công', `Đã lưu mã QR bàn ${table.idBan} vào thư viện ảnh!`);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lưu ảnh QR.');
    }
  };

  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ paddingHorizontal: 19, paddingTop: 28 }}>
        <Text selectable style={{ fontWeight: '900', fontSize: 14, marginBottom: 14 }}>
          Danh sách Mã QR theo bàn:
        </Text>

        {isLoading ? (
          <StatusText>Đang tải bàn từ {API_BASE_URL}...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : tables.length === 0 ? (
          <StatusText>Backend chưa có dữ liệu bàn.</StatusText>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
            {tables.map((table) => {
              const base64Data = table.maQR && !table.maQR.startsWith('http') ? table.maQR : table.qrImageBase64;
              
              return (
                <View key={table.id ?? table.idBan} style={{ width: '23%', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => router.push(`/customer-menu?idBan=${table.idBan}`)}>
                    {base64Data ? <QrImage base64={base64Data} /> : <QrTile seed={table.idBan} />}
                  </TouchableOpacity>
                  <Text selectable style={{ marginTop: 4, fontSize: 10, fontWeight: '800' }}>
                    {table.tenBan ?? `Bàn ${table.idBan}`}
                  </Text>
                  <TouchableOpacity 
                    style={{ marginTop: 6, padding: 4, backgroundColor: '#f0f0f0', borderRadius: 4 }}
                    onPress={() => handleDownload(table)}
                  >
                    <Ionicons name="download-outline" size={16} color={palette.ink} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

function QrImage({ base64 }: { base64: string }) {
  const source = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;

  return <Image source={{ uri: source }} contentFit="contain" style={{ width: 50, height: 50, backgroundColor: '#fff' }} />;
}

function QrTile({ seed }: { seed: number }) {
  return (
    <View style={{ width: 50, height: 50, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fff' }}>
      {Array.from({ length: 100 }).map((_, index) => {
        const on = (index * 7 + seed * 13 + Math.floor(index / 10) * seed) % 5 < 2;
        return <View key={index} style={{ width: 5, height: 5, backgroundColor: on ? '#111' : '#fff' }} />;
      })}
    </View>
  );
}

function StatusText({ children, tone = 'default' }: PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 24, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}
