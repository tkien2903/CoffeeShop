import { Image } from 'expo-image';
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { FormActions, FormField, FormInput, FormSheet } from '@/components/form-sheet';
import { BrandHeader, ProductImage, ScreenShell, palette } from '@/components/coffee-ui';
import { API_BASE_URL, LoaiMonAn, MonAn, MonAnInput, coffeeApi } from '@/services/api';
import { useFormDraft } from '@/hooks/use-form-draft';
import { canAccess } from '@/services/session';

const accents = ['#b60d28', '#ffbd28', '#ffcf52', '#5a1f18', '#d88933', '#bb4c2d'];

const emptyProduct: MonAnInput = {
  tenMon: '',
  idLoai: 1,
  gia: 0,
  soLuongTon: 0,
  mucCanhBao: 10,
};

export default function ProductsScreen() {
  const [products, setProducts] = useState<MonAn[]>([]);
  const [categories, setCategories] = useState<LoaiMonAn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selected, setSelected] = useState<MonAn | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const canManage = canAccess('Quản lý kho') || canAccess('Cài đặt hệ thống');

  const addDraft = useFormDraft('product-add', emptyProduct);
  const editDraft = useFormDraft('product-edit', emptyProduct);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((item) => [item.idLoai, item.tenLoai]));
  }, [categories]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([coffeeApi.getMonAn(), coffeeApi.getLoaiMonAn()]);
      setProducts(productData);
      setCategories(categoryData);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không tải được danh sách sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!selected) {
      return;
    }

    editDraft.setValues({
      tenMon: selected.tenMon,
      idLoai: selected.idLoai,
      gia: selected.gia,
      soLuongTon: selected.soLuongTon ?? 0,
      mucCanhBao: selected.mucCanhBao ?? 10,
    });
  }, [selected?._id]);

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 0) {
      return products;
    }

    return products.filter((item) => item.idLoai === selectedCategory);
  }, [products, selectedCategory]);

  const handleCreate = async () => {
    setIsSaving(true);
    try {
      await coffeeApi.createMonAn({
        ...addDraft.values,
        gia: Number(addDraft.values.gia),
        soLuongTon: Number(addDraft.values.soLuongTon ?? 0),
        mucCanhBao: Number(addDraft.values.mucCanhBao ?? 10),
      });
      await addDraft.clearDraft();
      setShowAdd(false);
      await loadData();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không thêm được món');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected?._id) {
      return;
    }

    setIsSaving(true);
    try {
      await coffeeApi.updateMonAn(selected._id, {
        ...editDraft.values,
        gia: Number(editDraft.values.gia),
        soLuongTon: Number(editDraft.values.soLuongTon ?? 0),
        mucCanhBao: Number(editDraft.values.mucCanhBao ?? 10),
      });
      await editDraft.clearDraft();
      setSelected(null);
      await loadData();
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không cập nhật được món');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selected?._id) {
      return;
    }

    Alert.alert('Xóa món', `Xóa ${selected.tenMon}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await coffeeApi.deleteMonAn(selected._id!);
            await editDraft.clearDraft();
            setSelected(null);
            await loadData();
          } catch (error) {
            Alert.alert('Lỗi', error instanceof Error ? error.message : 'Không xóa được món');
          }
        },
      },
    ]);
  };

  return (
    <ScreenShell active="products">
      <BrandHeader />
      <View style={{ flexDirection: 'row', minHeight: 34, borderBottomWidth: 1, borderColor: palette.line, flexWrap: 'wrap' }}>
        <CategoryTab id={0} label="Tất cả" active={selectedCategory === 0} onPress={() => setSelectedCategory(0)} />
        {categories.map((item) => (
          <CategoryTab
            key={item.idLoai}
            id={item.idLoai}
            label={item.tenLoai}
            active={selectedCategory === item.idLoai}
            onPress={() => setSelectedCategory(item.idLoai)}
          />
        ))}
      </View>

      {canManage ? (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 13, paddingHorizontal: 20, paddingTop: 10 }}>
          <Pressable onPress={() => setShowAdd(true)}>
            <Ionicons name="add-circle" size={24} color="#314b86" />
          </Pressable>
        </View>
      ) : null}

      <View style={{ paddingHorizontal: 22, paddingTop: 9 }}>
        {isLoading ? (
          <StatusText>Đang tải sản phẩm từ {API_BASE_URL}...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : visibleProducts.length === 0 ? (
          <StatusText>Không có sản phẩm trong danh mục này.</StatusText>
        ) : (
          visibleProducts.map((item, index) => (
            <ProductRow
              key={item._id ?? item.idMon}
              item={item}
              categoryName={categoryMap.get(item.idLoai) ?? `Loại #${item.idLoai}`}
              accent={accents[index % accents.length]}
              onPress={() => canManage && setSelected(item)}
            />
          ))
        )}
      </View>

      <FormSheet visible={showAdd} title="Thêm món mới" onClose={() => setShowAdd(false)}>
        <ProductForm values={addDraft.values} categories={categories} onChange={addDraft.setField} />
        <FormActions primaryLabel={isSaving ? 'Đang lưu...' : 'Lưu món'} onPrimary={handleCreate} disabled={isSaving} />
      </FormSheet>

      <FormSheet visible={selected != null} title={selected?.tenMon ?? 'Chi tiết món'} onClose={() => setSelected(null)}>
        {selected ? (
          <>
            <Text selectable style={{ fontSize: 12, color: palette.muted, marginBottom: 8 }}>
              Mã món: #{String(selected.idMon).padStart(3, '0')} · {categoryMap.get(selected.idLoai) ?? `Loại #${selected.idLoai}`}
            </Text>
            <ProductForm values={editDraft.values} categories={categories} onChange={editDraft.setField} />
            <FormActions
              primaryLabel={isSaving ? 'Đang lưu...' : 'Cập nhật món'}
              onPrimary={handleUpdate}
              dangerLabel="Xóa món"
              onDanger={handleDelete}
              disabled={isSaving}
            />
          </>
        ) : null}
      </FormSheet>
    </ScreenShell>
  );
}

function CategoryTab({
  label,
  active,
  onPress,
}: {
  id: number;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: active ? '#f5efff' : '#fff',
        borderWidth: active ? 2 : 0,
        borderColor: '#9049ff',
      }}>
      <Text selectable style={{ color: palette.ink, fontFamily: 'serif', fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProductForm({
  values,
  categories,
  onChange,
}: {
  values: MonAnInput;
  categories: LoaiMonAn[];
  onChange: <K extends keyof MonAnInput>(field: K, value: MonAnInput[K]) => void;
}) {
  return (
    <>
      <FormField label="Tên món">
        <FormInput value={values.tenMon} onChangeText={(text) => onChange('tenMon', text)} />
      </FormField>
      <FormField label="Loại món">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((category) => {
            const active = values.idLoai === category.idLoai;
            return (
              <Pressable
                key={category.idLoai}
                onPress={() => onChange('idLoai', category.idLoai)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: active ? palette.orange : '#ded9cf',
                  backgroundColor: active ? '#fff6e8' : '#fff',
                }}>
                <Text selectable style={{ fontSize: 12, fontWeight: active ? '900' : '600', color: palette.ink }}>
                  {category.tenLoai}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FormField>
      <FormField label="Giá (VNĐ)">
        <FormInput
          keyboardType="number-pad"
          value={String(values.gia)}
          onChangeText={(text) => onChange('gia', Number(text) || 0)}
        />
      </FormField>
      <FormField label="Tồn kho">
        <FormInput
          keyboardType="number-pad"
          value={String(values.soLuongTon ?? 0)}
          onChangeText={(text) => onChange('soLuongTon', Number(text) || 0)}
        />
      </FormField>
      <FormField label="Mức cảnh báo">
        <FormInput
          keyboardType="number-pad"
          value={String(values.mucCanhBao ?? 10)}
          onChangeText={(text) => onChange('mucCanhBao', Number(text) || 0)}
        />
      </FormField>
    </>
  );
}

function ProductRow({
  item,
  categoryName,
  accent,
  onPress,
}: {
  item: MonAn;
  categoryName: string;
  accent: string;
  onPress: () => void;
}) {
  const lowStock = (item.soLuongTon ?? 99) <= (item.mucCanhBao ?? 10);

  return (
    <Pressable onPress={onPress} style={{ minHeight: 94, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 76, height: 78, alignItems: 'center', justifyContent: 'center' }}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            contentFit="cover"
            style={{ width: 58, height: 58, borderRadius: 14, backgroundColor: '#f5f1ed' }}
          />
        ) : (
          <ProductImage accent={accent} />
        )}
      </View>
      <View style={{ flex: 1, paddingLeft: 14 }}>
        <Text selectable style={{ color: palette.muted, fontSize: 11, fontWeight: '700' }}>
          #{String(item.idMon).padStart(3, '0')} · {categoryName}
        </Text>
        <Text selectable style={{ color: '#05122f', fontSize: 15, fontWeight: '800', marginTop: 2 }}>
          {item.tenMon}
        </Text>
        <Text selectable style={{ marginTop: 5, color: '#05122f', fontSize: 14 }}>
          {formatCurrency(item.gia)}
        </Text>
      </View>
      <View
        style={{
          alignSelf: 'center',
          minWidth: 72,
          height: 27,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: lowStock ? '#ffe8e8' : '#f1f3f3',
        }}>
        <Text selectable style={{ color: lowStock ? palette.red : '#05122f', fontSize: 12 }}>
          {lowStock ? 'Sắp hết' : 'Còn hàng'}
        </Text>
      </View>
    </Pressable>
  );
}

function StatusText({ children, tone = 'default' }: PropsWithChildren<{ tone?: 'default' | 'error' }>) {
  return (
    <Text selectable style={{ paddingVertical: 24, color: tone === 'error' ? palette.red : palette.muted, fontWeight: '700' }}>
      {children}
    </Text>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}
