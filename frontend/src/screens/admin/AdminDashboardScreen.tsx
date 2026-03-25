import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AdminScreenProps } from "../../navigation/types";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { clearTokens } from "../../authTokenStorage";
import type { RootState } from "../../store/store";
import { useGetAdminStatsQuery } from "../../features/admin/adminApi";

const SIDEBAR_WIDTH = 280;

function getGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function getInitials(first?: string, last?: string) {
  const a = first?.trim()?.[0] ?? "";
  const b = last?.trim()?.[0] ?? "";
  const initials = `${a}${b}`.toUpperCase();
  return initials.length ? initials : "A";
}

export function AdminDashboardScreen({ navigation }: AdminScreenProps<"AdminDashboard">) {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const signOut = async () => {
    await clearTokens();
    dispatch(logout());
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const { data: stats, isLoading: loading, error: rtkError } = useGetAdminStatsQuery();
  const error = rtkError ? "Failed to load stats" : null;

  const greeting = useMemo(() => getGreeting(), []);
  const initials = useMemo(
    () => getInitials(user?.first_name, user?.last_name),
    [user]
  );
  const displayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    return full.length ? full : "Admin User";
  }, [user]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: menuOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: menuOpen ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [menuOpen, slideAnim, overlayAnim]);

  // RTK Query handles fetching stats automatically

  function closeMenu() {
    setMenuOpen(false);
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* ── Header Bar ── */}
      <View style={styles.header}>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
          <Ionicons name="menu" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.brandName}>UniFlow Admin</Text>
        <View style={styles.headerRight}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{initials}</Text>
          </View>
        </View>
      </View>

      {/* ── Welcome Section ── */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>{greeting},</Text>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.subtitle}>Here's an overview of the university systems.</Text>
      </View>

      {/* ── Stats ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#7aa6e3" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : stats ? (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.studentCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.courseCount}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.enrollmentCount}</Text>
            <Text style={styles.statLabel}>Enrollments</Text>
          </View>
        </View>
      ) : null}

      {/* ── Quick Actions ── */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => navigation.navigate("AllStudents")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(122,166,227,0.15)" }]}>
            <Ionicons name="people-outline" size={28} color="#7aa6e3" />
          </View>
          <Text style={styles.actionTitle}>View Students</Text>
          <Text style={styles.actionDesc}>Manage student accounts</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => navigation.navigate("ManageCourses")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(130,220,160,0.15)" }]}>
            <Ionicons name="school-outline" size={28} color="#82dca0" />
          </View>
          <Text style={styles.actionTitle}>Manage Courses</Text>
          <Text style={styles.actionDesc}>Add, edit, or delete classes</Text>
        </Pressable>
      </View>

      {/* ── Sidebar Modal ── */}
      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeMenu} />
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
              onPress={() => {
                closeMenu();
                navigation.navigate("AdminDashboard");
              }}
            >
              <Ionicons name="home-outline" size={22} color="#d9d9d9" />
              <Text style={styles.sidebarItemText}>Dashboard</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
              onPress={() => {
                closeMenu();
                navigation.navigate("AllStudents");
              }}
            >
              <Ionicons name="people-outline" size={22} color="#d9d9d9" />
              <Text style={styles.sidebarItemText}>Students</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
              onPress={() => {
                closeMenu();
                navigation.navigate("ManageCourses");
              }}
            >
              <Ionicons name="book-outline" size={22} color="#d9d9d9" />
              <Text style={styles.sidebarItemText}>Courses</Text>
            </Pressable>

            <View style={{ flex: 1 }} />

            <View style={styles.sidebarDivider} />
            <Pressable
              style={({ pressed }) => [styles.sidebarItem, pressed && styles.sidebarItemPressed]}
              onPress={() => {
                closeMenu();
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#ff8a8a" />
              <Text style={[styles.sidebarItemText, { color: "#ff8a8a" }]}>Logout</Text>
            </Pressable>

            <View style={{ height: 30 }} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#ff8a8a" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#16213e",
  },
  brandName: {
    flex: 1,
    textAlign: "center",
    color: "#7aa6e3",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerRight: { width: 36, alignItems: "flex-end" },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e37a7a", // Reddish for admin
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmallText: { color: "#2e0b0b", fontWeight: "800", fontSize: 12 },
  welcomeSection: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 10 },
  greeting: { color: "#a0a0b8", fontSize: 15 },
  userName: { color: "#fff", fontSize: 26, fontWeight: "800", marginTop: 2 },
  subtitle: { color: "#7a7a90", fontSize: 13, marginTop: 8 },
  
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 18,
    gap: 12,
    marginTop: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#20203a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  statValue: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: "#7a7a90", fontSize: 12, fontWeight: "600" },

  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 18,
    gap: 14,
    marginTop: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#20203a",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  actionCardPressed: { opacity: 0.85, borderColor: "#e37a7a" },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 4 },
  actionDesc: { color: "#7a7a90", fontSize: 12 },

  modalRoot: { flex: 1, flexDirection: "row" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
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
  sidebarHeader: { marginBottom: 10 },
  sidebarAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e37a7a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  sidebarAvatarText: { color: "#2e0b0b", fontWeight: "800", fontSize: 20 },
  sidebarName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  sidebarEmail: { color: "#7a7a90", fontSize: 13, marginTop: 3 },
  sidebarDivider: { height: 1, backgroundColor: "#2e2e4a", marginVertical: 16 },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  sidebarItemPressed: { backgroundColor: "rgba(227,122,122,0.1)" },
  sidebarItemText: { color: "#d9d9d9", fontSize: 16, fontWeight: "600" },
});
