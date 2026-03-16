import { useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  secureToggle?: boolean;
};

export function AuthTextField({ label, error, secureTextEntry, secureToggle, style, ...rest }: AuthTextFieldProps) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const showToggle = !!secureToggle;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#999"
          secureTextEntry={hidden}
          {...rest}
        />
        {showToggle ? (
          <Pressable onPress={() => setHidden((prev) => !prev)} style={styles.toggle}>
            <ThemedText type="defaultSemiBold">{hidden ? 'Show' : 'Hide'}</ThemedText>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  toggle: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  error: {
    color: '#d11a2a',
    fontSize: 12,
  },
});

