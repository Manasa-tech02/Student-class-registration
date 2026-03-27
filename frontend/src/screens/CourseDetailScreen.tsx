import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainScreenProps } from "../navigation/types";
import { useEnrollInCourseMutation, useGetMyCoursesQuery } from "../features/courses/coursesApi";

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars: string[] = [];
  for (let i = 0; i < full; i++) stars.push("star");
  if (half) stars.push("star-half");
  while (stars.length < 5) stars.push("star-outline");
  return stars;
}

export function CourseDetailScreen({ navigation, route }: MainScreenProps<"CourseDetail">) {
  const { course } = route.params;
  const [enrollInCourseApi, { isLoading: enrolling }] = useEnrollInCourseMutation();
  const { data: myCoursesData, isLoading: myCoursesLoading, refetch } = useGetMyCoursesQuery();
  const [error, setError] = useState<string | null>(null);

  const isRegistered = myCoursesData?.courses?.some((c) => c.id === course.id) ?? false;

  async function handleEnroll() {
    setError(null);
    try {
      if (isRegistered) return;
      await enrollInCourseApi(course.id).unwrap();
      // Enrollment succeeded; send user back to dashboard.
      await refetch();
      navigation.navigate("Dashboard");
    } catch (e: any) {
      const msg = e?.data?.error || e?.message || String(e);
      if (msg.toLowerCase().includes("already enrolled")) {
        setError(null);
        await refetch(); // Ensure UI state is consistent with backend.
        navigation.navigate("Dashboard");
        return;
      }
      setError(msg);
    }
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Course Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Ionicons name="book" size={32} color="#7aa6e3" />
          </View>
          <Text style={styles.courseName}>{course.class_name}</Text>
          <View style={styles.starsRow}>
            {renderStars(course.rating).map((star, i) => (
              <Ionicons key={i} name={star as any} size={18} color="#f5c842" />
            ))}
            <Text style={styles.ratingNum}>{course.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* ── Info Cards ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="person-outline" size={20} color="#7aa6e3" />
            <Text style={styles.infoLabel}>Professor</Text>
            <Text style={styles.infoValue}>{course.professor}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color="#82dca0" />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{course.duration}</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="people-outline" size={20} color="#f5c842" />
            <Text style={styles.infoLabel}>Capacity</Text>
            <Text style={styles.infoValue}>{course.capacity} students</Text>
          </View>
        </View>

        {/* ── Description ── */}
        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#ff8a8a" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Enroll Button ── */}
        <Pressable
          style={({ pressed }) => [
            styles.enrollBtn,
            isRegistered && styles.enrolledBtn,
            pressed && !isRegistered && !enrolling && styles.enrollBtnPressed,
          ]}
          onPress={isRegistered || myCoursesLoading || enrolling ? undefined : handleEnroll}
          disabled={isRegistered || myCoursesLoading || enrolling}
        >
          {enrolling ? (
            <ActivityIndicator color="#0b1b2e" />
          ) : isRegistered ? (
            <View style={styles.enrolledContent}>
              <Ionicons name="checkmark-circle" size={22} color="#0b1b2e" />
              <Text style={styles.enrollBtnText}>Registered</Text>
            </View>
          ) : (
            <Text style={styles.enrollBtnText}>Register for this Course</Text>
          )}
        </Pressable>
      </ScrollView>
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
    paddingBottom: 14,
    backgroundColor: "#16213e",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 24,
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(122,166,227,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  courseName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingNum: {
    color: "#f5c842",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#20203a",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  infoLabel: {
    color: "#7a7a90",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    color: "#d9d9d9",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  descSection: {
    backgroundColor: "#20203a",
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  description: {
    color: "#a0a0b8",
    fontSize: 14,
    lineHeight: 22,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,138,138,0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,138,138,0.3)",
  },
  errorText: {
    color: "#ff8a8a",
    fontSize: 13,
    flex: 1,
  },
  enrollBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7aa6e3",
  },
  enrollBtnPressed: {
    opacity: 0.85,
  },
  enrolledBtn: {
    backgroundColor: "#82dca0",
  },
  enrolledContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  enrollBtnText: {
    color: "#0b1b2e",
    fontWeight: "800",
    fontSize: 16,
  },
});
