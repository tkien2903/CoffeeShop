import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View, TextInputProps } from 'react-native';

import { palette } from '@/components/coffee-ui';

type FormSheetProps = PropsWithChildren<{
  visible: boolean;
  title: string;
  onClose: () => void;
}>;

export function FormSheet({ visible, title, onClose, children }: FormSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            maxHeight: '88%',
            backgroundColor: '#fff',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            paddingBottom: 24,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingTop: 16,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderBottomColor: palette.line,
            }}>
            <Text selectable style={{ flex: 1, fontWeight: '900', fontSize: 16, color: palette.ink }}>
              {title}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text selectable style={{ color: palette.muted, fontWeight: '800' }}>
                Đóng
              </Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 18, gap: 12 }}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function FormField({
  label,
  children,
}: PropsWithChildren<{
  label: string;
}>) {
  return (
    <View style={{ gap: 6 }}>
      <Text selectable style={{ fontSize: 12, fontWeight: '800', color: palette.muted }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function FormInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9b9aa0"
      {...props}
      style={[
        {
          minHeight: 40,
          borderWidth: 1,
          borderColor: '#ded9cf',
          borderRadius: 8,
          paddingHorizontal: 12,
          fontSize: 14,
          color: palette.ink,
          backgroundColor: palette.cream,
        },
        props.style,
      ]}
    />
  );
}

export function FormActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  dangerLabel,
  onDanger,
  disabled = false,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  dangerLabel?: string;
  onDanger?: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: 10, marginTop: 4 }}>
      <Pressable
        disabled={disabled}
        onPress={onPrimary}
        style={({ pressed }) => ({
          minHeight: 42,
          borderRadius: 8,
          backgroundColor: palette.ink,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed || disabled ? 0.65 : 1,
        })}>
        <Text selectable style={{ color: '#fff', fontWeight: '900' }}>
          {primaryLabel}
        </Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable onPress={onSecondary} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text selectable style={{ color: palette.muted, fontWeight: '700' }}>
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
      {dangerLabel && onDanger ? (
        <Pressable onPress={onDanger} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text selectable style={{ color: palette.red, fontWeight: '900' }}>
            {dangerLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
