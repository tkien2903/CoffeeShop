import { Image } from 'expo-image';
import { Link, Href } from 'expo-router';
import { PropsWithChildren } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { homeRouteFor } from '@/services/session';

export const palette = {
  ink: '#302d43',
  muted: '#9b9aa0',
  line: '#ddd9d4',
  paper: '#fffdf9',
  cream: '#fbf8ee',
  panel: '#f4f1ec',
  panelAlt: '#dedede',
  orange: '#f9aa23',
  yellow: '#ffe43b',
  green: '#54cf2d',
  red: '#f3545b',
  brown: '#796762',
};

type AppRoute = Href;

export function BrandHeader({ underline = true }: { underline?: boolean }) {
  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 8,
        borderBottomWidth: underline ? 1 : 0,
        borderBottomColor: palette.line,
        backgroundColor: '#fff',
      }}>
      <Text selectable style={{ fontFamily: 'serif', fontStyle: 'italic', fontSize: 20, color: '#201b1b' }}>
        The Coffee House
      </Text>
    </View>
  );
}

export function ScreenShell({
  active,
  children,
  scroll = true,
}: PropsWithChildren<{ active: 'home' | 'products' | 'orders' | 'more'; scroll?: boolean }>) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={{
        flexGrow: 1,
        paddingBottom: 88 + insets.bottom,
        backgroundColor: '#fff',
      }}>
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      {scroll ? (
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ flexGrow: 1 }}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      <BottomNav active={active} bottom={insets.bottom} />
    </View>
  );
}

function BottomNav({ active, bottom }: { active: 'home' | 'products' | 'orders' | 'more'; bottom: number }) {
  const homePath = homeRouteFor();
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 72 + bottom,
        paddingBottom: bottom,
        flexDirection: 'row',
        backgroundColor: palette.orange,
      }}>
      <NavItem href={homePath} label="Trang chủ" active={active === 'home'} icon="home-outline" />
      <NavItem href="/products" label="Sản phẩm" active={active === 'products'} materialIcon="book-open-page-variant-outline" />
      <NavItem href="/orders" label="Đơn hàng" active={active === 'orders'} materialIcon="coffee-outline" />
      <NavItem href="/more" label="Khác" active={active === 'more'} icon="menu-outline" />
    </View>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
  materialIcon,
}: {
  href: AppRoute;
  label: string;
  active: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  materialIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: active ? palette.yellow : palette.orange,
        }}>
        {icon ? (
          <Ionicons name={icon} size={28} color="#fff" />
        ) : (
          <MaterialCommunityIcons name={materialIcon ?? 'circle-outline'} size={30} color="#fff" />
        )}
        <Text selectable style={{ color: '#fff', fontSize: 11, fontFamily: 'serif', fontWeight: '700' }}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export function CoffeeLogo({ size = 112 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/images/coffee_shop.png')}
      contentFit="contain"
      style={{ width: size, height: size }}
    />
  );
}

export function ProductImage({ accent }: { accent: string }) {
  return (
    <View style={{ width: 76, height: 78, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 46,
          height: 58,
          borderRadius: 12,
          backgroundColor: accent,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#eee',
        }}>
        <View style={{ height: 18, backgroundColor: 'rgba(255,255,255,0.72)' }} />
        <View style={{ flex: 1, backgroundColor: 'rgba(85,45,27,0.30)' }} />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 3,
          bottom: 8,
          width: 19,
          height: 19,
          borderRadius: 10,
          backgroundColor: '#ff7b32',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text selectable style={{ color: '#fff', fontSize: 6, fontWeight: '800' }}>
          NEW
        </Text>
      </View>
    </View>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return (
    <Text selectable style={{ fontWeight: '800', color: palette.ink, fontSize: 14 }}>
      {children}
    </Text>
  );
}
