import { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AdminScreenProps } from "../../navigation/types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { useCreateCourseMutation, useUpdateCourseMutation } from "../../features/admin/adminApi";
import { LabeledInput } from "../../components/LabeledInput";
import { PrimaryButton } from "../../components/PrimaryButton";

export function AddEditCourseScreen({ route, navigation }: AdminScreenProps<"AddEditCourse">) {
  const { token } = useSelector((state: RootState) => state.auth);
  const existingCourse = route.params?.course;
  const isEditing = !!existingCourse;

  const [className, setClassName] = useState(existingCourse?.class_name ?? "");
  const [professor, setProfessor] = useState(existingCourse?.professor ?? "");
  const [duration, setDuration] = useState(existingCourse?.duration ?? "");
  const [rating, setRating] = useState(existingCourse?.rating?.toString() ?? "0");
  const [capacity, setCapacity] = useState(existingCourse?.capacity?.toString() ?? "");
  const [description, setDescription] = useState(existingCourse?.description ?? "");

  const [createCourseApi, { isLoading: creating }] = useCreateCourseMutation();
  const [updateCourseApi, { isLoading: updating }] = useUpdateCourseMutation();
  const submitting = creating || updating;
  const [error, setError] = useState<string | null>(null);

  const canSubmit = 
    className.trim().length > 0 &&
    professor.trim().length > 0 &&
    duration.trim().length > 0 &&
    capacity.trim().length > 0 &&
    description.trim().length > 0;

  async function handleSubmit() {
    if (!token) return;
    setError(null);
    
    try {
      const input = {
        class_name: className.trim(),
        professor: professor.trim(),
        duration: duration.trim(),
        rating: parseFloat(rating) || 0,
        capacity: parseInt(capacity, 10) || 0,
        description: description.trim(),
      };

      if (isEditing) {
        await updateCourseApi({ courseId: existingCourse.id, input }).unwrap();
      } else {
        await createCourseApi(input).unwrap();
      }
      navigation.goBack();
    } catch (err: any) {
      setError(err?.data?.error || err?.message || String(err));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="close" size={28} color="#7aa6e3" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{isEditing ? "Edit Course" : "Add Course"}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView style={styles.formContent} keyboardShouldPersistTaps="handled">
          
          <LabeledInput
            label="Class Name"
            value={className}
            onChangeText={setClassName}
            placeholder="e.g. Introduction to Computing"
          />
          <LabeledInput
            label="Professor"
            value={professor}
            onChangeText={setProfessor}
            placeholder="e.g. Dr. Alan Turing"
          />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <LabeledInput
                label="Duration"
                value={duration}
                onChangeText={setDuration}
                placeholder="e.g. 10 Weeks"
              />
            </View>
            <View style={styles.halfWidth}>
              <LabeledInput
                label="Rating (0.0 to 5.0)"
                value={rating}
                onChangeText={setRating}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <LabeledInput
            label="Max Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            placeholder="e.g. 50"
          />

          <LabeledInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter full course description..."
          />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.spacer} />
          
          <PrimaryButton
            title={submitting ? "Saving..." : "Save Course"}
            disabled={submitting || !canSubmit}
            onPress={handleSubmit}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a2e" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#16213e",
  },
  title: { flex: 1, color: "#fff", fontSize: 18, fontWeight: "700", textAlign: "center" },

  formContent: { padding: 24, flex: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: -6 },
  halfWidth: { flex: 1, paddingHorizontal: 6 },
  spacer: { height: 12 },

  errorText: {
    color: "#ff8a8a",
    marginBottom: 12,
    backgroundColor: "rgba(255, 138, 138, 0.1)",
    borderColor: "rgba(255, 138, 138, 0.4)",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: "center",
  },
});
