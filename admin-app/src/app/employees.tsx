import { useCallback, useEffect, useMemo, memo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FormActions, FormField, FormInput, FormSheet } from '@/components/form-sheet';
import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { Employee, EmployeeInput, coffeeApi } from '@/services/api';
import { useFormDraft } from '@/hooks/use-form-draft';
import { canAccess } from '@/services/session';

const emptyEmployee: EmployeeInput = {
  hoVaTen: '',
  username: '',
  chucVu: 'Phục vụ',
  hinhThuc: 'FULLTIME',
  soDienThoai: '',
  matKhau: '',
  caLam: 'Ca B',
};

const chucVuOptions = ['Phục vụ', 'Thu ngân', 'Quản lý Cửa Hàng','Pha chế', 'Kho'];
const hinhThucOptions = ['FULLTIME', 'PARTTIME'];

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canManage = canAccess('Quản lý nhân viên');

  const addDraft = useFormDraft('employee-add', emptyEmployee);
  const editDraft = useFormDraft('employee-edit', emptyEmployee);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await coffeeApi.getEmployees();
      setEmployees(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không tải được nhân viên');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    editDraft.setValues({
      hoVaTen: selected.hoVaTen,
      username: selected.username,
      chucVu: selected.chucVu,
      hinhThuc: selected.hinhThuc,
      soDienThoai: selected.soDienThoai,
      matKhau: '',
      caLam: selected.caLam ?? 'Ca B',
    });
  }, [selected?.id]);

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

  const handleCreate = async () => {
    if (!addDraft.values.matKhau?.trim()) {
      Alert.alert('Thiếu thông tin', 'Mật khẩu là bắt buộc khi thêm nhân viên mới.');
      return;
    }

    setIsSaving(true);
    try {
      await coffeeApi.createEmployee(addDraft.values);
      await addDraft.clearDraft();
      setShowAdd(false);
      await loadEmployees();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thêm được nhân viên');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) {
      return;
    }

    setIsSaving(true);
    try {
      await coffeeApi.updateEmployee(selected.id, editDraft.values);
      await editDraft.clearDraft();
      setSelected(null);
      await loadEmployees();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không cập nhật được nhân viên');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selected) {
      return;
    }

    Alert.alert('Xóa nhân viên', `Xóa ${selected.hoVaTen}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await coffeeApi.deleteEmployee(selected.id);
            await editDraft.clearDraft();
            setSelected(null);
            await loadEmployees();
          } catch (error) {
            Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không xóa được nhân viên');
          }
        },
      },
    ]);
  };

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
              {canManage ? (
                <Pressable
                  onPress={() => setShowAdd(true)}
                  style={{
                    width: 30,
                    height: 27,
                    borderWidth: 1,
                    borderColor: '#d0d0d0',
                    borderRadius: 7,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Ionicons name="add" size={18} color="#4a4a4a" />
                </Pressable>
              ) : null}
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
            </View>

            {isLoading ? (
              <StatusText>Đang tải nhân viên...</StatusText>
            ) : errorMessage ? (
              <StatusText tone="error">{errorMessage}</StatusText>
            ) : (
              <FlatList
                data={visibleEmployees}
                keyExtractor={(employee) => employee.id || String(employee.idNV)}
                windowSize={5}
                maxToRenderPerBatch={10}
                initialNumToRender={10}
                removeClippedSubviews
                scrollEnabled={false}
                renderItem={({ item: employee, index }) => (
                  <EmployeeRow
                    employee={employee}
                    color={avatarColors[index % avatarColors.length]}
                    onPress={() => setSelected(employee)}
                  />
                )}
              />
            )}
          </View>
        </View>
      </View>

      <FormSheet visible={showAdd} title="Thêm nhân viên" onClose={() => setShowAdd(false)}>
        <EmployeeForm
          values={addDraft.values}
          onChange={addDraft.setField}
          showPassword
          passwordRequired
        />
        <FormActions primaryLabel={isSaving ? 'Đang lưu...' : 'Lưu nhân viên'} onPrimary={handleCreate} disabled={isSaving} />
      </FormSheet>

      <FormSheet
        visible={selected != null}
        title={selected ? `NV ${String(selected.idNV).padStart(4, '0')} · ${selected.hoVaTen}` : 'Chi tiết nhân viên'}
        onClose={() => setSelected(null)}>
        {selected ? (
          <>
            <View style={{ gap: 6, marginBottom: 8 }}>
              <DetailLine label="Mã NV" value={String(selected.idNV).padStart(4, '0')} />
              <DetailLine label="Trạng thái" value={selected.trangThai} />
            </View>
            <EmployeeForm values={editDraft.values} onChange={editDraft.setField} showPassword passwordRequired={false} />
            {canManage ? (
              <FormActions
                primaryLabel={isSaving ? 'Đang lưu...' : 'Cập nhật'}
                onPrimary={handleUpdate}
                dangerLabel="Xóa nhân viên"
                onDanger={handleDelete}
                disabled={isSaving}
              />
            ) : null}
          </>
        ) : null}
      </FormSheet>
    </ScreenShell>
  );
}

function EmployeeForm({
  values,
  onChange,
  showPassword,
  passwordRequired,
}: {
  values: EmployeeInput;
  onChange: <K extends keyof EmployeeInput>(field: K, value: EmployeeInput[K]) => void;
  showPassword: boolean;
  passwordRequired: boolean;
}) {
  return (
    <>
      <FormField label="Họ và tên">
        <FormInput value={values.hoVaTen} onChangeText={(text) => onChange('hoVaTen', text)} />
      </FormField>
      <FormField label="Username">
        <FormInput autoCapitalize="none" value={values.username} onChangeText={(text) => onChange('username', text)} />
      </FormField>
      <FormField label="Chức vụ">
        <OptionRow options={chucVuOptions} value={values.chucVu} onSelect={(value) => onChange('chucVu', value)} />
      </FormField>
      <FormField label="Hình thức">
        <OptionRow options={hinhThucOptions} value={values.hinhThuc} onSelect={(value) => onChange('hinhThuc', value)} />
      </FormField>
      <FormField label="Số điện thoại">
        <FormInput keyboardType="phone-pad" value={values.soDienThoai} onChangeText={(text) => onChange('soDienThoai', text)} />
      </FormField>
      <FormField label="Ca làm">
        <FormInput value={values.caLam ?? ''} onChangeText={(text) => onChange('caLam', text)} />
      </FormField>
      {showPassword ? (
        <FormField label={passwordRequired ? 'Mật khẩu' : 'Mật khẩu mới (để trống nếu giữ nguyên)'}>
          <FormInput secureTextEntry value={values.matKhau ?? ''} onChangeText={(text) => onChange('matKhau', text)} />
        </FormField>
      ) : null}
    </>
  );
}

function OptionRow({ options, value, onSelect }: { options: string[]; value: string; onSelect: (value: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: active ? palette.orange : '#ded9cf',
              backgroundColor: active ? '#fff6e8' : '#fff',
            }}>
            <Text selectable style={{ fontSize: 12, fontWeight: active ? '900' : '600', color: palette.ink }}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Text selectable style={{ fontSize: 12, color: palette.muted }}>
      <Text style={{ fontWeight: '800' }}>{label}: </Text>
      {value}
    </Text>
  );
}

const avatarColors = ['#dcecff', '#fff1d7', '#ddf4d5', '#fde1ed', '#ece8df', '#e8e1cb'];

// Wrapped in memo so it only re-renders when its own props change
const EmployeeRow = memo(function EmployeeRow({
  employee,
  color,
  onPress,
}: {
  employee: Employee;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
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
      <Ionicons name="chevron-forward" size={16} color="#bbb" style={{ marginLeft: 6 }} />
    </Pressable>
  );
});

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
