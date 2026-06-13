import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FormActions, FormField, FormInput, FormSheet } from '@/components/form-sheet';
import { BrandHeader, ScreenShell, palette } from '@/components/coffee-ui';
import { InventoryResponse, NguyenLieuInput, NguyenLieuItem, coffeeApi } from '@/services/api';
import { useFormDraft } from '@/hooks/use-form-draft';
import { canAccess } from '@/services/session';

const emptyIngredient: NguyenLieuInput = {
  tenNguyenLieu: '',
  donViTinh: 'Kg',
  loai: 'Khác',
  soLuongTon: 0,
  mucCanhBao: 5,
};

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState<NguyenLieuItem | null>(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canManage = canAccess('Quản lý kho');

  const ingredientDraft = useFormDraft('inventory-ingredient', { soLuongTon: '0', mucCanhBao: '5' });
  const addIngredientDraft = useFormDraft('inventory-add-ingredient', emptyIngredient);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await coffeeApi.getInventory();
      setInventory(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không tải được kho');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    if (!selectedIngredient) {
      return;
    }

    ingredientDraft.setValues({
      soLuongTon: String(selectedIngredient.soLuongTon),
      mucCanhBao: String(selectedIngredient.mucCanhBao),
    });
  }, [selectedIngredient?.idNL]);

  const nguyenLieuItems = useMemo(() => {
    const allItems = inventory?.nguyenLieuItems ?? [];
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return allItems;
    }

    return allItems.filter((item) =>
      `${item.tenNguyenLieu} ${item.loai} ${item.donViTinh}`.toLowerCase().includes(keyword)
    );
  }, [inventory, query]);

  const handleUpdateIngredientStock = async () => {
    if (!selectedIngredient) {
      return;
    }

    setIsSaving(true);
    try {
      await coffeeApi.updateNguyenLieuStock(selectedIngredient.idNL, {
        soLuongTon: Number(ingredientDraft.values.soLuongTon),
        mucCanhBao: Number(ingredientDraft.values.mucCanhBao),
      });
      await ingredientDraft.clearDraft();
      setSelectedIngredient(null);
      await loadInventory();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không cập nhật được tồn kho nguyên liệu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateIngredient = async () => {
    setIsSaving(true);
    try {
      await coffeeApi.createNguyenLieu({
        ...addIngredientDraft.values,
        soLuongTon: Number(addIngredientDraft.values.soLuongTon ?? 0),
        mucCanhBao: Number(addIngredientDraft.values.mucCanhBao ?? 5),
      });
      await addIngredientDraft.clearDraft();
      setShowAddIngredient(false);
      await loadInventory();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thêm được nguyên liệu');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenShell active="more">
      <BrandHeader />
      <View style={{ paddingHorizontal: 14, paddingTop: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="leaf-outline" size={16} color="#111" />
          <Text selectable style={{ flex: 1, marginLeft: 7, fontWeight: '900', fontSize: 15 }}>
            Quản lý kho nguyên liệu
          </Text>
          {canManage ? (
            <Pressable
              onPress={() => setShowAddIngredient(true)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: palette.ink,
              }}>
              <Text selectable style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>
                + Nguyên liệu
              </Text>
            </Pressable>
          ) : null}
        </View>

        {inventory ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Metric label="Tổng nguyên liệu" value={String(inventory.tongNguyenLieu)} />
            <Metric label="Sắp hết" value={String(inventory.nguyenLieuSapHet)} tone="warning" />
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
            placeholder="Tìm nguyên liệu..."
            placeholderTextColor="#6f6f6f"
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, paddingVertical: 0, paddingLeft: 8, fontSize: 12 }}
          />
        </View>

        {isLoading ? (
          <StatusText>Đang tải nguyên liệu...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : nguyenLieuItems.length === 0 ? (
          <StatusText>Chưa có nguyên liệu trong kho. Hãy import dữ liệu mẫu hoặc thêm mới.</StatusText>
        ) : (
          <View style={{ gap: 8 }}>
            {nguyenLieuItems.map((item) => (
              <NguyenLieuRow key={item.idNL} item={item} onPress={() => canManage && setSelectedIngredient(item)} />
            ))}
          </View>
        )}
      </View>

      <FormSheet
        visible={selectedIngredient != null}
        title={selectedIngredient?.tenNguyenLieu ?? 'Cập nhật nguyên liệu'}
        onClose={() => setSelectedIngredient(null)}>
        {selectedIngredient ? (
          <>
            <Text selectable style={{ fontSize: 12, color: palette.muted, marginBottom: 8 }}>
              Mã NL: #{String(selectedIngredient.idNL).padStart(3, '0')} · {selectedIngredient.loai} · {selectedIngredient.donViTinh}
            </Text>
            <StockForm values={ingredientDraft.values} onChange={ingredientDraft.setField} unit={selectedIngredient.donViTinh} />
            <FormActions primaryLabel={isSaving ? 'Đang lưu...' : 'Lưu tồn kho'} onPrimary={handleUpdateIngredientStock} disabled={isSaving} />
          </>
        ) : null}
      </FormSheet>

      <FormSheet visible={showAddIngredient} title="Thêm nguyên liệu" onClose={() => setShowAddIngredient(false)}>
        <FormField label="Tên nguyên liệu">
          <FormInput
            value={addIngredientDraft.values.tenNguyenLieu}
            onChangeText={(text) => addIngredientDraft.setField('tenNguyenLieu', text)}
          />
        </FormField>
        <FormField label="Đơn vị tính">
          <FormInput
            value={addIngredientDraft.values.donViTinh}
            onChangeText={(text) => addIngredientDraft.setField('donViTinh', text)}
          />
        </FormField>
        <FormField label="Loại">
          <FormInput value={addIngredientDraft.values.loai} onChangeText={(text) => addIngredientDraft.setField('loai', text)} />
        </FormField>
        <StockForm
          values={{
            soLuongTon: String(addIngredientDraft.values.soLuongTon ?? 0),
            mucCanhBao: String(addIngredientDraft.values.mucCanhBao ?? 5),
          }}
          onChange={(field, value) => addIngredientDraft.setField(field === 'soLuongTon' ? 'soLuongTon' : 'mucCanhBao', Number(value))}
          unit={addIngredientDraft.values.donViTinh}
        />
        <FormActions primaryLabel={isSaving ? 'Đang lưu...' : 'Thêm nguyên liệu'} onPrimary={handleCreateIngredient} disabled={isSaving} />
      </FormSheet>
    </ScreenShell>
  );
}

function StockForm({
  values,
  onChange,
  unit,
}: {
  values: { soLuongTon: string; mucCanhBao: string };
  onChange: (field: 'soLuongTon' | 'mucCanhBao', value: string) => void;
  unit: string;
}) {
  return (
    <>
      <FormField label={`Số lượng tồn (${unit})`}>
        <FormInput keyboardType="number-pad" value={values.soLuongTon} onChangeText={(text) => onChange('soLuongTon', text)} />
      </FormField>
      <FormField label="Mức cảnh báo">
        <FormInput keyboardType="number-pad" value={values.mucCanhBao} onChangeText={(text) => onChange('mucCanhBao', text)} />
      </FormField>
    </>
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

function NguyenLieuRow({ item, onPress }: { item: NguyenLieuItem; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
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
        <Ionicons name={item.canhBao ? 'leaf-outline' : 'leaf'} size={18} color={item.canhBao ? palette.red : '#4c9b24'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text selectable style={{ color: palette.muted, fontSize: 10, fontWeight: '700' }}>
          #{String(item.idNL).padStart(3, '0')}
        </Text>
        <Text selectable style={{ color: palette.ink, fontWeight: '900', fontSize: 13 }}>
          {item.tenNguyenLieu}
        </Text>
        <Text selectable style={{ color: palette.muted, fontSize: 11 }}>
          {item.loai} · {item.donViTinh}
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
    </Pressable>
  );
}

function StatusText({ children, tone = 'default' }: React.PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 24, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}
