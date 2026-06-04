import { Image } from 'expo-image';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ProductImage, ScreenShell, palette } from '@/components/coffee-ui';
import { API_BASE_URL, MonAn, coffeeApi } from '@/services/api';

const categories = [
  { id: 0, label: 'Tất cả' },
  { id: 3, label: 'Trà' },
  { id: 4, label: 'Cà Phê' },
  { id: 1, label: 'Trà Sữa' },
  { id: 5, label: 'Matcha' },
  { id: 7, label: 'Topping' },
];

const accents = ['#b60d28', '#ffbd28', '#ffcf52', '#5a1f18', '#d88933', '#bb4c2d'];

export default function ProductsScreen() {
  const [products, setProducts] = useState<MonAn[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    coffeeApi
      .getMonAn()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setErrorMessage('');
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không tải được danh sách sản phẩm');
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

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 0) {
      return products;
    }

    return products.filter((item) => item.idLoai === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <ScreenShell active="products">
      <BrandHeader />
      <View style={{ flexDirection: 'row', minHeight: 34, borderBottomWidth: 1, borderColor: palette.line, flexWrap: 'wrap' }}>
        {categories.map((item) => {
          const active = item.id === selectedCategory;

          return (
            <Pressable
              key={item.id}
              onPress={() => setSelectedCategory(item.id)}
              style={{
                justifyContent: 'center',
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: active ? '#f5efff' : '#fff',
                borderWidth: active ? 2 : 0,
                borderColor: '#9049ff',
              }}>
              <Text selectable style={{ color: palette.ink, fontFamily: 'serif', fontSize: 15 }}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 13, paddingHorizontal: 20, paddingTop: 10 }}>
        <Ionicons name="add-circle" size={24} color="#314b86" />
        <Ionicons name="create-outline" size={24} color="#8c8c8c" />
        <Ionicons name="remove-circle" size={24} color="#e85a67" />
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 9 }}>
        {isLoading ? (
          <StatusText>Đang tải sản phẩm từ {API_BASE_URL}...</StatusText>
        ) : errorMessage ? (
          <StatusText tone="error">{errorMessage}</StatusText>
        ) : visibleProducts.length === 0 ? (
          <StatusText>Không có sản phẩm trong danh mục này.</StatusText>
        ) : (
          visibleProducts.map((item, index) => <ProductRow key={item._id ?? item.idMon} item={item} accent={accents[index % accents.length]} />)
        )}
      </View>
    </ScreenShell>
  );
}

function ProductRow({ item, accent }: { item: MonAn; accent: string }) {
  return (
    <View style={{ minHeight: 94, flexDirection: 'row', alignItems: 'center' }}>
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
        <Text selectable style={{ color: '#05122f', fontSize: 15, fontWeight: '800' }}>
          {item.tenMon}
        </Text>
        <Text selectable style={{ marginTop: 5, color: '#05122f', fontSize: 14 }}>
          {formatCurrency(item.gia)}
        </Text>
      </View>
      <Pressable
        style={{
          alignSelf: 'center',
          minWidth: 72,
          height: 27,
          borderRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f1f3f3',
        }}>
        <Text selectable style={{ color: '#05122f', fontSize: 14 }}>
          Còn hàng
        </Text>
      </Pressable>
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

function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}
