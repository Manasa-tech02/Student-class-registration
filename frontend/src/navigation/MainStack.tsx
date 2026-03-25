import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { MainStackParamList } from "./types";
import { DashboardScreen } from "../screens/DashboardScreen";
import { CourseCatalogScreen } from "../screens/CourseCatalogScreen";
import { CourseDetailScreen } from "../screens/CourseDetailScreen";
import { MyCoursesScreen } from "../screens/MyCoursesScreen";

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#1a1a2e" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="CourseCatalog" component={CourseCatalogScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
    </Stack.Navigator>
  );
}
