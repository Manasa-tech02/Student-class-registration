import { Pressable, StyleSheet, Text } from "react-native";

export function PrimaryButton(props: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { title, onPress, disabled } = props;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        disabled ? styles.buttonDisabled : null,
        pressed && !disabled ? styles.buttonPressed : null,
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7aa6e3",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#0b1b2e",
    fontWeight: "700",
    fontSize: 16,
  },
});

