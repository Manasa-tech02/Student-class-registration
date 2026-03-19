import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { getCourses } from "../api";
import type { Course, User } from "../api";
import { PrimaryButton } from "../components/PrimaryButton";

function getGreeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? "Good Morning" : "Good Afternoon";
}

function getInitials(user: User) {
  const a = user.first_name?.trim()?.[0] ?? "";
  const b = user.last_name?.trim()?.[0] ?? "";
  const initials = `${a}${b}`.toUpperCase();
  return initials.length ? initials : "U";
}

export function DashboardScreen(props: {
  user: User;
  token: string;
  onBackToLogin?: () => void;
}) {
  const { user, token } = props;
  const [view, setView] = useState<"home" | "courses">("home");
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const initials = useMemo(() => getInitials(user), [user]);
  const displayName = useMemo(() => {
    const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    return full.length ? full : user.email;
  }, [user]);

  useEffect(() => {
    if (view !== "courses") return;

    let cancelled = false;
    setLoadingCourses(true);
    setCoursesError(null);

    (async () => {
      try {
        const res = await getCourses(token);
        if (cancelled) return;
        setCourses(res.courses);
      } catch (e) {
        if (cancelled) return;
        setCoursesError(e instanceof Error ? e.message : String(e));
        setCourses([]);
      } finally {
        if (cancelled) return;
        setLoadingCourses(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, view]);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      <Text style={styles.greeting}>
        {greeting}, {displayName}
      </Text>

      {view === "home" ? (
        <>
          <Text style={styles.subtle}>Choose what you want to explore</Text>
          <View style={{ marginTop: 18, width: "100%" }}>
            <PrimaryButton
              title="view courses"
              onPress={() => setView("courses")}
            />
          </View>
          {props.onBackToLogin ? (
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                title="Log out"
                onPress={props.onBackToLogin}
              />
            </View>
          ) : null}
        </>
      ) : (
        <View style={{ marginTop: 18, width: "100%" }}>
          {loadingCourses ? <ActivityIndicator /> : null}
          {coursesError ? <Text style={styles.error}>{coursesError}</Text> : null}

          {coursesError ? null : courses?.length ? (
            <FlatList
              data={courses}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <View style={styles.courseCard}>
                  <Text style={styles.courseTitle}>{item.class_name}</Text>
                  <Text style={styles.courseMeta}>Professor: {item.professor}</Text>
                  <Text style={styles.courseMeta}>Duration: {item.duration}</Text>
                  <Text style={styles.courseMeta}>Rating: {item.rating}</Text>
                  <Text style={styles.courseMeta}>Capacity: {item.capacity}</Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.empty}>
              No courses available, please check back later
            </Text>
          )}

          <View style={{ marginTop: 16 }}>
            <PrimaryButton title="Back" onPress={() => setView("home")} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#232323",
    paddingHorizontal: 18,
    paddingTop: 50,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7aa6e3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0b1b2e",
    fontWeight: "800",
    fontSize: 14,
  },
  greeting: {
    marginTop: 14,
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  subtle: {
    marginTop: 10,
    color: "#cfcfcf",
    fontSize: 13,
  },
  error: {
    marginTop: 10,
    color: "#ff8a8a",
  },
  empty: {
    marginTop: 30,
    color: "#cfcfcf",
    fontSize: 15,
    textAlign: "center",
  },
  courseCard: {
    marginTop: 12,
    backgroundColor: "#2e2e2e",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  courseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  courseMeta: {
    color: "#d9d9d9",
    fontSize: 13,
    marginBottom: 4,
  },
});

