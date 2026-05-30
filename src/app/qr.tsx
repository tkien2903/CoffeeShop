import { Text, View } from 'react-native';

import { BrandHeader, ScreenShell } from '@/components/coffee-ui';

export default function QrScreen() {
  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ paddingHorizontal: 19, paddingTop: 28 }}>
        <Text selectable style={{ fontWeight: '900', fontSize: 14, marginBottom: 14 }}>
          Danh sách Mã QR theo bàn:
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
          {Array.from({ length: 18 }).map((_, index) => (
            <View key={index} style={{ width: '23%', alignItems: 'center' }}>
              <QrTile seed={index + 1} />
              <Text selectable style={{ marginTop: 4, fontSize: 10, fontWeight: '800' }}>
                Bàn {index + 1}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScreenShell>
  );
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
