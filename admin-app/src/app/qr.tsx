import { Image } from 'expo-image';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { API_BASE_URL, BanAn, coffeeApi } from '@/services/api';

export default function QrScreen() {
  const [tables, setTables] = useState<BanAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
            {tables.map((table) => (
              <View key={table.id ?? table.idBan} style={{ width: '23%', alignItems: 'center' }}>
                {table.qrImageBase64 ? <QrImage base64={table.qrImageBase64} /> : <QrTile seed={table.idBan} />}
                <Text selectable style={{ marginTop: 4, fontSize: 10, fontWeight: '800' }}>
                  {table.tenBan ?? `Bàn ${table.idBan}`}
                </Text>
              </View>
            ))}
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
