import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <ThemedView style={styles.center}>
          <View style={styles.card}>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText style={styles.subtitle}>
                {subtitle}
              </ThemedText>
            ) : null}
            <View style={styles.content}>{children}</View>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  center: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    gap: 12,
    marginTop: 8,
  },
});

