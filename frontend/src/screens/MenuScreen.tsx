import { useEffect, useMemo, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import type { MainScreenProps } from "../navigation/types";
import type { RootState } from "../store/store";
import { logout } from "../features/auth/authSlice";
import { clearTokens } from "../authTokenStorage";

const SIDEBAR_WIDTH = 280;

function getInitials(first?: string, last?: string) {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  const initials = `${a}${b}`.toUpperCase();
  return initials.length ? initials : "U";
}

function getDisplayName(user: RootState["auth"]["user"]) {
  if (!user) return "";
  const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return full.length ? full : user.email;
}

export function MenuScreen({ navigation }: MainScreenProps<"Menu">) {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const signOut = async () => {
    await clearTokens();
    dispatch(logout());
  };

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const initials = useMemo(() => getInitials(user?.first_name, user?.last_name), [user]);
  const displayName = useMemo(() => getDisplayName(user), [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, overlayAnim]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => navigation.goBack()} />
      </Animated.View>

      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.sidebarHeader}>
          <View style={styles.sidebarAvatar}>
            <Text style={styles.sidebarAvatarText}>{initials}</Text>
          </View>
          <Text style={styles.sidebarName}>{displayName}</Text>
          <Text style={styles.sidebarEmail}>{user.email}</Text>
        </View>

        <View style={styles.sidebarDivider} />

        <Pressable
          style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
          onPress={() => navigation.replace("CourseCatalog")}
        >
          <Ionicons name="book-outline" size={22} color="#d9d9d9" />
          <Text style={styles.sidebarItemText}>Classes</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
          onPress={() => navigation.replace("MyCourses")}
        >
          <Ionicons name="school-outline" size={22} color="#d9d9d9" />
          <Text style={styles.sidebarItemText}>My Courses</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <View style={styles.sidebarDivider} />

        <Pressable
          style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff8a8a" />
          <Text style={[styles.sidebarItemText, { color: "#ff8a8a" }]}>Logout</Text>
        </Pressable>

        <View style={{ height: 30 }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: "#16213e",
    paddingTop: 60,
    paddingHorizontal: 20,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sidebarHeader: {
    marginBottom: 10,
  },
  sidebarAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7aa6e3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  sidebarAvatarText: {
    color: "#0b1b2e",
    fontWeight: "800",
    fontSize: 20,
  },
  sidebarName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  sidebarEmail: {
    color: "#7a7a90",
    fontSize: 13,
    marginTop: 3,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#2e2e4a",
    marginVertical: 16,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  sidebarItemPressed: {
    backgroundColor: "rgba(122,166,227,0.1)",
  },
  sidebarItemText: {
    color: "#d9d9d9",
    fontSize: 16,
    fontWeight: "600",
  },
});

