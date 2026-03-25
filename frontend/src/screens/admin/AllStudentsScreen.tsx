import { useEffect, useState } from "react";
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
import type { AdminScreenProps } from "../../navigation/types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useGetAllStudentsQuery } from "../../features/admin/adminApi";
import type { AdminStudent } from "../../api";

export function AllStudentsScreen({ navigation }: AdminScreenProps<"AllStudents">) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading: loading, error: rtkError } = useGetAllStudentsQuery(debouncedSearch);
  const students = data?.students || [];
  const error = rtkError ? "Failed to load students" : null;

  function renderItem({ item }: { item: AdminStudent }) {
    return (
      <Pressable
        style={({ pressed }) => [styles.rowCard, pressed && styles.rowCardPressed]}
        onPress={() => navigation.navigate("StudentDetail", { studentId: item.id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.first_name[0]}{item.last_name[0]}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.rowEmail}>{item.email}</Text>
          {item.student_id ? (
            <Text style={styles.rowId}>ID: {item.student_id}</Text>
          ) : null}
        </View>
        <View style={styles.enrollmentBadge}>
          <Text style={styles.badgeText}>{item.enrollment_count}</Text>
          <Text style={styles.badgeLabel}>Classes</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#4a4a6a" />
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#7aa6e3" />
        </Pressable>
        <Text style={styles.title}>All Students</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7a7a90" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or ID..."
          placeholderTextColor="#7a7a90"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#7a7a90" />
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && students.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7aa6e3" />
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No students found.</Text>
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
  title: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },
  
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20203a",
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", paddingVertical: 12, fontSize: 15 },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  rowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#20203a",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2e2e4a",
  },
  rowCardPressed: { backgroundColor: "#2a2a4a" },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(122,166,227,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { color: "#7aa6e3", fontSize: 16, fontWeight: "800" },
  rowInfo: { flex: 1 },
  rowName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  rowEmail: { color: "#a0a0b8", fontSize: 13, marginTop: 2 },
  rowId: { color: "#7a7a90", fontSize: 12, marginTop: 4 },
  
  enrollmentBadge: {
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#16213e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { color: "#7aa6e3", fontSize: 14, fontWeight: "800" },
  badgeLabel: { color: "#7a7a90", fontSize: 10, fontWeight: "600" },
  
  errorText: { color: "#ff8a8a", textAlign: "center", margin: 16 },
  emptyText: { color: "#7a7a90", textAlign: "center", marginTop: 40 },
});
