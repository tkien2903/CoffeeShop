import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';

const employees = [
  ['TK', 'Nguyễn Trung Kiên', 'Quản Lý - Ca B · NV: 0012', 'Đang làm', '#dcecff'],
  ['GH', 'Nguyễn Ngọc Gia Hân', 'Pha chế - Ca A · NV: 0008', 'Đang làm', '#fff1d7'],
  ['MD', 'Phạm Minh Dũng', 'Phục vụ - Ca A · NV: 0015', 'Đang làm', '#ddf4d5'],
  ['MA', 'Mai Ngọc Anh', 'Thu ngân - Ca C · NV: 0021', 'Nghỉ hôm nay', '#fde1ed'],
  ['MĐ', 'Trần Phạm Minh Đức', 'Phục vụ - Ca B · NV: 0004', 'Đang làm', '#766743'],
  ['HH', 'Đoàn Thị Bảo Trân', 'Thu Ngân - Ca B · NV: 0087', 'Đang làm', '#ece8df'],
  ['HH', 'Trần Đình Huy Hoàng', 'Quản lý - Ca B · NV: 0003', 'Đang làm', '#ece8df'],
  ['HH', 'Trần Đình Huy Hoàng', 'Quản lý - Ca B · NV: 0003', 'Đang làm', '#ece8df'],
  ['HH', 'Trần Đình Huy Hoàng', 'Quản lý - Ca B · NV: 0003', 'Đang làm', '#ece8df'],
  ['HH', 'Trần Đình Huy Hoàng', 'Quản lý - Ca B · NV: 0003', 'Đang làm', '#ece8df'],
];

export default function EmployeesScreen() {
  return (
    <ScreenShell active="more">
      <View style={{ padding: 8, backgroundColor: '#fff' }}>
        <View style={{ borderWidth: 1, borderColor: '#dedede', borderRadius: 10, overflow: 'hidden' }}>
          <BrandHeader underline={false} />
          <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 12, gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={16} color="#111" />
              <Text selectable style={{ flex: 1, marginLeft: 7, fontWeight: '800', fontSize: 14 }}>
                Quản lý nhân viên
              </Text>
              {[0, 1, 2].map((item) => (
                <Pressable
                  key={item}
                  style={{
                    width: 30,
                    height: 27,
                    borderWidth: 1,
                    borderColor: '#d0d0d0',
                    borderRadius: 7,
                    marginLeft: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {item === 1 && <Ionicons name="create-outline" size={15} color="#4a4a4a" />}
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {['Tất cả (5)', 'Đang làm (4)', 'Nghỉ (1)'].map((item, index) => (
                <Text
                  selectable
                  key={item}
                  style={{ color: index === 0 ? palette.orange : palette.ink, fontSize: 12, fontWeight: index === 0 ? '800' : '500' }}>
                  {item}
                </Text>
              ))}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View
                style={{
                  flex: 1,
                  height: 27,
                  borderWidth: 1,
                  borderColor: '#ded9cf',
                  borderRadius: 6,
                  backgroundColor: palette.cream,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 10,
                }}>
                <Ionicons name="search" size={13} color="#777" />
                <TextInput
                  placeholder="Tìm nhân viên..."
                  placeholderTextColor="#6f6f6f"
                  style={{ flex: 1, paddingVertical: 0, paddingLeft: 7, fontSize: 11 }}
                />
              </View>
              <Pressable
                style={{
                  height: 27,
                  paddingHorizontal: 11,
                  borderWidth: 1,
                  borderColor: '#ded9cf',
                  borderRadius: 6,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}>
                <Ionicons name="filter-outline" size={12} color="#333" />
                <Text selectable style={{ fontSize: 11 }}>
                  Lọc
                </Text>
              </Pressable>
            </View>

            <View>
              {employees.map(([initials, name, role, status, color]) => (
                <View
                  key={name}
                  style={{
                    minHeight: 57,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderColor: '#eee',
                  }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: color,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text selectable style={{ color: '#5370a0', fontWeight: '800', fontSize: 12 }}>
                      {initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 12 }}>
                    <Text selectable style={{ fontWeight: '900', fontSize: 13, color: palette.ink }}>
                      {name}
                    </Text>
                    <Text selectable style={{ fontSize: 11, color: '#40404a' }}>
                      {role}
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 10,
                      backgroundColor: status === 'Đang làm' ? '#dff0c8' : '#e7e0d9',
                    }}>
                    <Text selectable style={{ fontSize: 10, color: status === 'Đang làm' ? '#4c9b24' : '#7b716b', fontWeight: '800' }}>
                      {status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}
