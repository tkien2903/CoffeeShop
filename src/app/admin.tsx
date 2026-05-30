import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, SectionTitle, palette } from '@/components/coffee-ui';

const stats = [
  { label: 'Đang chờ xử lý', value: 4, icon: 'alarm-outline', color: '#6ce554' },
  { label: 'Đã xác nhận', value: 3, icon: 'checkmark-circle-outline', color: '#22e335' },
  { label: 'Đang xử lý', value: 3, icon: 'sync-outline', color: '#d7d6cf' },
  { label: 'Đang giao hàng', value: 0, icon: 'bike-fast', color: '#ff4747', material: true },
];

const chartPoints = [36, 56, 28, 78, 96, 68, 118, 148, 126, 138];

export default function AdminScreen() {
  return (
    <ScreenShell active="home">
      <BrandHeader />
      <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#000', marginRight: 8 }}>
            <View
              style={{
                position: 'absolute',
                right: -4,
                bottom: -2,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: '#45dc24',
              }}
            />
          </View>
          <Text selectable style={{ flex: 1, color: palette.ink, fontSize: 13 }}>
            Xin chào! Admin
          </Text>
          <Text selectable style={{ marginRight: -5, marginBottom: 22, fontSize: 12 }}>
            0
          </Text>
          <Ionicons name="notifications" size={31} color="#ffd314" />
        </View>

        <SectionTitle>Thống kê tổng quan</SectionTitle>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {stats.map((item) => (
            <View
              key={item.label}
              style={{
                width: '47.8%',
                minHeight: 86,
                borderRadius: 8,
                backgroundColor: '#f5f9fb',
                padding: 14,
                justifyContent: 'center',
                boxShadow: '3px 4px 4px rgba(29, 40, 58, 0.16)',
              }}>
              <View style={{ position: 'absolute', right: 12, top: 9 }}>
                {item.material ? (
                  <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={25} color={item.color} />
                ) : (
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={25} color={item.color} />
                )}
              </View>
              <Text selectable style={{ textAlign: 'center', fontFamily: 'serif', color: palette.ink, fontSize: 12 }}>
                {item.label}
              </Text>
              <Text selectable style={{ textAlign: 'center', color: palette.ink, fontSize: 22, fontWeight: '800' }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <SectionTitle>Thống kê món bán chạy</SectionTitle>
          <View style={{ flex: 1 }} />
          {['Năm', 'Tháng', 'Tuần'].map((item, index) => (
            <View
              key={item}
              style={{
                paddingHorizontal: 7,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: '#d71920',
                backgroundColor: index === 0 ? '#f05258' : '#fff',
              }}>
              <Text selectable style={{ color: index === 0 ? '#fff' : '#d71920', fontSize: 8, fontWeight: '700' }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        <SalesChart />
      </View>
    </ScreenShell>
  );
}

function SalesChart() {
  return (
    <View
      style={{
        height: 205,
        marginHorizontal: 4,
        borderLeftWidth: 4,
        borderBottomWidth: 4,
        borderColor: '#b7c4c7',
        backgroundColor: '#fbfbfb',
        overflow: 'hidden',
      }}>
      {Array.from({ length: 15 }).map((_, index) => (
        <View key={index} style={{ height: 12, borderTopWidth: 1, borderColor: '#e5ebed' }} />
      ))}
      {chartPoints.map((top, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: 16 + index * 24,
            top,
            width: 11,
            height: 11,
            borderRadius: 6,
            backgroundColor: '#b80215',
          }}
        />
      ))}
      {chartPoints.slice(1).map((top, index) => {
        const prev = chartPoints[index];
        const dx = 24;
        const dy = top - prev;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = `${Math.atan2(dy, dx)}rad`;

        return (
          <View
            key={`${top}-${index}`}
            style={{
              position: 'absolute',
              left: 22 + index * 24,
              top: prev + 5,
              width: length,
              height: 4,
              backgroundColor: '#d34c75',
              transformOrigin: 'left center',
              transform: [{ rotate: angle }],
            }}
          />
        );
      })}
    </View>
  );
}
