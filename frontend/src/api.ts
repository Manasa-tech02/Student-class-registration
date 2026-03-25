export type ApiErrorResponse = { error?: string; details?: unknown };

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  role: string;
  created_at: string;
};

export type Course = {
  id: string;
  class_name: string;
  professor: string;
  duration: string;
  rating: number;
  description: string;
  capacity: number;
  created_at: string;
};

export type TokenPair = { token: string; refreshToken: string };

export type EnrolledCourse = Course & {
  enrollment_id: string;
  enrolled_at: string;
};

export type AdminStats = {
  studentCount: number;
  courseCount: number;
  enrollmentCount: number;
};

export type AdminStudent = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string | null;
  created_at: string;
  enrollment_count: number;
};

export type StudentDetail = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string | null;
  role: string;
  created_at: string;
  enrollments: Array<{
    enrollment_id: string;
    enrolled_at: string;
    id: string;
    class_name: string;
    professor: string;
    duration: string;
    rating: number;
  }>;
};

export type CourseInput = {
  class_name: string;
  professor: string;
  duration: string;
  rating: number;
  description: string;
  capacity: number;
};

export type CourseEnrollmentsResult = {
  course_id: string;
  course_name: string;
  capacity: number;
  enrolled_count: number;
  students: Array<{
    enrollment_id: string;
    enrolled_at: string;
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string | null;
  }>;
};
