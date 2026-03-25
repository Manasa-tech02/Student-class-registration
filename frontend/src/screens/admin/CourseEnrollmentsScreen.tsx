import { useCallback, useState } from "react";
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
import type { CourseEnrollmentsResult } from "../../api";
import { useGetCourseEnrollmentsQuery, useRemoveEnrollmentMutation } from "../../features/admin/adminApi";

export function CourseEnrollmentsScreen({ route, navigation }: AdminScreenProps<"CourseEnrollments">) {
  const { courseId, courseName } = route.params;
  const { data, isLoading: loading, error: rtkError } = useGetCourseEnrollmentsQuery(courseId);
  const error = rtkError ? "Failed to load enrollments" : null;
  const [removeEnrollmentApi] = useRemoveEnrollmentMutation();

  async function handleRemove(enrollmentId: string, studentName: string) {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${studentName} from this course?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeEnrollmentApi(enrollmentId).unwrap();
            } catch (err: any) {
              Alert.alert("Error", err instanceof Error ? err.message : String(err));
            }
          },
        },
      ]
    );
  }

  function renderStudent({ item }: { item: CourseEnrollmentsResult["students"][0] }) {
    const dateStr = new Date(item.enrolled_at).toLocaleDateString();
    return (
      <View style={styles.studentCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
          <Text style={styles.dateText}>Enrolled: {dateStr}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
          onPress={() => handleRemove(item.enrollment_id, `${item.first_name} ${item.last_name}`)}
        >
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#7aa6e3" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{courseName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>Enrolled Students:  </Text>
        {data && (
          <Text style={styles.countText}>
            {data.enrolled_count} / {data.capacity}
          </Text>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7aa6e3" />
        </View>
      ) : (
        <FlatList
          data={data?.students ?? []}
          keyExtractor={(item) => item.enrollment_id}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No students are enrolled in this course.</Text>
          }
        />
      )}
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
  title: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },

  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#20203a",
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e4a",
  },
  subHeaderText: { color: "#a0a0b8", fontSize: 13, fontWeight: "600" },
  countText: { color: "#fff", fontSize: 14, fontWeight: "800" },

  listContent: { padding: 16, paddingBottom: 40 },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20203a",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(122,166,227,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#7aa6e3", fontSize: 14, fontWeight: "800" },
  studentInfo: { flex: 1 },
  studentName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  studentEmail: { color: "#a0a0b8", fontSize: 13, marginTop: 2 },
  dateText: { color: "#7a7a90", fontSize: 11, marginTop: 4, fontStyle: "italic" },

  removeBtn: {
    backgroundColor: "rgba(255, 138, 138, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 138, 138, 0.4)",
  },
  removeBtnPressed: { backgroundColor: "rgba(255, 138, 138, 0.25)" },
  removeBtnText: { color: "#ff8a8a", fontSize: 12, fontWeight: "700" },

  errorText: { color: "#ff8a8a", textAlign: "center", margin: 16 },
  emptyText: { color: "#7a7a90", textAlign: "center", marginTop: 40 },
});
