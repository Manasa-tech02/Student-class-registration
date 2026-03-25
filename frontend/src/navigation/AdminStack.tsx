import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { AdminStackParamList } from "./types";
import { AdminDashboardScreen } from "../screens/admin/AdminDashboardScreen";
import { AllStudentsScreen } from "../screens/admin/AllStudentsScreen";
import { StudentDetailScreen } from "../screens/admin/StudentDetailScreen";
import { ManageCoursesScreen } from "../screens/admin/ManageCoursesScreen";
import { AddEditCourseScreen } from "../screens/admin/AddEditCourseScreen";
import { CourseEnrollmentsScreen } from "../screens/admin/CourseEnrollmentsScreen";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1a1a2e" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AllStudents" component={AllStudentsScreen} />
      <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
      <Stack.Screen name="ManageCourses" component={ManageCoursesScreen} />
      <Stack.Screen name="AddEditCourse" component={AddEditCourseScreen} />
      <Stack.Screen name="CourseEnrollments" component={CourseEnrollmentsScreen} />
    </Stack.Navigator>
  );
}
