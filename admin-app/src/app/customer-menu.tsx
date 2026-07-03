import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { palette } from '@/components/coffee-ui';
import { coffeeApi, MonAn, LoaiMonAn } from '@/services/api';

export default function CustomerMenuScreen() {
  const { idBan } = useLocalSearchParams<{ idBan: string }>();

  const [categories, setCategories] = useState<LoaiMonAn[]>([]);
  const [products, setProducts] = useState<MonAn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    Promise.all([coffeeApi.getLoaiMonAn(), coffeeApi.getMonAn()])
      .then(([loaiData, monAnData]) => {
        if (isMounted) {
          setCategories(loaiData);
          setProducts(monAnData);
        }
      })
      .catch((err) => {
        console.warn('Failed to load menu data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.brown} />
        <Text style={styles.loadingText}>Đang tải thực đơn...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/qr')}>
          <Ionicons name="arrow-back" size={24} color={palette.ink} />
        </TouchableOpacity>
        <Text style={styles.title}>Menu Coffee Shop</Text>
        <Text style={styles.subtitle}>Đang xem cho Bàn {idBan || '?'}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.iconButton, { marginRight: 8 }]} 
            onPress={() => Linking.openURL('https://www.google.com/maps/search/?api=1&query=18A+Cộng+Hòa,+Tân+Bình,+Hồ+Chí+Minh')}
          >
            <Ionicons name="location" size={20} color={palette.ink} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => Linking.openURL('tel:0706818776')}
          >
            <Ionicons name="call" size={20} color={palette.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {categories.map((category) => {
        const categoryProducts = products.filter((p) => p.idLoai === category.idLoai);
        if (categoryProducts.length === 0) return null;

        return (
          <View key={category.idLoai} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.tenLoai}</Text>
            
            <View style={styles.grid}>
              {categoryProducts.map((product) => (
                <View key={product.idMon} style={styles.card}>
                  <View style={styles.imageContainer}>
                    {product.image ? (
                      <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
                    ) : (
                      <View style={[styles.image, styles.imagePlaceholder]} />
                    )}
                  </View>
                  <View style={styles.infoContainer}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.tenMon}
                    </Text>
                    <Text style={styles.productPrice}>
                      {product.gia.toLocaleString('vi-VN')} ₫
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
  loadingText: {
    marginTop: 12,
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
    alignItems: 'center',
    position: 'relative',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    zIndex: 10,
  },
  headerActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    zIndex: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: palette.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: palette.brown,
    fontWeight: '700',
    backgroundColor: '#F1E6DF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#EAEAEA',
  },
  infoContainer: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 6,
    height: 38,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: palette.brown,
  },
});
