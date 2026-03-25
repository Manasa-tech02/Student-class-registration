import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AdminScreenProps } from "../../navigation/types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import type { Course } from "../../api";
import { useGetCoursesQuery } from "../../features/courses/coursesApi";
import { useDeleteCourseMutation } from "../../features/admin/adminApi";

export function ManageCoursesScreen({ navigation }: AdminScreenProps<"ManageCourses">) {
  const { token } = useSelector((state: RootState) => state.auth);
  const { data, isLoading: loading, error: rtkError } = useGetCoursesQuery();
  const courses = data?.courses || [];
  const error = rtkError ? "Failed to load courses" : null;
  const [deleteCourseApi] = useDeleteCourseMutation();

  async function handleDelete(courseId: string, courseName: string) {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete "${courseName}"? This will also remove ALL student enrollments for this course.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCourseApi(courseId).unwrap();
            } catch (err: any) {
              Alert.alert("Error", err?.data?.error || err?.message || String(err));
            }
          },
        },
      ]
    );
  }

  function renderCourseItem({ item }: { item: Course }) {
    return (
      <View style={styles.courseCard}>
        <Pressable
          style={styles.courseContent}
          onPress={() => navigation.navigate("CourseEnrollments", { courseId: item.id, courseName: item.class_name })}
        >
          <Text style={styles.courseName}>{item.class_name}</Text>
          <Text style={styles.courseDetails}>
            {item.professor} • {item.duration}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>Cap: {item.capacity}</Text>
            </View>
            <View style={styles.viewBadge}>
              <Text style={styles.viewBadgeText}>View Enrollments &rarr;</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.actionColumn}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => navigation.navigate("AddEditCourse", { course: item })}
          >
            <Ionicons name="pencil" size={18} color="#7aa6e3" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
            onPress={() => handleDelete(item.id, item.class_name)}
          >
            <Ionicons name="trash" size={18} color="#ff8a8a" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#7aa6e3" />
        </Pressable>
        <Text style={styles.title}>Manage Courses</Text>
        <View style={{ width: 24 }} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && courses.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7aa6e3" />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No courses available.</Text>
          }
        />
      )}

      {/* ── Floating Add Button ── */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate("AddEditCourse")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#16213e",
  },
  backBtn: { marginRight: 16 },
  title: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },

  listContent: { padding: 16, paddingBottom: 100 },
  courseCard: {
    flexDirection: "row",
    backgroundColor: "#20203a",
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2e2e4a",
    overflow: "hidden",
  },
  courseContent: {
    flex: 1,
    padding: 16,
  },
  courseName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  courseDetails: { color: "#a0a0b8", fontSize: 13, marginTop: 4 },
  badgeRow: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  capacityBadge: {
    backgroundColor: "#16213e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  capacityText: { color: "#7a7a90", fontSize: 11, fontWeight: "600" },
  viewBadge: {
    backgroundColor: "rgba(122,166,227,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewBadgeText: { color: "#7aa6e3", fontSize: 11, fontWeight: "700" },

  actionColumn: {
    width: 50,
    backgroundColor: "#16213e",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: "#2e2e4a",
  },
  actionBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    marginVertical: 4,
  },
  actionBtnPressed: { backgroundColor: "#20203a" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#7aa6e3",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabPressed: { opacity: 0.8 },

  errorText: { color: "#ff8a8a", textAlign: "center", margin: 16 },
  emptyText: { color: "#7a7a90", textAlign: "center", marginTop: 40 },
});
