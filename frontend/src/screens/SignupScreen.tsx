import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import type { AuthScreenProps } from "../navigation/types";
import { useDispatch } from "react-redux";
import { setCredentials, logout } from "../features/auth/authSlice";
import { useSignupMutation, useLazyGetMeQuery } from "../features/auth/authApi";
import { saveTokens, clearTokens } from "../authTokenStorage";
import { LabeledInput } from "../components/LabeledInput";
import { PrimaryButton } from "../components/PrimaryButton";
import { getApiErrorMessage } from "../getApiErrorMessage";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SignupScreen({ navigation }: AuthScreenProps<"Signup">) {
  const dispatch = useDispatch();
  const [signupApi] = useSignupMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateForm() {
    const nextErrors: Record<string, string> = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedStudentId = studentId.trim();

    if (!trimmedFirstName) nextErrors.firstName = "First name is required";
    if (!trimmedLastName) nextErrors.lastName = "Last name is required";
    if (!trimmedEmail) nextErrors.email = "Email is required";
    else if (!isValidEmail(trimmedEmail)) nextErrors.email = "Enter a valid email address";
    if (!trimmedStudentId) nextErrors.studentId = "Student ID is required";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password";
    if (password && confirmPassword && password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(nextErrors);
    return {
      isValid: Object.keys(nextErrors).length === 0,
      trimmedFirstName,
      trimmedLastName,
      trimmedEmail,
      trimmedStudentId,
    };
  }

  const hasAllRequiredFields =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    studentId.trim().length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0;
  const hasValidBasics = isValidEmail(email.trim()) && password.length >= 6;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Sign up with your university details</Text>

        <LabeledInput
          label="First name"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: "" }));
          }}
          placeholder=""
          autoCapitalize="words"
          errorText={fieldErrors.firstName}
        />
        <LabeledInput
          label="Last name"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: "" }));
          }}
          placeholder=""
          autoCapitalize="words"
          errorText={fieldErrors.lastName}
        />
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
          label="Student ID"
          value={studentId}
          onChangeText={(text) => {
            setStudentId(text);
            if (fieldErrors.studentId) setFieldErrors((prev) => ({ ...prev, studentId: "" }));
          }}
          placeholder="e.g. STU20240185"
          autoCapitalize="none"
          keyboardType="default"
          errorText={fieldErrors.studentId}
        />
        <LabeledInput
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setFieldErrors((prev) => ({
              ...prev,
              password:
                text.length === 0
                  ? prev.password
                  : text.length >= 6
                    ? ""
                    : "Password must be at least 6 characters",
              confirmPassword:
                confirmPassword.length > 0 && text !== confirmPassword
                  ? "Passwords do not match"
                  : prev.confirmPassword,
            }));
          }}
          placeholder=""
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          errorText={fieldErrors.password}
          rightActionText={showPassword ? "Hide" : "Show"}
          onPressRightAction={() => setShowPassword((prev) => !prev)}
        />
        <LabeledInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setFieldErrors((prev) => ({
              ...prev,
              confirmPassword:
                text.length === 0 ? prev.confirmPassword : text === password ? "" : "Passwords do not match",
            }));
          }}
          placeholder=""
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          errorText={fieldErrors.confirmPassword}
          rightActionText={showConfirmPassword ? "Hide" : "Show"}
          onPressRightAction={() => setShowConfirmPassword((prev) => !prev)}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title={submitting ? "Creating..." : "Sign up"}
          disabled={submitting || !hasAllRequiredFields || !hasValidBasics}
          onPress={async () => {
            setError(null);
            const result = validateForm();
            if (!result.isValid) return;
            setSubmitting(true);
            try {
              const response = await signupApi({
                first_name: result.trimmedFirstName,
                last_name: result.trimmedLastName,
                email: result.trimmedEmail,
                student_id: result.trimmedStudentId,
                password,
              }).unwrap();
              
              await saveTokens(response.token, response.refreshToken);
              const userRes = await triggerGetMe().unwrap();
              dispatch(setCredentials({ user: userRes.user, token: response.token }));
            } catch (e: any) {
              await clearTokens();
              dispatch(logout());
              setError(getApiErrorMessage(e, "Failed to sign up"));
            } finally {
              setSubmitting(false);
            }
          }}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            {" "}
            Log in
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    paddingHorizontal: 18,
    paddingTop: 60,
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#20203a",
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#cfcfcf",
    textAlign: "center",
    marginBottom: 18,
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
    flexWrap: "wrap",
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
