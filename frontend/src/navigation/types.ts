import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Course } from "../api";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  Menu: undefined;
  CourseCatalog: undefined;
  CourseDetail: { course: Course };
  MyCourses: undefined;
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AllStudents: undefined;
  StudentDetail: { studentId: string };
  ManageCourses: undefined;
  AddEditCourse: { course?: Course } | undefined;
  CourseEnrollments: { courseId: string; courseName: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Admin: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type AdminScreenProps<T extends keyof AdminStackParamList> =
  NativeStackScreenProps<AdminStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
