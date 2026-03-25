import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./src/store/store";
import { AuthLoader } from "./src/components/AuthLoader";
import { RootNavigator } from "./src/navigation/RootNavigator";

const navTheme = {
  dark: true,
  colors: {
    primary: "#7aa6e3",
    background: "#1a1a2e",
    card: "#16213e",
    text: "#fff",
    border: "#2e2e4a",
    notification: "#ff8a8a",
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "800" as const },
  },
};

export default function App() {
  return (
    <Provider store={store}>
      <AuthLoader>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </AuthLoader>
    </Provider>
  );
}
