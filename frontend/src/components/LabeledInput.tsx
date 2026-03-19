import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function LabeledInput(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
  errorText?: string;
  rightActionText?: string;
  onPressRightAction?: () => void;
}) {
  const {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    autoCapitalize = "none",
    keyboardType = "default",
    errorText,
    rightActionText,
    onPressRightAction,
  } = props;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, errorText ? styles.inputWrapperError : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7c7c7c"
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={styles.input}
        />
        {rightActionText && onPressRightAction ? (
          <Pressable onPress={onPressRightAction} hitSlop={8}>
            <Text style={styles.rightAction}>{rightActionText}</Text>
          </Pressable>
        ) : null}
      </View>
      {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
    gap: 8,
    marginBottom: 14,
  },
  label: {
    color: "#d9d9d9",
    fontSize: 13,
    fontWeight: "600",
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#2b2b2b",
    borderWidth: 1,
    borderColor: "#4b4b4b",
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapperError: {
    borderColor: "#ff8a8a",
  },
  input: {
    flex: 1,
    color: "#f5f5f5",
  },
  rightAction: {
    color: "#7aa6e3",
    fontWeight: "700",
    fontSize: 12,
    paddingLeft: 12,
  },
  errorText: {
    color: "#ff8a8a",
    fontSize: 12,
  },
});

