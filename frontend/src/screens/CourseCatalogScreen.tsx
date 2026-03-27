import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MainScreenProps } from "../navigation/types";
import type { Course } from "../api";
import { useGetCoursesQuery, useGetMyCoursesQuery } from "../features/courses/coursesApi";

export function CourseCatalogScreen({ navigation }: MainScreenProps<"CourseCatalog">) {
  const { data, isLoading: loading, error: rtkError } = useGetCoursesQuery();
  const courses = data?.courses || [];
  const { data: myCoursesData, isLoading: myCoursesLoading } = useGetMyCoursesQuery();
  const registeredCourseIds = new Set((myCoursesData?.courses ?? []).map((c) => c.id));
  const error = rtkError ? "Failed to load courses" : null;
  const [search, setSearch] = useState("");

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.class_name.toLowerCase().includes(q) ||
      c.professor.toLowerCase().includes(q)
    );
  });

  function renderStars(rating: number) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const stars: string[] = [];
    for (let i = 0; i < full; i++) stars.push("star");
    if (half) stars.push("star-half");
    while (stars.length < 5) stars.push("star-outline");
    return stars;
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>All Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#7a7a90" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or professor..."
            placeholderTextColor="#555"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#7a7a90" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7aa6e3" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color="#ff8a8a" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={40} color="#555" />
          <Text style={styles.emptyText}>
            {search.trim() ? "No courses match your search" : "No courses available"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                !myCoursesLoading && registeredCourseIds.has(item.id) && styles.cardRegistered,
              ]}
              onPress={() => {
                // If enrolled-courses data isn't loaded yet, avoid navigating to a screen
                // that would allow an unnecessary enroll API call.
                if (myCoursesLoading) return;

                // If the user is already enrolled, do not navigate to course details.
                if (registeredCourseIds.has(item.id)) return;

                navigation.navigate("CourseDetail", { course: item });
              }}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardBadge}>
                  <Ionicons name="book" size={14} color="#7aa6e3" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.class_name}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#555" />
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
                <View style={styles.bottomRight}>
                  <View style={styles.capacityBadge}>
                    <Ionicons name="people-outline" size={13} color="#82dca0" />
                    <Text style={styles.capacityText}>{item.capacity} seats</Text>
                  </View>

                  {myCoursesLoading ? null : registeredCourseIds.has(item.id) ? (
                    <View style={styles.registeredBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#0b1b2e" />
                      <Text style={styles.registeredText}>Registered</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
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
  searchContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "#16213e",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20203a",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: "#2e2e4a",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    color: "#ff8a8a",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    color: "#7a7a90",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  listContent: {
    padding: 18,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#20203a",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  cardRegistered: {
    opacity: 0.85,
  },
  cardPressed: {
    borderColor: "#7aa6e3",
    backgroundColor: "#252545",
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
    backgroundColor: "rgba(122,166,227,0.12)",
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
  capacityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(130,220,160,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capacityText: {
    color: "#82dca0",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
  },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(130,220,160,0.15)",
    borderColor: "rgba(130,220,160,0.35)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  registeredText: {
    color: "#82dca0",
    fontSize: 12,
    fontWeight: "800",
  },
});
