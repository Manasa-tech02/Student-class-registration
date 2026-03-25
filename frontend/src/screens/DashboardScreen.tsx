import { useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainScreenProps } from "../navigation/types";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useGetCoursesQuery, useGetMyCoursesQuery } from "../features/courses/coursesApi";

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
  return initials.length ? initials : "U";
}

export function DashboardScreen({ navigation }: MainScreenProps<"Dashboard">) {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useGetCoursesQuery();
  const {
    data: myCoursesData,
    isLoading: myCoursesLoading,
    isError: myCoursesError,
  } = useGetMyCoursesQuery();

  const greeting = useMemo(() => getGreeting(), []);
  const initials = useMemo(
    () => getInitials(user?.first_name, user?.last_name),
    [user],
  );
  const displayName = useMemo(() => {
    if (!user) return "";
    const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    return full.length ? full : user.email;
  }, [user]);

  if (!user) return null;

  const totalClasses = coursesData?.courses?.length ?? 0;
  const enrolledClasses = myCoursesData?.courses?.length ?? 0;

  return (
    <View style={styles.container}>
      {/* ── Header Bar ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate("Menu")} hitSlop={10}>
          <Ionicons name="menu" size={26} color="#fff" />
        </Pressable>
        <Text style={styles.brandName}>UniFlow</Text>
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
        <Text style={styles.subtitle}>What would you like to do today?</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Classes</Text>
            {coursesLoading ? (
              <ActivityIndicator size="small" color="#7aa6e3" />
            ) : (
              <Text style={styles.statValue}>{coursesError ? 0 : totalClasses}</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Enrolled Classes</Text>
            {myCoursesLoading ? (
              <ActivityIndicator size="small" color="#82dca0" />
            ) : (
              <Text style={styles.statValue}>{myCoursesError ? 0 : enrolledClasses}</Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => navigation.navigate("CourseCatalog")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(122,166,227,0.15)" }]}>
            <Ionicons name="book-outline" size={28} color="#7aa6e3" />
          </View>
          <Text style={styles.actionTitle}>Browse Classes</Text>
          <Text style={styles.actionDesc}>View and register for courses</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => navigation.navigate("MyCourses")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "rgba(130,220,160,0.15)" }]}>
            <Ionicons name="school-outline" size={28} color="#82dca0" />
          </View>
          <Text style={styles.actionTitle}>My Courses</Text>
          <Text style={styles.actionDesc}>Track your enrolled classes</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
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
  headerRight: {
    width: 36,
    alignItems: "flex-end",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#7aa6e3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmallText: {
    color: "#0b1b2e",
    fontWeight: "800",
    fontSize: 12,
  },
  welcomeSection: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 10,
  },
  greeting: {
    color: "#a0a0b8",
    fontSize: 15,
  },
  userName: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 2,
  },
  subtitle: {
    color: "#7a7a90",
    fontSize: 13,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#20203a",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#2e2e4a",
    alignItems: "center",
  },
  statLabel: {
    color: "#7a7a90",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 18,
    gap: 14,
    marginTop: 18,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#20203a",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  actionCardPressed: {
    opacity: 0.85,
    borderColor: "#7aa6e3",
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  actionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  actionDesc: {
    color: "#7a7a90",
    fontSize: 12,
  },
});
