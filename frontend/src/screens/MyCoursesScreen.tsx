import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainScreenProps } from "../navigation/types";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { EnrolledCourse } from "../api";
// Replaced getMyCourses with RTK query

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars: string[] = [];
  for (let i = 0; i < full; i++) stars.push("star");
  if (half) stars.push("star-half");
  while (stars.length < 5) stars.push("star-outline");
  return stars;
}

import { useGetMyCoursesQuery } from "../features/courses/coursesApi";

export function MyCoursesScreen({ navigation }: MainScreenProps<"MyCourses">) {
  const { data, isLoading: loading, error: rtkError, isFetching, refetch } = useGetMyCoursesQuery();
  const courses = data?.courses || [];
  const error = rtkError ? "Failed to load enrolled courses" : null;

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7aa6e3" />
          <Text style={styles.loadingText}>Loading your courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={44} color="#ff8a8a" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.7 }]}
            onPress={() => refetch()}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="school-outline" size={48} color="#7a7a90" />
          </View>
          <Text style={styles.emptyTitle}>No enrolled courses yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse available classes and enroll to get started
          </Text>
          <Pressable
            style={({ pressed }) => [styles.browseBtn, pressed && { opacity: 0.8 }]}
            onPress={() => navigation.navigate("CourseCatalog")}
          >
            <Ionicons name="book-outline" size={18} color="#fff" />
            <Text style={styles.browseBtnText}>Browse Classes</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.enrollment_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() => refetch()}
              tintColor="#7aa6e3"
              colors={["#7aa6e3"]}
            />
          }
          ListHeaderComponent={
            <Text style={styles.countLabel}>
              {courses.length} {courses.length === 1 ? "course" : "courses"} enrolled
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardBadge}>
                  <Ionicons name="school" size={16} color="#82dca0" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.class_name}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color="#7a7a90" />
                  <Text style={styles.metaText}>{item.professor}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color="#7a7a90" />
                  <Text style={styles.metaText}>{item.duration}</Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.starsRow}>
                  {renderStars(item.rating).map((star, i) => (
                    <Ionicons key={i} name={star as any} size={14} color="#f5c842" />
                  ))}
                  <Text style={styles.ratingNum}>{item.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.enrolledBadge}>
                  <Ionicons name="calendar-outline" size={12} color="#7aa6e3" />
                  <Text style={styles.enrolledText}>
                    {formatDate(item.enrolled_at)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 30,
  },
  loadingText: {
    color: "#7a7a90",
    fontSize: 14,
  },
  errorText: {
    color: "#ff8a8a",
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7aa6e3",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(122,122,144,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  emptySubtitle: {
    color: "#7a7a90",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7aa6e3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  browseBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    padding: 18,
    paddingBottom: 30,
  },
  countLabel: {
    color: "#7a7a90",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#20203a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(130,220,160,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    color: "#7a7a90",
    fontSize: 13,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingNum: {
    color: "#f5c842",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  enrolledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(122,166,227,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  enrolledText: {
    color: "#7aa6e3",
    fontSize: 12,
    fontWeight: "600",
  },
});
