import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { User } from "./src/api";
import { getMe } from "./src/api";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";

type Screen = "login" | "signup" | "dashboard";

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const apiReady = useMemo(() => screen, [screen]);

  async function signInAndLoadMe(nextToken: string) {
    setAuthLoading(true);
    setAuthError(null);
    setToken(nextToken);

    try {
      const res = await getMe(nextToken);
      setUser(res.user);
      setScreen("dashboard");
    } catch (e) {
      setToken(null);
      setUser(null);
      setScreen("login");
      setAuthError(e instanceof Error ? e.message : String(e));
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {authLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Signing you in...</Text>
        </View>
      ) : null}

      {authError ? <Text style={styles.error}>{authError}</Text> : null}

      {screen === "login" ? (
        <LoginScreen
          onSignedIn={(nextToken) => signInAndLoadMe(nextToken)}
          onGoToSignup={() => setScreen("signup")}
        />
      ) : null}

      {screen === "signup" ? (
        <SignupScreen
          onSignedUp={(nextToken) => signInAndLoadMe(nextToken)}
          onGoToLogin={() => setScreen("login")}
        />
      ) : null}

      {screen === "dashboard" && token && user ? (
        <DashboardScreen
          token={token}
          user={user}
          onBackToLogin={() => {
            setToken(null);
            setUser(null);
            setScreen("login");
          }}
        />
      ) : null}

      {/* Helps ensure we don't end up with an empty screen on unexpected state. */}
      {!authLoading && screen === apiReady && !token && screen !== "login" && screen !== "signup" ? (
        <View style={styles.center}>
          <Text style={styles.error}>Please log in again.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#232323" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { marginTop: 10, color: "#cfcfcf", fontSize: 13 },
  error: { position: "absolute", top: 70, left: 20, right: 20, color: "#ff8a8a" },
});
