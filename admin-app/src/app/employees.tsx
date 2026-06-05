import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { Employee, coffeeApi } from '@/services/api';

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getEmployees()
      .then((data) => {
        if (isMounted) {
          setEmployees(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được nhân viên');
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

  const visibleEmployees = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return employees;
    }

    return employees.filter((employee) =>
      [employee.hoVaTen, employee.username, employee.chucVu, employee.soDienThoai]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [employees, query]);

  const working = employees.filter((employee) => employee.trangThai === 'Đang làm').length;

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
              {[
                `Tất cả (${employees.length})`,
                `Đang làm (${working})`,
                `Nghỉ (${Math.max(0, employees.length - working)})`,
              ].map((item, index) => (
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
                  value={query}
                  onChangeText={setQuery}
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

            {isLoading ? (
              <StatusText>Đang tải nhân viên...</StatusText>
            ) : errorMessage ? (
              <StatusText tone="error">{errorMessage}</StatusText>
            ) : (
              <View>
                {visibleEmployees.map((employee, index) => (
                  <EmployeeRow key={employee.id || employee.idNV} employee={employee} color={avatarColors[index % avatarColors.length]} />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScreenShell>
  );
}

const avatarColors = ['#dcecff', '#fff1d7', '#ddf4d5', '#fde1ed', '#ece8df', '#e8e1cb'];

function EmployeeRow({ employee, color }: { employee: Employee; color: string }) {
  return (
    <View
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
          {initials(employee.hoVaTen || employee.username)}
        </Text>
      </View>
      <View style={{ flex: 1, paddingLeft: 12 }}>
        <Text selectable style={{ fontWeight: '900', fontSize: 13, color: palette.ink }}>
          {employee.hoVaTen || employee.username}
        </Text>
        <Text selectable style={{ fontSize: 11, color: '#40404a' }}>
          {employee.chucVu} · {employee.hinhThuc} · NV: {String(employee.idNV).padStart(4, '0')}
        </Text>
        <Text selectable style={{ fontSize: 10, color: '#777' }}>
          {employee.soDienThoai}
        </Text>
      </View>
      <View
        style={{
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 10,
          backgroundColor: employee.trangThai === 'Đang làm' ? '#dff0c8' : '#e7e0d9',
        }}>
        <Text selectable style={{ fontSize: 10, color: employee.trangThai === 'Đang làm' ? '#4c9b24' : '#7b716b', fontWeight: '800' }}>
          {employee.trangThai}
        </Text>
      </View>
    </View>
  );
}

function StatusText({ children, tone = 'default' }: React.PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 18, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
