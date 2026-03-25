import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { AuthStack } from "./AuthStack";
import { MainStack } from "./MainStack";
import { AdminStack } from "./AdminStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { token, user, isInitializing: isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#7aa6e3" />
        <Text style={styles.splashText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        user?.role === "admin" ? (
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : (
          <Stack.Screen name="Main" component={MainStack} />
        )
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
          options={{ animationTypeForReplace: "pop" }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  splashText: {
    marginTop: 12,
    color: "#7a7a90",
    fontSize: 14,
  },
});
