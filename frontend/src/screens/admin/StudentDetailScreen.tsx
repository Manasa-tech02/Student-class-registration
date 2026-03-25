import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useGetStudentDetailQuery } from "../../features/admin/adminApi";
import type { StudentDetail } from "../../api";

export function StudentDetailScreen({ route, navigation }: AdminScreenProps<"StudentDetail">) {
  const { studentId } = route.params;
  const { data, isLoading: loading, error: rtkError } = useGetStudentDetailQuery(studentId);
  const student = data?.student;
  const error = rtkError ? "Failed to load student tracking logic" : null;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7aa6e3" />
      </View>
    );
  }

  if (error || !student) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || "Student not found"}</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: "#7aa6e3" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  function renderCourseItem({ item }: { item: StudentDetail["enrollments"][0] }) {
    const dateStr = new Date(item.enrolled_at).toLocaleDateString();
    return (
      <View style={styles.courseCard}>
        <View style={styles.courseIcon}>
          <Ionicons name="book" size={24} color="#82dca0" />
        </View>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{item.class_name}</Text>
          <Text style={styles.courseDetails}>
            {item.professor} • {item.duration}
          </Text>
          <Text style={styles.enrolledDate}>Enrolled: {dateStr}</Text>
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
        <Text style={styles.title}>Student Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={student.enrollments}
        keyExtractor={(item) => item.enrollment_id}
        renderItem={renderCourseItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>
                {student.first_name[0]}{student.last_name[0]}
              </Text>
            </View>
            <Text style={styles.name}>{student.first_name} {student.last_name}</Text>
            <Text style={styles.email}>{student.email}</Text>
            {student.student_id && (
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>ID: {student.student_id}</Text>
              </View>
            )}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>
              Enrolled Courses ({student.enrollments.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>This student is not enrolled in any courses.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1a1a2e" },
  
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

  listContent: { paddingBottom: 40 },
  
  profileSection: {
    alignItems: "center",
    padding: 24,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(122,166,227,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarLargeText: { color: "#7aa6e3", fontSize: 28, fontWeight: "800" },
  name: { color: "#fff", fontSize: 24, fontWeight: "800" },
  email: { color: "#a0a0b8", fontSize: 15, marginTop: 4 },
  idBadge: {
    backgroundColor: "#20203a",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  idBadgeText: { color: "#d9d9d9", fontSize: 13, fontWeight: "600" },
  
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#2e2e4a",
    marginVertical: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  courseCard: {
    flexDirection: "row",
    backgroundColor: "#20203a",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(130,220,160,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  courseInfo: { flex: 1, justifyContent: "center" },
  courseName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  courseDetails: { color: "#a0a0b8", fontSize: 13, marginTop: 4 },
  enrolledDate: { color: "#7a7a90", fontSize: 11, marginTop: 6, fontStyle: "italic" },

  errorText: { color: "#ff8a8a", textAlign: "center" },
  emptyText: { color: "#7a7a90", textAlign: "center", marginTop: 20 },
});
