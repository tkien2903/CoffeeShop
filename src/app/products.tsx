import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { BrandHeader, ProductImage, ScreenShell, palette } from '@/components/coffee-ui';

const categories = ['Trà', 'Cà Phê', 'Trà Sữa', 'Matcha', 'Bánh'];
const products = [
  { name: 'Trà Sen Vải', price: '45.000đ', accent: '#b60d28', stock: true },
  { name: 'Trà Đào Cam Sả', price: '35.000đ', accent: '#ffbd28', stock: true },
  { name: 'Sen Lài Thượng Hạng', price: '39.000đ', accent: '#ffcf52', stock: true },
  { name: 'Coldbrew Kim Quất', price: '45.000đ', accent: '#5a1f18', stock: false },
  { name: 'Coldbrew TK21', price: '42.000đ', accent: '#d88933', stock: true },
];

export default function ProductsScreen() {
  return (
    <ScreenShell active="products">
      <BrandHeader />
      <View style={{ flexDirection: 'row', height: 34, borderBottomWidth: 1, borderColor: palette.line }}>
        {categories.map((item) => (
          <View
            key={item}
            style={{
              justifyContent: 'center',
              paddingHorizontal: 12,
              backgroundColor: item === 'Trà Sữa' ? '#f5efff' : '#fff',
              borderWidth: item === 'Trà Sữa' ? 2 : 0,
              borderColor: '#9049ff',
            }}>
            <Text selectable style={{ color: palette.ink, fontFamily: 'serif', fontSize: 16 }}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 13, paddingHorizontal: 20, paddingTop: 10 }}>
        <Ionicons name="add-circle" size={24} color="#314b86" />
        <Ionicons name="create-outline" size={24} color="#8c8c8c" />
        <Ionicons name="remove-circle" size={24} color="#e85a67" />
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 9 }}>
        {products.map((item) => (
          <View key={item.name} style={{ minHeight: 94, flexDirection: 'row', alignItems: 'center' }}>
            <ProductImage accent={item.accent} />
            <View style={{ flex: 1, paddingLeft: 14 }}>
              <Text selectable style={{ color: '#05122f', fontSize: 15, fontWeight: '800' }}>
                {item.name}
              </Text>
              <Text selectable style={{ marginTop: 5, color: '#05122f', fontSize: 14 }}>
                {item.price}
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
                {item.stock ? 'Còn hàng' : 'Hết hàng'}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}
