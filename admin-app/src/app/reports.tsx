import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { ReportResponse, coffeeApi } from '@/services/api';

export default function ReportsScreen() {
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getReport()
      .then((data) => {
        if (isMounted) {
          setReport(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được báo cáo');
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
      <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="bar-chart-outline" size={16} color="#111" />
          <Text selectable style={{ flex: 1, marginLeft: 7, fontWeight: '900', fontSize: 15 }}>
            Báo cáo doanh thu
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
            <Ionicons name="download-outline" size={13} color="#111" />
            <Text selectable style={{ fontSize: 12 }}>
              Xuất
            </Text>
          </Pressable>
        </View>

        {isLoading ? (
          <StatusText>Đang tải báo cáo...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : report ? (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <Metric label="Doanh thu" value={compactMoney(report.doanhThu)} sub="Tổng đơn hàng" />
              <Metric label="Đơn hàng" value={String(report.soDon)} sub={`${report.daXacNhan} đã xác nhận`} />
              <Metric label="Trung bình đơn" value={compactMoney(report.trungBinhDon)} sub={`${report.choXuLy} chờ xử lý`} />
              <Metric label="Đã thanh toán" value={compactMoney(report.doanhThuDaThanhToan)} sub={`${report.daHuy} đã hủy`} />
            </View>

            <View style={{ gap: 8 }}>
              <Text selectable style={{ fontWeight: '900', color: palette.ink }}>
                Doanh thu theo giờ
              </Text>
              <View style={{ height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 5 }}>
                {Object.entries(report.doanhThuTheoGio).map(([hour, value]) => (
                  <Bar key={hour} label={hour.replace(':00', 'h')} value={value} max={Math.max(...Object.values(report.doanhThuTheoGio), 1)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text selectable style={{ fontWeight: '900', color: palette.ink }}>
                Top sản phẩm bán chạy
              </Text>
              {report.topSanPham.map((item, index) => (
                <View key={`${item.tenMon}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 30 }}>
                  <Text selectable style={{ width: 22, color: palette.muted, fontWeight: '800' }}>
                    {index + 1}
                  </Text>
                  <Text selectable style={{ flex: 1, color: palette.ink, fontWeight: '700' }}>
                    {item.tenMon}
                  </Text>
                  <Text selectable style={{ color: palette.orange, fontWeight: '900' }}>
                    {item.quantity}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </ScreenShell>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <View
      style={{
        width: '47.5%',
        minHeight: 76,
        borderRadius: 8,
        backgroundColor: '#f7f5ec',
        padding: 12,
        justifyContent: 'center',
      }}>
      <Text selectable style={{ color: '#6d655c', fontSize: 11, fontWeight: '800' }}>
        {label}
      </Text>
      <Text selectable style={{ color: palette.ink, fontSize: 20, fontWeight: '900', marginTop: 3 }}>
        {value}
      </Text>
      <Text selectable style={{ color: '#9b9286', fontSize: 10, marginTop: 2 }}>
        {sub}
      </Text>
    </View>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const height = Math.max(10, (value / max) * 118);

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
      <View style={{ width: '80%', height, borderRadius: 4, backgroundColor: palette.orange }} />
      <Text selectable style={{ fontSize: 8, color: palette.muted }}>
        {label}
      </Text>
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

function compactMoney(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return `${Math.round(value)}đ`;
}
