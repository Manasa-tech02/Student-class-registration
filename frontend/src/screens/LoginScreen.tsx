import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { LabeledInput } from "../components/LabeledInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../api";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function LoginScreen(props: {
  onSignedIn: (token: string, refreshToken: string) => void;
  onGoToSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canSubmit = email.trim().length > 0 && password.length > 0;

  function validateLoginForm() {
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!isValidEmail(email.trim())) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Password is required";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.card}>
        <Text style={styles.title}>ClassReg</Text>
        <Text style={styles.subtitle}>Sign in with your university account</Text>

        <LabeledInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            const trimmed = text.trim();
            setFieldErrors((prev) => ({
              ...prev,
              email:
                trimmed.length === 0
                  ? prev.email
                  : isValidEmail(trimmed)
                    ? ""
                    : "Enter a valid email address",
            }));
          }}
          placeholder="e.g. stu20240185@university.edu"
          keyboardType="email-address"
          autoCapitalize="none"
          errorText={fieldErrors.email}
        />

        <LabeledInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
          }}
          placeholder=""
          secureTextEntry={!showPassword}
          errorText={fieldErrors.password}
          rightActionText={showPassword ? "Hide" : "Show"}
          onPressRightAction={() => setShowPassword((prev) => !prev)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title={submitting ? "Signing in..." : "Sign in"}
          disabled={submitting || !canSubmit}
          onPress={async () => {
            setError(null);
            if (!validateLoginForm()) return;
            setSubmitting(true);
            try {
              const result = await login({ email: email.trim(), password });
              props.onSignedIn(result.token, result.refreshToken);
            } catch (e) {
              setError(e instanceof Error ? e.message : String(e));
            } finally {
              setSubmitting(false);
            }
          }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New here?</Text>
          <Text style={styles.link} onPress={props.onGoToSignup}>
            {" "}
            Create an account
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232323",
    paddingHorizontal: 18,
    paddingTop: 60,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#2e2e2e",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    color: "#cfcfcf",
    textAlign: "center",
    marginBottom: 22,
    fontSize: 13,
  },
  error: {
    color: "#ff8a8a",
    marginBottom: 12,
    backgroundColor: "rgba(255, 138, 138, 0.1)",
    borderColor: "rgba(255, 138, 138, 0.4)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerRow: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "center",
  },
  footerText: {
    color: "#cfcfcf",
    fontSize: 13,
  },
  link: {
    color: "#7aa6e3",
    fontSize: 13,
    fontWeight: "700",
  },
});

