import { apiSlice } from "../../store/apiSlice";
import type { 
  AdminStats, 
  AdminStudent, 
  StudentDetail, 
  Course, 
  CourseInput, 
  CourseEnrollmentsResult 
} from "../../api";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<AdminStats, void>({
      query: () => "/admin/stats",
      providesTags: ["AdminStats"],
    }),
    
    getAllStudents: builder.query<{ students: AdminStudent[] }, string | void>({
      query: (search) => search ? `/admin/students?search=${encodeURIComponent(search)}` : "/admin/students",
      providesTags: ["AdminStudent"],
    }),
    
    getStudentDetail: builder.query<{ student: StudentDetail }, string>({
      query: (studentId) => `/admin/students/${studentId}`,
      providesTags: ["AdminStudent"],
    }),
    
    createCourse: builder.mutation<{ course: Course }, CourseInput>({
      query: (input) => ({
        url: "/admin/courses",
        method: "POST",
        body: input,
      }),
      invalidatesTags: ["Course", "AdminStats"], // Bumps stats total, adds to catalog
    }),
    
    updateCourse: builder.mutation<{ course: Course }, { courseId: string; input: Partial<CourseInput> }>({
      query: ({ courseId, input }) => ({
        url: `/admin/courses/${courseId}`,
        method: "PUT",
        body: input,
      }),
      invalidatesTags: ["Course"], 
    }),
    
    deleteCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/admin/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course", "AdminStats"], // Decrements total
    }),
    
    getCourseEnrollments: builder.query<CourseEnrollmentsResult, string>({
      query: (courseId) => `/admin/courses/${courseId}/enrollments`,
      providesTags: ["AdminStudent"], 
    }),
    
    removeEnrollment: builder.mutation<void, string>({
      query: (enrollmentId) => ({
        url: `/admin/enrollments/${enrollmentId}`,
        method: "DELETE",
      }),
      // Modifies a student's schedule, so sync everything
      invalidatesTags: ["AdminStudent", "Course", "Enrollment"], 
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminStatsQuery,
  useGetAllStudentsQuery,
  useGetStudentDetailQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseEnrollmentsQuery,
  useRemoveEnrollmentMutation,
} = adminApi;
